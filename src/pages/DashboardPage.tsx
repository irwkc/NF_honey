import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { UserRole } from '../types';
import { 
  ShoppingCart, 
  Package, 
  TrendingUp, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign
} from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { user, hasRole } = useAuth();

  // Получаем реальные данные из контекста
  const { sales, inventory, products } = useData();
  
  const todaySales = sales.filter(sale => {
    const today = new Date();
    const saleDate = new Date(sale.timestamp);
    return saleDate.toDateString() === today.toDateString();
  });
  
  const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const todayItems = todaySales.reduce((sum, sale) => sum + sale.items.length, 0);
  
  const lowStockItems = inventory.filter(inv => inv.currentStock <= inv.minStock);
  
  const topProducts = products.map(product => {
    const productSales = todaySales.flatMap(sale => 
      sale.items.filter(item => item.productId === product.id)
    );
    const totalQuantity = productSales.reduce((sum, item) => sum + item.quantity, 0);
    const totalRevenue = productSales.reduce((sum, item) => sum + item.totalPrice, 0);
    
    return {
      name: product.name,
      sales: totalQuantity,
      revenue: totalRevenue
    };
  }).filter(p => p.sales > 0).sort((a, b) => b.revenue - a.revenue).slice(0, 3);


  const getRoleSpecificContent = () => {
    if (hasRole(UserRole.ADMIN)) {
      return (
        <div className="space-y-6">
          {/* Admin Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Выручка сегодня</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {todayRevenue.toLocaleString()} ₽
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Продаж сегодня</p>
                  <p className="text-2xl font-bold text-gray-900">{todayItems}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </div>
          </div>

          {/* System Alerts */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
              Системные уведомления
            </h3>
            <div className="space-y-3">
              {lowStockItems.length > 0 ? (
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="w-4 h-4 text-orange-500 mr-2" />
                    <span className="text-sm">Низкие остатки товаров</span>
                  </div>
                  <span className="text-xs text-orange-600">{lowStockItems.length} товаров</span>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-sm">Все остатки в норме</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <a href="/products" className="card hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Управление товарами</p>
                  <p className="text-lg font-semibold text-gray-900">🍯</p>
                </div>
                <Package className="w-8 h-8 text-blue-500" />
              </div>
            </a>
            <a href="/inventory" className="card hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Управление остатками</p>
                  <p className="text-lg font-semibold text-gray-900">📦</p>
                </div>
                <Package className="w-8 h-8 text-green-500" />
              </div>
            </a>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <a href="/promotions" className="card hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Акции и подарки</p>
                  <p className="text-lg font-semibold text-gray-900">🎁</p>
                </div>
                <Package className="w-8 h-8 text-purple-500" />
              </div>
            </a>
            <a href="/users" className="card hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Пользователи</p>
                  <p className="text-lg font-semibold text-gray-900">👥</p>
                </div>
                <Users className="w-8 h-8 text-orange-500" />
              </div>
            </a>
          </div>
        </div>
      );
    }

    if (hasRole(UserRole.PROMOTER)) {
      return (
        <div className="space-y-6">
          {/* Promoter Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <a href="/sales/new" className="card hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Новая продажа</p>
                  <p className="text-lg font-semibold text-gray-900">+</p>
                </div>
                <ShoppingCart className="w-8 h-8 text-green-500" />
              </div>
            </a>
            <a href="/inventory" className="card hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Остатки</p>
                  <p className="text-lg font-semibold text-gray-900">📦</p>
                </div>
                <Package className="w-8 h-8 text-blue-500" />
              </div>
            </a>
          </div>

          {/* Today's Performance */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Сегодня</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Продаж:</span>
                <span className="font-semibold">{todayItems} товаров</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Выручка:</span>
                <span className="font-semibold text-green-600">
                  {todayRevenue.toLocaleString()} ₽
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Средний чек:</span>
                <span className="font-semibold">
                  {todayItems > 0 ? Math.round(todayRevenue / todayItems).toLocaleString() : 0} ₽
                </span>
              </div>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="card bg-blue-50">
            <h3 className="text-lg font-semibold mb-2 text-blue-900">💡 Совет дня</h3>
            <p className="text-sm text-blue-800">
              Не забудьте сделать фото товара при фасовке для контроля качества!
            </p>
          </div>
        </div>
      );
    }


    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card bg-gradient-to-r from-honey-500 to-honey-600 text-white">
        <h2 className="text-xl font-semibold mb-1">
          Панель управления
        </h2>
        <p className="text-honey-100">
          Система управления продажами New Format
        </p>
      </div>

      {/* Role-specific content */}
      {getRoleSpecificContent()}

      {/* Top Products */}
      {topProducts.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Популярные товары сегодня</h3>
          <div className="space-y-3">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-gray-600">{product.sales.toFixed(1)} кг продано</p>
                </div>
                <span className="font-semibold text-green-600">
                  {product.revenue.toLocaleString()} ₽
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
