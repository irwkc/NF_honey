import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { UserRole, User } from '../types';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  EyeOff,
  Save,
  X,
  User as UserIcon,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

const UsersPage: React.FC = () => {
  const { user, hasRole } = useAuth();
  const { locations } = useData();
  
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'Администратор',
      email: 'admin@newformat.ru',
      role: UserRole.ADMIN,
      isActive: true,
      createdAt: new Date(),
    },
    {
      id: '2',
      name: 'Мария Сидорова',
      email: 'promoter@newformat.ru',
      role: UserRole.PROMOTER,
      locationId: 'loc1',
      phone: '+7 999 765 43 21',
      isActive: true,
      createdAt: new Date(),
    },
  ]);
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<{
    name: string;
    email: string;
    role: UserRole;
    locationId: string;
    phone: string;
    isActive: boolean;
  }>({
    name: '',
    email: '',
    role: UserRole.PROMOTER,
    locationId: '',
    phone: '',
    isActive: true,
  });

  // Только администратор может управлять пользователями
  if (!hasRole(UserRole.ADMIN)) {
    return (
      <div className="card">
        <h1 className="text-xl font-semibold mb-4">Управление пользователями</h1>
        <p className="text-gray-600">Доступ запрещен</p>
      </div>
    );
  }

  const createUser = () => {
    if (!newUser.name || !newUser.email) {
      alert('Заполните все обязательные поля');
      return;
    }

    const userExists = users.find(u => u.email === newUser.email);
    if (userExists) {
      alert('Пользователь с таким email уже существует');
      return;
    }

    const user: User = {
      ...newUser,
      id: `user${Date.now()}`,
      createdAt: new Date(),
    };

    setUsers(prev => [...prev, user]);
    setShowCreateForm(false);
    setNewUser({
      name: '',
      email: '',
      role: UserRole.PROMOTER,
      locationId: '',
      phone: '',
      isActive: true,
    });
    alert('Пользователь успешно создан!');
  };

  const updateUser = (userId: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, ...updates } : user
    ));
  };

  const deleteUser = (userId: string) => {
    if (userId === user?.id) {
      alert('Нельзя удалить самого себя');
      return;
    }

    if (window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      setUsers(prev => prev.filter(u => u.id !== userId));
      alert('Пользователь удален');
    }
  };

  const toggleUserStatus = (userId: string, isActive: boolean) => {
    if (userId === user?.id) {
      alert('Нельзя деактивировать самого себя');
      return;
    }
    updateUser(userId, { isActive });
  };

  const getRoleName = (role: UserRole): string => {
    switch (role) {
      case UserRole.ADMIN: return 'Администратор';
      case UserRole.PROMOTER: return 'Промоутер';
      default: return 'Пользователь';
    }
  };

  const getRoleColor = (role: UserRole): string => {
    switch (role) {
      case UserRole.ADMIN: return 'bg-red-100 text-red-800';
      case UserRole.PROMOTER: return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLocationName = (locationId?: string): string => {
    if (!locationId) return 'Не назначена';
    const location = locations.find(l => l.id === locationId);
    return location?.name || 'Неизвестная точка';
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="card bg-gradient-to-r from-honey-500 to-honey-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold mb-2">Управление пользователями</h1>
            <p className="text-honey-100">Добавление и редактирование пользователей системы</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-secondary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Добавить пользователя
          </button>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Всего пользователей</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Администраторы</p>
              <p className="text-2xl font-bold text-red-600">
                {users.filter(u => u.role === UserRole.ADMIN).length}
              </p>
            </div>
            <UserIcon className="w-8 h-8 text-red-500" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Промоутеры</p>
              <p className="text-2xl font-bold text-blue-600">
                {users.filter(u => u.role === UserRole.PROMOTER).length}
              </p>
            </div>
            <UserIcon className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Список пользователей */}
      <div className="space-y-4">
        {users.length === 0 ? (
          <div className="card text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Пользователей пока нет</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary mt-4"
            >
              Добавить первого пользователя
            </button>
          </div>
        ) : (
          users.map(userItem => (
            <div key={userItem.id} className="card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                    <UserIcon className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{userItem.name}</h3>
                    <p className="text-sm text-gray-600">{userItem.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(userItem.role)}`}>
                    {getRoleName(userItem.role)}
                  </span>
                  {userItem.isActive ? (
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
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{getLocationName(userItem.locationId)}</span>
                </div>
                {userItem.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>{userItem.phone}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Создан: {userItem.createdAt.toLocaleDateString('ru-RU')}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => toggleUserStatus(userItem.id, !userItem.isActive)}
                    disabled={userItem.id === user?.id}
                    className={`px-3 py-1 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                      userItem.isActive 
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {userItem.isActive ? 'Деактивировать' : 'Активировать'}
                  </button>
                  <button
                    onClick={() => setEditingUser(userItem)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteUser(userItem.id)}
                    disabled={userItem.id === user?.id}
                    className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Модальное окно создания пользователя */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Добавить пользователя</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Имя пользователя *
                </label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                  className="input-field"
                  placeholder="Например: Иван Петров"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  className="input-field"
                  placeholder="user@newformat.ru"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Роль
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser(prev => ({ 
                      ...prev, 
                      role: e.target.value as UserRole 
                    }))}
                    className="input-field"
                  >
                    <option value={UserRole.PROMOTER}>Промоутер</option>
                    <option value={UserRole.ADMIN}>Администратор</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Телефон
                  </label>
                  <input
                    type="tel"
                    value={newUser.phone}
                    onChange={(e) => setNewUser(prev => ({ ...prev, phone: e.target.value }))}
                    className="input-field"
                    placeholder="+7 999 123 45 67"
                  />
                </div>
              </div>
              
              {newUser.role === UserRole.PROMOTER && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Точка продаж
                  </label>
                  <select
                    value={newUser.locationId}
                    onChange={(e) => setNewUser(prev => ({ ...prev, locationId: e.target.value }))}
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
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Статус
                </label>
                <select
                  value={newUser.isActive ? 'active' : 'inactive'}
                  onChange={(e) => setNewUser(prev => ({ ...prev, isActive: e.target.value === 'active' }))}
                  className="input-field"
                >
                  <option value="active">Активен</option>
                  <option value="inactive">Неактивен</option>
                </select>
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
                onClick={createUser}
                disabled={!newUser.name || !newUser.email}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4 mr-2 inline" />
                Создать пользователя
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
