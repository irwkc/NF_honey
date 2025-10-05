import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { UserRole, Product } from '../types';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  EyeOff,
  Save,
  X
} from 'lucide-react';

const ProductsPage: React.FC = () => {
  const { user, hasRole } = useAuth();
  const { 
    products, 
    addProduct, 
    updateProduct 
  } = useData();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    type: 'honey' | 'jam';
    category: string;
    description: string;
    basePrice: number;
    unit: 'kg' | 'g' | 'l' | 'ml';
    minWeight: number;
    maxWeight: number;
    isActive: boolean;
  }>({
    name: '',
    type: 'honey',
    category: '',
    description: '',
    basePrice: 0,
    unit: 'kg',
    minWeight: 0.1,
    maxWeight: 5,
    isActive: true,
  });
  const [newProduct, setNewProduct] = useState<{
    name: string;
    type: 'honey' | 'jam';
    category: string;
    description: string;
    basePrice: number;
    unit: 'kg' | 'g' | 'l' | 'ml';
    minWeight: number;
    maxWeight: number;
    isActive: boolean;
  }>({
    name: '',
    type: 'honey',
    category: '',
    description: '',
    basePrice: 0,
    unit: 'kg',
    minWeight: 0.1,
    maxWeight: 5,
    isActive: true,
  });

  // Только администратор может управлять товарами
  if (!hasRole(UserRole.ADMIN)) {
    return (
      <div className="card">
        <h1 className="text-xl font-semibold mb-4">Товары</h1>
        <p className="text-gray-600">Доступ запрещен</p>
      </div>
    );
  }

  const createProduct = () => {
    if (!newProduct.name || !newProduct.category || newProduct.basePrice <= 0) {
      alert('Заполните все обязательные поля');
      return;
    }

    addProduct(newProduct);
    setShowCreateForm(false);
    setNewProduct({
      name: '',
      type: 'honey',
      category: '',
      description: '',
      basePrice: 0,
      unit: 'kg',
      minWeight: 0.1,
      maxWeight: 5,
      isActive: true,
    });
    alert('Товар успешно создан!');
  };

  const updateProductStatus = (productId: string, isActive: boolean) => {
    updateProduct(productId, { isActive });
  };

  const deleteProduct = (productId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот товар?')) {
      // В реальном приложении здесь будет API вызов
      alert('Товар удален');
    }
  };

  const openEditForm = (product: Product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      type: product.type,
      category: product.category,
      description: product.description || '',
      basePrice: product.basePrice,
      unit: product.unit,
      minWeight: product.minWeight,
      maxWeight: product.maxWeight,
      isActive: product.isActive,
    });
  };

  const saveEdit = () => {
    if (!editingProduct) return;
    
    if (!editForm.name || !editForm.category || editForm.basePrice <= 0) {
      alert('Заполните все обязательные поля');
      return;
    }

    updateProduct(editingProduct.id, editForm);
    setEditingProduct(null);
    alert('Товар успешно обновлен!');
  };

  const getTypeIcon = (type: string) => {
    return type === 'honey' ? '🍯' : '🥫';
  };

  const getTypeText = (type: string) => {
    return type === 'honey' ? 'Мед' : 'Варенье';
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="card bg-gradient-to-r from-honey-500 to-honey-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold mb-2">Управление товарами</h1>
            <p className="text-honey-100">Добавление и редактирование товаров</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-secondary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Добавить товар
          </button>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Всего товаров</p>
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            </div>
            <Package className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Мед</p>
              <p className="text-2xl font-bold text-yellow-600">
                {products.filter(p => p.type === 'honey').length}
              </p>
            </div>
            <span className="text-2xl">🍯</span>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Варенье</p>
              <p className="text-2xl font-bold text-red-600">
                {products.filter(p => p.type === 'jam').length}
              </p>
            </div>
            <span className="text-2xl">🥫</span>
          </div>
        </div>
      </div>

      {/* Список товаров */}
      <div className="space-y-4">
        {products.length === 0 ? (
          <div className="card text-center py-8">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Товаров пока нет</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary mt-4"
            >
              Добавить первый товар
            </button>
          </div>
        ) : (
          products.map(product => (
            <div key={product.id} className="card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{getTypeIcon(product.type)}</span>
                  <div>
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-sm text-gray-600">
                      {getTypeText(product.type)} • {product.category}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {product.isActive ? (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center">
                      <Eye className="w-3 h-3 mr-1" />
                      Активен
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full flex items-center">
                      <EyeOff className="w-3 h-3 mr-1" />
                      Неактивен
                    </span>
                  )}
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">{product.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Цена</p>
                  <p className="font-semibold">{product.basePrice} ₽/{product.unit}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Вес</p>
                  <p className="font-semibold">
                    {product.minWeight}-{product.maxWeight} {product.unit}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  ID: {product.id}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => updateProductStatus(product.id, !product.isActive)}
                    className={`px-3 py-1 rounded text-sm ${
                      product.isActive 
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {product.isActive ? 'Деактивировать' : 'Активировать'}
                  </button>
                  <button
                    onClick={() => openEditForm(product)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Модальное окно создания товара */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Добавить товар</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Название товара *
                </label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                  className="input-field"
                  placeholder="Например: Мед липовый"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Тип товара
                  </label>
                  <select
                    value={newProduct.type}
                    onChange={(e) => setNewProduct(prev => ({ 
                      ...prev, 
                      type: e.target.value as 'honey' | 'jam' 
                    }))}
                    className="input-field"
                  >
                    <option value="honey">Мед</option>
                    <option value="jam">Варенье</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Категория *
                  </label>
                  <input
                    type="text"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                    className="input-field"
                    placeholder="Например: Цветочный мед"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Описание
                </label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                  className="input-field"
                  rows={3}
                  placeholder="Подробное описание товара..."
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Цена (₽) *
                  </label>
                  <input
                    type="number"
                    value={newProduct.basePrice}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, basePrice: parseFloat(e.target.value) || 0 }))}
                    className="input-field"
                    min="0"
                    step="0.01"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Единица измерения
                  </label>
                  <select
                    value={newProduct.unit}
                    onChange={(e) => setNewProduct(prev => ({ 
                      ...prev, 
                      unit: e.target.value as 'kg' | 'g' | 'l' | 'ml' 
                    }))}
                    className="input-field"
                  >
                    <option value="kg">кг</option>
                    <option value="g">г</option>
                    <option value="l">л</option>
                    <option value="ml">мл</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Статус
                  </label>
                  <select
                    value={newProduct.isActive ? 'active' : 'inactive'}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, isActive: e.target.value === 'active' }))}
                    className="input-field"
                  >
                    <option value="active">Активен</option>
                    <option value="inactive">Неактивен</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Мин. вес ({newProduct.unit})
                  </label>
                  <input
                    type="number"
                    value={newProduct.minWeight}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, minWeight: parseFloat(e.target.value) || 0 }))}
                    className="input-field"
                    min="0"
                    step="0.1"
                    placeholder="0.1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Макс. вес ({newProduct.unit})
                  </label>
                  <input
                    type="number"
                    value={newProduct.maxWeight}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, maxWeight: parseFloat(e.target.value) || 0 }))}
                    className="input-field"
                    min="0"
                    step="0.1"
                    placeholder="5"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCreateForm(false)}
                className="flex-1 btn-secondary"
              >
                Отмена
              </button>
              <button
                onClick={createProduct}
                disabled={!newProduct.name || !newProduct.category || newProduct.basePrice <= 0}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4 mr-2 inline" />
                Создать товар
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно редактирования товара */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Редактировать товар</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Название товара *
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="input-field"
                  placeholder="Например: Мед липовый"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Тип товара
                  </label>
                  <select
                    value={editForm.type}
                    onChange={(e) => setEditForm(prev => ({ 
                      ...prev, 
                      type: e.target.value as 'honey' | 'jam' 
                    }))}
                    className="input-field"
                  >
                    <option value="honey">Мед</option>
                    <option value="jam">Варенье</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Категория *
                  </label>
                  <input
                    type="text"
                    value={editForm.category}
                    onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                    className="input-field"
                    placeholder="Например: Цветочный мед"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Описание
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  className="input-field"
                  rows={3}
                  placeholder="Подробное описание товара..."
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Цена (₽) *
                  </label>
                  <input
                    type="number"
                    value={editForm.basePrice}
                    onChange={(e) => setEditForm(prev => ({ ...prev, basePrice: parseFloat(e.target.value) || 0 }))}
                    className="input-field"
                    min="0"
                    step="0.01"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Единица измерения
                  </label>
                  <select
                    value={editForm.unit}
                    onChange={(e) => setEditForm(prev => ({ 
                      ...prev, 
                      unit: e.target.value as 'kg' | 'g' | 'l' | 'ml' 
                    }))}
                    className="input-field"
                  >
                    <option value="kg">кг</option>
                    <option value="g">г</option>
                    <option value="l">л</option>
                    <option value="ml">мл</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Статус
                  </label>
                  <select
                    value={editForm.isActive ? 'active' : 'inactive'}
                    onChange={(e) => setEditForm(prev => ({ ...prev, isActive: e.target.value === 'active' }))}
                    className="input-field"
                  >
                    <option value="active">Активен</option>
                    <option value="inactive">Неактивен</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Мин. вес ({editForm.unit})
                  </label>
                  <input
                    type="number"
                    value={editForm.minWeight}
                    onChange={(e) => setEditForm(prev => ({ ...prev, minWeight: parseFloat(e.target.value) || 0 }))}
                    className="input-field"
                    min="0"
                    step="0.1"
                    placeholder="0.1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Макс. вес ({editForm.unit})
                  </label>
                  <input
                    type="number"
                    value={editForm.maxWeight}
                    onChange={(e) => setEditForm(prev => ({ ...prev, maxWeight: parseFloat(e.target.value) || 0 }))}
                    className="input-field"
                    min="0"
                    step="0.1"
                    placeholder="5"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setEditingProduct(null)}
                className="flex-1 btn-secondary"
              >
                Отмена
              </button>
              <button
                onClick={saveEdit}
                disabled={!editForm.name || !editForm.category || editForm.basePrice <= 0}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4 mr-2 inline" />
                Сохранить изменения
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
