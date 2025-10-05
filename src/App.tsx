import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import MobileLayout from './components/Layout/MobileLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SalesPage from './pages/SalesPage';
import InventoryPage from './pages/InventoryPage';
import PromotionsPage from './pages/PromotionsPage';
import ProductsPage from './pages/ProductsPage';
import SettingsPage from './pages/SettingsPage';
import UsersPage from './pages/UsersPage';
import { UserRole } from './types';

// Компонент для защищенных маршрутов
const ProtectedRoute: React.FC<{ 
  children: React.ReactNode; 
  allowedRoles?: UserRole[] 
}> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-honey-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <MobileLayout>{children}</MobileLayout>;
};

// Основной компонент приложения
const AppContent: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Публичные маршруты */}
      <Route 
        path="/login" 
        element={user ? <Navigate to="/" replace /> : <LoginPage />} 
      />

      {/* Защищенные маршруты */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } 
      />

      {/* Маршруты для администратора */}
      <Route 
        path="/users" 
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <UsersPage />
          </ProtectedRoute>
        } 
      />

      {/* Маршруты для администратора */}
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <SettingsPage />
          </ProtectedRoute>
        } 
      />

      {/* Маршруты для продаж */}
      <Route 
        path="/sales" 
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.PROMOTER]}>
            <SalesPage />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/sales/new" 
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.PROMOTER]}>
            <SalesPage />
          </ProtectedRoute>
        } 
      />

      {/* Маршруты для товаров */}
      <Route 
        path="/products" 
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <ProductsPage />
          </ProtectedRoute>
        } 
      />

      {/* Маршруты для остатков */}
      <Route 
        path="/inventory" 
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.PROMOTER]}>
            <InventoryPage />
          </ProtectedRoute>
        } 
      />

      {/* Маршруты для акций */}
      <Route 
        path="/promotions" 
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <PromotionsPage />
          </ProtectedRoute>
        } 
      />

      {/* Fallback для несуществующих маршрутов */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <AppContent />
        </Router>
      </DataProvider>
    </AuthProvider>
  );
};

export default App;
