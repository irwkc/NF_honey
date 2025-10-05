import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { UserRole } from '../types';
import { 
  Settings, 
  Save, 
  Bell, 
  Shield, 
  Database,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';

const SettingsPage: React.FC = () => {
  const { user, hasRole } = useAuth();
  const { locations, addLocation, updateLocation } = useData();
  
  const [settings, setSettings] = useState({
    companyName: 'New Format',
    companyAddress: 'ул. Ленина, 15',
    companyPhone: '+7 (999) 123-45-67',
    companyEmail: 'info@newformat.ru',
    lowStockThreshold: 5,
    autoBackup: true,
    notifications: {
      lowStock: true,
      newSales: true,
      systemAlerts: true,
    },
    security: {
      requirePhoto: true,
      requireWeight: true,
      auditLog: true,
    }
  });

  const [newLocation, setNewLocation] = useState({
    name: '',
    address: '',
    isActive: true,
  });

  const [showLocationForm, setShowLocationForm] = useState(false);

  // Только администратор может управлять настройками
  if (!hasRole(UserRole.ADMIN)) {
    return (
      <div className="card">
        <h1 className="text-xl font-semibold mb-4">Настройки</h1>
        <p className="text-gray-600">Доступ запрещен</p>
      </div>
    );
  }

  const saveSettings = () => {
    // В реальном приложении здесь будет API вызов
    localStorage.setItem('honeySettings', JSON.stringify(settings));
    alert('Настройки сохранены!');
  };

  const addNewLocation = () => {
    if (!newLocation.name || !newLocation.address) {
      alert('Заполните все поля');
      return;
    }

    addLocation({
      ...newLocation,
      managerId: user?.id || 'admin1',
    });
    
    setNewLocation({ name: '', address: '', isActive: true });
    setShowLocationForm(false);
    alert('Точка продаж добавлена!');
  };

  const toggleLocationStatus = (locationId: string, isActive: boolean) => {
    updateLocation(locationId, { isActive });
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="card bg-gradient-to-r from-honey-500 to-honey-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold mb-2">Настройки системы</h1>
            <p className="text-honey-100">Управление параметрами и конфигурацией</p>
          </div>
          <Settings className="w-8 h-8" />
        </div>
      </div>

      {/* Информация о компании */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Info className="w-5 h-5 text-blue-500 mr-2" />
          Информация о компании
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название компании
            </label>
            <input
              type="text"
              value={settings.companyName}
              onChange={(e) => setSettings(prev => ({ ...prev, companyName: e.target.value }))}
              className="input-field"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Адрес
            </label>
            <input
              type="text"
              value={settings.companyAddress}
              onChange={(e) => setSettings(prev => ({ ...prev, companyAddress: e.target.value }))}
              className="input-field"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Телефон
              </label>
              <input
                type="tel"
                value={settings.companyPhone}
                onChange={(e) => setSettings(prev => ({ ...prev, companyPhone: e.target.value }))}
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={settings.companyEmail}
                onChange={(e) => setSettings(prev => ({ ...prev, companyEmail: e.target.value }))}
                className="input-field"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Управление точками продаж */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Database className="w-5 h-5 text-green-500 mr-2" />
            Точки продаж
          </h3>
          <button
            onClick={() => setShowLocationForm(true)}
            className="btn-primary"
          >
            Добавить точку
          </button>
        </div>
        
        <div className="space-y-3">
          {locations.length === 0 ? (
            <p className="text-gray-600 text-center py-4">Точек продаж пока нет</p>
          ) : (
            locations.map(location => (
              <div key={location.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{location.name}</p>
                  <p className="text-sm text-gray-600">{location.address}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {location.isActive ? (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Активна
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                      Неактивна
                    </span>
                  )}
                  <button
                    onClick={() => toggleLocationStatus(location.id, !location.isActive)}
                    className={`px-3 py-1 rounded text-sm ${
                      location.isActive 
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {location.isActive ? 'Деактивировать' : 'Активировать'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Настройки уведомлений */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Bell className="w-5 h-5 text-yellow-500 mr-2" />
          Уведомления
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Низкие остатки</p>
              <p className="text-sm text-gray-600">Уведомления о товарах с низкими остатками</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.lowStock}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, lowStock: e.target.checked }
                }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Новые продажи</p>
              <p className="text-sm text-gray-600">Уведомления о новых продажах</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.newSales}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, newSales: e.target.checked }
                }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Системные уведомления</p>
              <p className="text-sm text-gray-600">Важные системные сообщения</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.systemAlerts}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, systemAlerts: e.target.checked }
                }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Настройки безопасности */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Shield className="w-5 h-5 text-red-500 mr-2" />
          Безопасность и контроль
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Обязательные фото</p>
              <p className="text-sm text-gray-600">Требовать фото товара при продаже</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.security.requirePhoto}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  security: { ...prev.security, requirePhoto: e.target.checked }
                }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Контроль веса</p>
              <p className="text-sm text-gray-600">Обязательное взвешивание товара</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.security.requireWeight}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  security: { ...prev.security, requireWeight: e.target.checked }
                }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Журнал аудита</p>
              <p className="text-sm text-gray-600">Ведение лога всех действий</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.security.auditLog}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  security: { ...prev.security, auditLog: e.target.checked }
                }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Кнопка сохранения */}
      <div className="card">
        <button
          onClick={saveSettings}
          className="w-full btn-primary"
        >
          <Save className="w-4 h-4 mr-2 inline" />
          Сохранить все настройки
        </button>
      </div>

      {/* Модальное окно добавления точки */}
      {showLocationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Добавить точку продаж</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Название точки *
                </label>
                <input
                  type="text"
                  value={newLocation.name}
                  onChange={(e) => setNewLocation(prev => ({ ...prev, name: e.target.value }))}
                  className="input-field"
                  placeholder="Например: Точка 'Центр'"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Адрес *
                </label>
                <input
                  type="text"
                  value={newLocation.address}
                  onChange={(e) => setNewLocation(prev => ({ ...prev, address: e.target.value }))}
                  className="input-field"
                  placeholder="Например: ул. Ленина, 15"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowLocationForm(false)}
                className="flex-1 btn-secondary"
              >
                Отмена
              </button>
              <button
                onClick={addNewLocation}
                disabled={!newLocation.name || !newLocation.address}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
