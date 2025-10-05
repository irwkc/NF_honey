import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { UserRole, Inventory, Product, Location } from '../types';
import { 
  Package, 
  AlertTriangle, 
  Plus, 
  Minus, 
  Edit, 
  CheckCircle,
  TrendingDown,
  TrendingUp,
  RefreshCw
} from 'lucide-react';

const InventoryPage: React.FC = () => {
  const { user, hasRole } = useAuth();
  const { 
    products, 
    locations, 
    inventory, 
    addInventory,
    updateInventory, 
    getLowStockItems,
    suppliers,
    addPurchaseOrder 
  } = useData();
  
  const [editingItem, setEditingItem] = useState<{ locationId: string; productId: string } | null>(null);
  const [newStock, setNewStock] = useState<number>(0);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newInventory, setNewInventory] = useState<{
    locationId: string;
    productId: string;
    currentStock: number;
    minStock: number;
  }>({
    locationId: '',
    productId: '',
    currentStock: 0,
    minStock: 5,
  });

  const lowStockItems = getLowStockItems();

  const addProductToLocation = () => {
    if (!newInventory.locationId || !newInventory.productId) {
      alert('Выберите точку и товар');
      return;
    }

    // Проверяем, не существует ли уже такой товар на этой точке
    const existingInventory = inventory.find(inv => 
      inv.locationId === newInventory.locationId && inv.productId === newInventory.productId
    );

    if (existingInventory) {
      alert('Этот товар уже есть на данной точке. Используйте редактирование для изменения количества.');
      return;
    }

    addInventory({
      locationId: newInventory.locationId,
      productId: newInventory.productId,
      currentStock: newInventory.currentStock,
      minStock: newInventory.minStock,
      maxStock: newInventory.currentStock * 2, // Максимальный остаток = текущий * 2
      lastUpdated: new Date(),
      lastRestock: new Date(),
    });

    setNewInventory({
      locationId: '',
      productId: '',
      currentStock: 0,
      minStock: 5,
    });
    setShowAddForm(false);
    alert('Товар успешно добавлен на точку!');
  };

  // Для промоутера - только просмотр остатков на своей точке
  if (hasRole(UserRole.PROMOTER)) {
    const locationInventory = inventory.filter(inv => inv.locationId === user?.locationId);
    
    return (
      <div className="space-y-6">
        <div className="card bg-gradient-to-r from-honey-500 to-honey-600 text-white">
          <h1 className="text-xl font-semibold mb-2">Остатки товаров</h1>
          <p className="text-honey-100">Текущие остатки на вашей точке</p>
        </div>

        <div className="space-y-3">
          {locationInventory.map(inv => {
            const product = products.find(p => p.id === inv.productId);
            const location = locations.find(l => l.id === inv.locationId);
            const isLowStock = inv.currentStock <= inv.minStock;
            
            if (!product) return null;
            
            return (
              <div 
                key={inv.id}
                className={`card ${isLowStock ? 'border-red-200 bg-red-50' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="font-semibold">{product.name}</h3>
                      {isLowStock && <AlertTriangle className="w-4 h-4 text-red-500 ml-2" />}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-gray-600">
                        Текущий остаток: <span className="font-medium">{inv.currentStock.toFixed(1)} {product.unit}</span>
                      </span>
                      <span className="text-gray-600">
                        Мин. остаток: <span className="font-medium">{inv.minStock} {product.unit}</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-lg font-bold ${isLowStock ? 'text-red-600' : 'text-green-600'}`}>
                      {inv.currentStock.toFixed(1)} {product.unit}
                    </div>
                    {isLowStock && (
                      <div className="text-xs text-red-600 mt-1">
                        Низкий остаток!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {lowStockItems.length > 0 && (
          <div className="card bg-orange-50 border-orange-200">
            <div className="flex items-center mb-2">
              <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
              <h3 className="font-semibold text-orange-800">Внимание!</h3>
            </div>
            <p className="text-orange-700 text-sm">
              У {lowStockItems.length} товаров заканчиваются остатки. 
              Обратитесь к администратору для пополнения.
            </p>
          </div>
        )}
      </div>
    );
  }

  // Для администратора - полное управление остатками
  const handleEditStock = (locationId: string, productId: string) => {
    const inv = inventory.find(i => i.locationId === locationId && i.productId === productId);
    setEditingItem({ locationId, productId });
    setNewStock(inv?.currentStock || 0);
  };

  const saveStock = () => {
    if (!editingItem) return;
    updateInventory(editingItem.locationId, editingItem.productId, newStock);
    setEditingItem(null);
    setNewStock(0);
  };

  const createPurchaseOrder = (inv: Inventory) => {
    const product = products.find(p => p.id === inv.productId);
    const supplier = suppliers.find(s => 
      s.products.some(sp => sp.productId === inv.productId)
    );
    
    if (!product || !supplier) return;
    
    const supplierProduct = supplier.products.find(sp => sp.productId === inv.productId);
    if (!supplierProduct) return;
    
    const orderQuantity = Math.max(
      supplierProduct.minOrderQuantity,
      inv.maxStock - inv.currentStock
    );
    
    const newOrder = {
      locationId: inv.locationId,
      supplierId: supplier.id,
      items: [{
        productId: inv.productId,
        quantity: orderQuantity,
        unitPrice: supplierProduct.purchasePrice,
        totalPrice: orderQuantity * supplierProduct.purchasePrice,
      }],
      totalAmount: orderQuantity * supplierProduct.purchasePrice,
      status: 'pending' as const,
      orderDate: new Date(),
      expectedDelivery: new Date(Date.now() + supplierProduct.deliveryDays * 24 * 60 * 60 * 1000),
      notes: `Автоматический заказ из-за низких остатков`,
    };
    
    addPurchaseOrder(newOrder);
    alert(`Заказ на ${orderQuantity} ${product.unit} ${product.name} создан!`);
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="card bg-gradient-to-r from-honey-500 to-honey-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold mb-2">Управление остатками</h1>
            <p className="text-honey-100">Контроль и пополнение товарных остатков</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-secondary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Добавить товар
          </button>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Всего товаров</p>
              <p className="text-2xl font-bold text-gray-900">{inventory.length}</p>
            </div>
            <Package className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Низкие остатки</p>
              <p className="text-2xl font-bold text-red-600">{lowStockItems.length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Критические остатки */}
      {lowStockItems.length > 0 && (
        <div className="card bg-red-50 border-red-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
              <h3 className="font-semibold text-red-800">Критические остатки</h3>
            </div>
            <span className="text-sm text-red-600">{lowStockItems.length} товаров</span>
          </div>
          
          <div className="space-y-3">
            {lowStockItems.map(inv => {
              const product = products.find(p => p.id === inv.productId);
              const location = locations.find(l => l.id === inv.locationId);
              const supplier = suppliers.find(s => 
                s.products.some(sp => sp.productId === inv.productId)
              );
              
              if (!product || !location) return null;
              
              return (
                <div key={inv.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                  <div className="flex-1">
                    <h4 className="font-medium">{product.name}</h4>
                    <p className="text-sm text-gray-600">{location.name}</p>
                    <p className="text-sm text-red-600">
                      Остаток: {inv.currentStock.toFixed(1)} {product.unit} 
                      (мин: {inv.minStock} {product.unit})
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditStock(inv.locationId, inv.productId)}
                      className="btn-secondary text-sm py-1 px-3"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Пополнить
                    </button>
                    
                    {supplier && (
                      <button
                        onClick={() => createPurchaseOrder(inv)}
                        className="btn-primary text-sm py-1 px-3"
                      >
                        Заказать
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Все остатки по локациям */}
      <div className="space-y-4">
        {locations.map(location => {
          const locationInventory = inventory.filter(inv => inv.locationId === location.id);
          
          return (
            <div key={location.id} className="card">
              <h3 className="text-lg font-semibold mb-4">{location.name}</h3>
              
              <div className="space-y-3">
                {locationInventory.map(inv => {
                  const product = products.find(p => p.id === inv.productId);
                  const isLowStock = inv.currentStock <= inv.minStock;
                  
                  if (!product) return null;
                  
                  return (
                    <div 
                      key={inv.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        isLowStock ? 'bg-red-50 border border-red-200' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          <h4 className="font-medium">{product.name}</h4>
                          {isLowStock && <AlertTriangle className="w-4 h-4 text-red-500 ml-2" />}
                        </div>
                        <p className="text-sm text-gray-600">{product.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <span>Текущий: {inv.currentStock.toFixed(1)} {product.unit}</span>
                          <span>Мин: {inv.minStock} {product.unit}</span>
                          <span>Макс: {inv.maxStock} {product.unit}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="text-right">
                          <div className={`font-bold ${isLowStock ? 'text-red-600' : 'text-green-600'}`}>
                            {inv.currentStock.toFixed(1)} {product.unit}
                          </div>
                          <div className="text-xs text-gray-500">
                            {((inv.currentStock / inv.maxStock) * 100).toFixed(0)}%
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleEditStock(inv.locationId, inv.productId)}
                          className="btn-secondary text-sm py-1 px-3"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Модальное окно редактирования остатка */}
      {editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Изменить остаток</h3>
            
            {(() => {
              const product = products.find(p => p.id === editingItem.productId);
              const location = locations.find(l => l.id === editingItem.locationId);
              return (
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Товар: {product?.name}</p>
                  <p className="text-sm text-gray-600">Точка: {location?.name}</p>
                </div>
              );
            })()}
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Новый остаток ({products.find(p => p.id === editingItem.productId)?.unit})
              </label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setNewStock(Math.max(0, newStock - 0.1))}
                  className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
                >
                  <Minus className="w-4 h-4" />
                </button>
                
                <input
                  type="number"
                  value={newStock}
                  onChange={(e) => setNewStock(parseFloat(e.target.value) || 0)}
                  step="0.1"
                  className="flex-1 input-field text-center"
                />
                
                <button
                  onClick={() => setNewStock(newStock + 0.1)}
                  className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setEditingItem(null)}
                className="flex-1 btn-secondary"
              >
                Отмена
              </button>
              <button
                onClick={saveStock}
                className="flex-1 btn-primary"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно добавления товара на точку */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Добавить товар на точку</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Точка продаж *
                </label>
                <select
                  value={newInventory.locationId}
                  onChange={(e) => setNewInventory(prev => ({ ...prev, locationId: e.target.value }))}
                  className="input-field"
                >
                  <option value="">Выберите точку</option>
                  {locations.map(location => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Товар *
                </label>
                <select
                  value={newInventory.productId}
                  onChange={(e) => setNewInventory(prev => ({ ...prev, productId: e.target.value }))}
                  className="input-field"
                >
                  <option value="">Выберите товар</option>
                  {products.filter(p => p.isActive).map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} - {product.basePrice} ₽/{product.unit}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Начальное количество
                </label>
                <input
                  type="number"
                  value={newInventory.currentStock}
                  onChange={(e) => setNewInventory(prev => ({ ...prev, currentStock: parseFloat(e.target.value) || 0 }))}
                  className="input-field"
                  min="0"
                  step="0.1"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Минимальный остаток
                </label>
                <input
                  type="number"
                  value={newInventory.minStock}
                  onChange={(e) => setNewInventory(prev => ({ ...prev, minStock: parseFloat(e.target.value) || 0 }))}
                  className="input-field"
                  min="0"
                  step="0.1"
                  placeholder="5"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 btn-secondary"
              >
                Отмена
              </button>
              <button
                onClick={addProductToLocation}
                disabled={!newInventory.locationId || !newInventory.productId}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4 mr-2 inline" />
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
