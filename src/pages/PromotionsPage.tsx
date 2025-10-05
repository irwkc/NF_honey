import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { UserRole, Promotion, Product, Location } from '../types';
import { 
  Gift, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  MapPin,
  Percent,
  ShoppingCart,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const PromotionsPage: React.FC = () => {
  const { user, hasRole } = useAuth();
  const { 
    promotions, 
    products, 
    locations, 
    addPromotion 
  } = useData();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [newPromotion, setNewPromotion] = useState<{
    name: string;
    description: string;
    type: 'buy_x_get_y' | 'discount' | 'gift';
    conditions: Array<{
      productId: string;
      minQuantity: number;
      minAmount?: number;
    }>;
    gifts: Array<{
      productId: string;
      quantity: number;
      maxUses?: number;
    }>;
    isActive: boolean;
    startDate: string;
    endDate?: string;
    locations: string[];
  }>({
    name: '',
    description: '',
    type: 'buy_x_get_y',
    conditions: [],
    gifts: [],
    isActive: true,
    startDate: new Date().toISOString().split('T')[0],
    locations: [],
  });

  // Только администратор может управлять акциями
  if (!hasRole(UserRole.ADMIN)) {
    return (
      <div className="card">
        <h1 className="text-xl font-semibold mb-4">Акции и подарки</h1>
        <p className="text-gray-600">Доступ запрещен</p>
      </div>
    );
  }

  const addCondition = () => {
    setNewPromotion(prev => ({
      ...prev,
      conditions: [...prev.conditions, {
        productId: products[0]?.id || '',
        minQuantity: 1,
        minAmount: undefined,
      }]
    }));
  };

  const updateCondition = (index: number, field: string, value: any) => {
    setNewPromotion(prev => ({
      ...prev,
      conditions: prev.conditions.map((condition, i) => 
        i === index ? { ...condition, [field]: value } : condition
      )
    }));
  };

  const removeCondition = (index: number) => {
    setNewPromotion(prev => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index)
    }));
  };

  const addGift = () => {
    setNewPromotion(prev => ({
      ...prev,
      gifts: [...prev.gifts, {
        productId: products[0]?.id || '',
        quantity: 1,
        maxUses: undefined,
      }]
    }));
  };

  const updateGift = (index: number, field: string, value: any) => {
    setNewPromotion(prev => ({
      ...prev,
      gifts: prev.gifts.map((gift, i) => 
        i === index ? { ...gift, [field]: value } : gift
      )
    }));
  };

  const removeGift = (index: number) => {
    setNewPromotion(prev => ({
      ...prev,
      gifts: prev.gifts.filter((_, i) => i !== index)
    }));
  };

  const createPromotion = () => {
    if (!newPromotion.name || newPromotion.conditions.length === 0) {
      alert('Заполните название и условия акции');
      return;
    }

    const promotion: Omit<Promotion, 'id'> = {
      name: newPromotion.name,
      description: newPromotion.description,
      type: newPromotion.type,
      conditions: newPromotion.conditions,
      gifts: newPromotion.gifts,
      isActive: newPromotion.isActive,
      startDate: new Date(newPromotion.startDate),
      endDate: newPromotion.endDate ? new Date(newPromotion.endDate) : undefined,
      locations: newPromotion.locations,
    };

    addPromotion(promotion);
    setShowCreateForm(false);
    setNewPromotion({
      name: '',
      description: '',
      type: 'buy_x_get_y',
      conditions: [],
      gifts: [],
      isActive: true,
      startDate: new Date().toISOString().split('T')[0],
      locations: [],
    });
    alert('Акция успешно создана!');
  };

  const getPromotionTypeIcon = (type: string) => {
    switch (type) {
      case 'buy_x_get_y': return <Gift className="w-4 h-4" />;
      case 'discount': return <Percent className="w-4 h-4" />;
      case 'gift': return <ShoppingCart className="w-4 h-4" />;
      default: return <Gift className="w-4 h-4" />;
    }
  };

  const getPromotionTypeText = (type: string) => {
    switch (type) {
      case 'buy_x_get_y': return 'Покупка X - подарок Y';
      case 'discount': return 'Скидка';
      case 'gift': return 'Подарок';
      default: return 'Акция';
    }
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="card bg-gradient-to-r from-honey-500 to-honey-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold mb-2">Акции и подарки</h1>
            <p className="text-honey-100">Управление акциями и системами подарков</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-secondary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Новая акция
          </button>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Всего акций</p>
              <p className="text-2xl font-bold text-gray-900">{promotions.length}</p>
            </div>
            <Gift className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Активные</p>
              <p className="text-2xl font-bold text-green-600">
                {promotions.filter(p => p.isActive).length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Список акций */}
      <div className="space-y-4">
        {promotions.length === 0 ? (
          <div className="card text-center py-8">
            <Gift className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Акций пока нет</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary mt-4"
            >
              Создать первую акцию
            </button>
          </div>
        ) : (
          promotions.map(promotion => (
            <div key={promotion.id} className="card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  {getPromotionTypeIcon(promotion.type)}
                  <div className="ml-3">
                    <h3 className="font-semibold">{promotion.name}</h3>
                    <p className="text-sm text-gray-600">
                      {getPromotionTypeText(promotion.type)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {promotion.isActive ? (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Активна
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                      Неактивна
                    </span>
                  )}
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">{promotion.description}</p>
              
              {/* Условия */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Условия:</h4>
                <div className="space-y-2">
                  {promotion.conditions.map((condition, index) => {
                    const product = products.find(p => p.id === condition.productId);
                    return (
                      <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                        <span className="font-medium">{product?.name}</span>
                        <span className="text-gray-600">
                          {' '}от {condition.minQuantity} {product?.unit}
                          {condition.minAmount && ` или от ${condition.minAmount} ₽`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Подарки */}
              {promotion.gifts.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Подарки:</h4>
                  <div className="space-y-2">
                    {promotion.gifts.map((gift, index) => {
                      const product = products.find(p => p.id === gift.productId);
                      return (
                        <div key={index} className="text-sm bg-green-50 p-2 rounded">
                          <span className="font-medium text-green-800">{product?.name}</span>
                          <span className="text-green-600">
                            {' '}- {gift.quantity} {product?.unit}
                            {gift.maxUses && ` (макс. ${gift.maxUses} раз)`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Локации */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Действует на точках:</h4>
                <div className="flex flex-wrap gap-2">
                  {promotion.locations.map(locationId => {
                    const location = locations.find(l => l.id === locationId);
                    return (
                      <span key={locationId} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {location?.name}
                      </span>
                    );
                  })}
                </div>
              </div>
              
              {/* Даты */}
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>
                    С {promotion.startDate.toLocaleDateString('ru-RU')}
                    {promotion.endDate && ` по ${promotion.endDate.toLocaleDateString('ru-RU')}`}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingPromotion(promotion)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="text-red-600 hover:text-red-800">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Модальное окно создания акции */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Создать акцию</h3>
            
            {/* Основная информация */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Название акции
                </label>
                <input
                  type="text"
                  value={newPromotion.name}
                  onChange={(e) => setNewPromotion(prev => ({ ...prev, name: e.target.value }))}
                  className="input-field"
                  placeholder="Например: При покупке 2 кг меда - подарок 0.5 кг"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Описание
                </label>
                <textarea
                  value={newPromotion.description}
                  onChange={(e) => setNewPromotion(prev => ({ ...prev, description: e.target.value }))}
                  className="input-field"
                  rows={3}
                  placeholder="Подробное описание акции..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Тип акции
                </label>
                <select
                  value={newPromotion.type}
                  onChange={(e) => setNewPromotion(prev => ({ 
                    ...prev, 
                    type: e.target.value as 'buy_x_get_y' | 'discount' | 'gift' 
                  }))}
                  className="input-field"
                >
                  <option value="buy_x_get_y">Покупка X - подарок Y</option>
                  <option value="discount">Скидка</option>
                  <option value="gift">Подарок</option>
                </select>
              </div>
            </div>
            
            {/* Условия */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Условия акции</h4>
                <button
                  onClick={addCondition}
                  className="btn-secondary text-sm py-1 px-3"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Добавить условие
                </button>
              </div>
              
              <div className="space-y-3">
                {newPromotion.conditions.map((condition, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <select
                      value={condition.productId}
                      onChange={(e) => updateCondition(index, 'productId', e.target.value)}
                      className="flex-1 input-field text-sm"
                    >
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                    
                    <input
                      type="number"
                      value={condition.minQuantity}
                      onChange={(e) => updateCondition(index, 'minQuantity', parseFloat(e.target.value) || 0)}
                      step="0.1"
                      min="0"
                      className="w-20 input-field text-sm text-center"
                      placeholder="Кол-во"
                    />
                    
                    <span className="text-sm text-gray-600 min-w-[40px]">
                      {products.find(p => p.id === condition.productId)?.unit}
                    </span>
                    
                    <button
                      onClick={() => removeCondition(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Подарки */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Подарки</h4>
                <button
                  onClick={addGift}
                  className="btn-secondary text-sm py-1 px-3"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Добавить подарок
                </button>
              </div>
              
              <div className="space-y-3">
                {newPromotion.gifts.map((gift, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
                    <select
                      value={gift.productId}
                      onChange={(e) => updateGift(index, 'productId', e.target.value)}
                      className="flex-1 input-field text-sm"
                    >
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                    
                    <input
                      type="number"
                      value={gift.quantity}
                      onChange={(e) => updateGift(index, 'quantity', parseFloat(e.target.value) || 0)}
                      step="0.1"
                      min="0"
                      className="w-20 input-field text-sm text-center"
                      placeholder="Кол-во"
                    />
                    
                    <span className="text-sm text-gray-600 min-w-[40px]">
                      {products.find(p => p.id === gift.productId)?.unit}
                    </span>
                    
                    <button
                      onClick={() => removeGift(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Локации */}
            <div className="mb-6">
              <h4 className="font-medium mb-3">Действует на точках</h4>
              <div className="space-y-2">
                {locations.map(location => (
                  <label key={location.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newPromotion.locations.includes(location.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewPromotion(prev => ({
                            ...prev,
                            locations: [...prev.locations, location.id]
                          }));
                        } else {
                          setNewPromotion(prev => ({
                            ...prev,
                            locations: prev.locations.filter(id => id !== location.id)
                          }));
                        }
                      }}
                      className="mr-3"
                    />
                    <span className="text-sm">{location.name}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Даты */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Дата начала
                </label>
                <input
                  type="date"
                  value={newPromotion.startDate}
                  onChange={(e) => setNewPromotion(prev => ({ ...prev, startDate: e.target.value }))}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Дата окончания (необязательно)
                </label>
                <input
                  type="date"
                  value={newPromotion.endDate || ''}
                  onChange={(e) => setNewPromotion(prev => ({ ...prev, endDate: e.target.value }))}
                  className="input-field"
                />
              </div>
            </div>
            
            {/* Кнопки */}
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCreateForm(false)}
                className="flex-1 btn-secondary"
              >
                Отмена
              </button>
              <button
                onClick={createPromotion}
                disabled={!newPromotion.name || newPromotion.conditions.length === 0}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Создать акцию
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromotionsPage;
