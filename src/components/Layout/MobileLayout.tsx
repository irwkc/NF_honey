import React, { ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { 
  Home, 
  ShoppingCart, 
  Package, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X,
  Gift
} from 'lucide-react';
import { useState } from 'react';

interface MobileLayoutProps {
  children: ReactNode;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  const { user, logout, hasRole } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationItems = [
    {
      name: 'Главная',
      icon: Home,
      path: '/',
      roles: [UserRole.ADMIN, UserRole.PROMOTER]
    },
    {
      name: 'Продажи',
      icon: ShoppingCart,
      path: '/sales',
      roles: [UserRole.ADMIN, UserRole.PROMOTER]
    },
    {
      name: 'Товары',
      icon: Package,
      path: '/products',
      roles: [UserRole.ADMIN]
    },
    {
      name: 'Остатки',
      icon: Package,
      path: '/inventory',
      roles: [UserRole.ADMIN, UserRole.PROMOTER]
    },
    {
      name: 'Пользователи',
      icon: Users,
      path: '/users',
      roles: [UserRole.ADMIN]
    },
    {
      name: 'Акции',
      icon: Gift,
      path: '/promotions',
      roles: [UserRole.ADMIN]
    },
    {
      name: 'Настройки',
      icon: Settings,
      path: '/settings',
      roles: [UserRole.ADMIN]
    }
  ];

  const filteredNavItems = navigationItems.filter(item => 
    item.roles.includes(user?.role || UserRole.PROMOTER)
  );

  const getRoleName = (role: UserRole): string => {
    switch (role) {
      case UserRole.ADMIN: return 'Администратор';
      case UserRole.PROMOTER: return 'Промоутер';
      default: return 'Пользователь';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">New Format</h1>
                <p className="text-xs text-gray-500">{getRoleName(user?.role || UserRole.PROMOTER)}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Выйти"
            >
              <LogOut size={20} className="text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setIsMenuOpen(false)}>
          <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl">
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Меню</h2>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-2">
                {filteredNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.path}
                      href={item.path}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Icon size={20} className="text-gray-600" />
                      <span className="text-gray-900">{item.name}</span>
                    </a>
                  );
                })}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-3 p-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-medium text-sm">
                      {user?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user?.name}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="mobile-container">
        {children}
      </main>

      {/* Bottom Navigation for Promoters */}
      {hasRole(UserRole.PROMOTER) && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
          <div className="max-w-md mx-auto px-4 py-2">
            <div className="flex justify-around">
              {filteredNavItems.slice(0, 3).map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.path}
                    href={item.path}
                    className="flex flex-col items-center space-y-1 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Icon size={20} className="text-gray-600" />
                    <span className="text-xs text-gray-600">{item.name}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </nav>
      )}
    </div>
  );
};

export default MobileLayout;
