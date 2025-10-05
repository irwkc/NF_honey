import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { UserRole, Sale, SaleItem, GiftItem, Product, Inventory, Promotion } from '../types';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Camera, 
  CheckCircle, 
  AlertTriangle,
  Gift,
  Calculator,
  Scale
} from 'lucide-react';
import CameraModal from '../components/CameraModal';

const SalesPage: React.FC = () => {
  const { user, hasRole } = useAuth();
  const { products, inventory, addSale, promotions } = useData();
  const [currentSale, setCurrentSale] = useState<{
    items: SaleItem[];
    gifts: GiftItem[];
    paymentMethod: 'cash' | 'card' | 'transfer';
    customerInfo: { name?: string; phone?: string };
    photos: string[];
    notes?: string;
  }>({
    items: [],
    gifts: [],
    paymentMethod: 'cash',
    customerInfo: {},
    photos: [],
  });

  const [showCamera, setShowCamera] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Получаем товары доступные на текущей точке
  const availableProducts = products.filter((product: Product) => {
    const inv = inventory.find((i: Inventory) => 
      i.locationId === user?.locationId && 
      i.productId === product.id && 
      i.currentStock > 0
    );
    return inv && product.isActive;
  });

  const addToCart = (productId: string) => {
    const product = products.find((p: Product) => p.id === productId);
    if (!product) return;

    const existingItem = currentSale.items.find(item => item.productId === productId);
    
    if (existingItem) {
      setCurrentSale(prev => ({
        ...prev,
        items: prev.items.map(item =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 0.1, totalPrice: (item.quantity + 0.1) * item.unitPrice }
            : item
        )
      }));
    } else {
      const newItem: SaleItem = {
        productId,
        quantity: 0.1,
        unitPrice: product.basePrice,
        totalPrice: product.basePrice * 0.1,
      };
      setCurrentSale(prev => ({
        ...prev,
        items: [...prev.items, newItem]
      }));
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCurrentSale(prev => ({
        ...prev,
        items: prev.items.filter(item => item.productId !== productId)
      }));
      return;
    }

    setCurrentSale(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.productId === productId
          ? { ...item, quantity, totalPrice: quantity * item.unitPrice }
          : item
      )
    }));
  };

  const calculateGifts = () => {
    const newGifts: GiftItem[] = [];
    
    promotions.forEach((promotion: Promotion) => {
      if (!promotion.isActive) return;
      
      promotion.conditions.forEach((condition: any) => {
        const item = currentSale.items.find(i => i.productId === condition.productId);
        if (item && item.quantity >= condition.minQuantity) {
          promotion.gifts.forEach((gift: any) => {
            newGifts.push({
              productId: gift.productId,
              quantity: gift.quantity,
              reason: `Акция: ${promotion.name}`
            });
          });
        }
      });
    });
    
    setCurrentSale(prev => ({ ...prev, gifts: newGifts }));
  };

  const takePhoto = () => {
    setShowCamera(true);
  };

  const capturePhoto = (imageDataUrl: string) => {
    setCurrentSale(prev => ({
      ...prev,
      photos: [...prev.photos, imageDataUrl]
    }));
    setShowCamera(false);
  };

  const processSale = async () => {
    if (currentSale.items.length === 0) return;
    if (currentSale.photos.length === 0) {
      alert('Необходимо сделать фото товара!');
      return;
    }

    setIsProcessing(true);
    
    // Имитация обработки
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const totalAmount = currentSale.items.reduce((sum, item) => sum + item.totalPrice, 0);
    
    const newSale: Omit<Sale, 'id'> = {
      locationId: user?.locationId || 'loc1',
      promoterId: user?.id || '',
      items: currentSale.items,
      totalAmount,
      paymentMethod: currentSale.paymentMethod,
      customerInfo: currentSale.customerInfo,
      gifts: currentSale.gifts,
      photos: currentSale.photos,
      timestamp: new Date(),
      isVerified: false,
      notes: currentSale.notes,
    };

    addSale(newSale);
    
    // Сброс формы
    setCurrentSale({
      items: [],
      gifts: [],
      paymentMethod: 'cash',
      customerInfo: {},
      photos: [],
    });
    
    setIsProcessing(false);
    alert('Продажа успешно оформлена!');
  };

  const totalAmount = currentSale.items.reduce((sum, item) => sum + item.totalPrice, 0);

  if (hasRole(UserRole.ADMIN)) {
    return (
      <div className="space-y-6">
        <div className="card">
          <h1 className="text-xl font-semibold mb-4">Продажи</h1>
          <p className="text-gray-600">Просмотр всех продаж системы</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="card bg-gradient-to-r from-honey-500 to-honey-600 text-white">
        <h1 className="text-xl font-semibold mb-2">Новая продажа</h1>
        <p className="text-honey-100">Выберите товары и оформите продажу</p>
      </div>

      {/* Товары */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Доступные товары</h2>
        <div className="grid grid-cols-2 gap-3">
          {availableProducts.map((product: Product) => {
            const inv = inventory.find((i: Inventory) => 
              i.locationId === user?.locationId && i.productId === product.id
            );
            const isLowStock = inv && inv.currentStock <= inv.minStock;
            
            return (
              <div 
                key={product.id}
                className={`p-3 rounded-lg border-2 ${
                  isLowStock ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-sm">{product.name}</h3>
                  {isLowStock && <AlertTriangle className="w-4 h-4 text-red-500" />}
                </div>
                <p className="text-xs text-gray-600 mb-2">{product.description}</p>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">{product.basePrice} ₽/{product.unit}</span>
                  <span className="text-xs text-gray-500">
                    Остаток: {inv?.currentStock.toFixed(1)} {product.unit}
                  </span>
                </div>
                <button
                  onClick={() => addToCart(product.id)}
                  className="w-full btn-honey text-sm py-1"
                >
                  Добавить
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Корзина */}
      {currentSale.items.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <ShoppingCart className="w-5 h-5 mr-2" />
            Корзина
          </h2>
          
          <div className="space-y-3">
            {currentSale.items.map(item => {
              const product = products.find((p: Product) => p.id === item.productId);
              if (!product) return null;
              
              return (
                <div key={item.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium">{product.name}</h3>
                    <p className="text-sm text-gray-600">{item.unitPrice} ₽/{product.unit}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 0.1)}
                      className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    
                    <div className="text-center min-w-[60px]">
                      <div className="font-medium">{item.quantity.toFixed(1)} {product.unit}</div>
                      <div className="text-sm text-gray-600">{item.totalPrice.toFixed(0)} ₽</div>
                    </div>
                    
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 0.1)}
                      className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Подарки */}
          {currentSale.gifts.length > 0 && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2 flex items-center">
                <Gift className="w-4 h-4 mr-1" />
                Подарки
              </h3>
              {currentSale.gifts.map((gift, index) => {
                const product = products.find((p: Product) => p.id === gift.productId);
                return (
                  <div key={index} className="text-sm text-green-700">
                    {product?.name} - {gift.quantity} {product?.unit} ({gift.reason})
                  </div>
                );
              })}
            </div>
          )}

          {/* Итого */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Итого:</span>
              <span className="text-xl font-bold text-green-600">{totalAmount.toFixed(0)} ₽</span>
            </div>
          </div>
        </div>
      )}

      {/* Фото товара */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Camera className="w-5 h-5 mr-2" />
          Фото товара (обязательно)
        </h2>
        
        {currentSale.photos.length === 0 ? (
          <div className="text-center py-8">
            <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Сделайте фото товара для контроля качества</p>
            <button
              onClick={takePhoto}
              className="btn-primary"
            >
              Сделать фото
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {currentSale.photos.map((photo, index) => (
                <div key={index} className="relative">
                  <img
                    src={photo}
                    alt={`Фото товара ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <div className="absolute top-1 right-1">
                    <CheckCircle className="w-4 h-4 text-green-500 bg-white rounded-full" />
                  </div>
                  <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    Фото {index + 1}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={takePhoto}
              className="w-full btn-secondary"
            >
              Добавить еще фото
            </button>
          </div>
        )}
      </div>

      {/* Способ оплаты */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Способ оплаты</h2>
        <div className="space-y-2">
          {(['cash', 'card', 'transfer'] as const).map(method => (
            <label key={method} className="flex items-center">
              <input
                type="radio"
                name="payment"
                value={method}
                checked={currentSale.paymentMethod === method}
                onChange={(e) => setCurrentSale(prev => ({ 
                  ...prev, 
                  paymentMethod: e.target.value as 'cash' | 'card' | 'transfer' 
                }))}
                className="mr-3"
              />
              <span>
                {method === 'cash' && 'Наличные'}
                {method === 'card' && 'Карта'}
                {method === 'transfer' && 'Перевод'}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Кнопки действий */}
      <div className="space-y-3">
        {currentSale.items.length > 0 && (
          <button
            onClick={calculateGifts}
            className="w-full btn-secondary"
          >
            <Calculator className="w-4 h-4 mr-2 inline" />
            Проверить акции
          </button>
        )}
        
        <button
          onClick={processSale}
          disabled={currentSale.items.length === 0 || currentSale.photos.length === 0 || isProcessing}
          className="w-full btn-honey disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Обработка...' : 'Оформить продажу'}
        </button>
      </div>

      {/* Реальная камера */}
      {showCamera && (
        <CameraModal 
          onCapture={capturePhoto} 
          onClose={() => setShowCamera(false)} 
        />
      )}
    </div>
  );
};

export default SalesPage;
