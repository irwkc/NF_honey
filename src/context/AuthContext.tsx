import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Моковые данные для демонстрации
const mockUsers: User[] = [
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
];

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Проверяем сохраненную сессию
    const savedUser = localStorage.getItem('newformat_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Ошибка при загрузке пользователя:', error);
        localStorage.removeItem('newformat_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Простая проверка пароля (в реальном приложении будет API)
    const foundUser = mockUsers.find(u => u.email === email);
    
    if (foundUser && password === '123456') { // Простой пароль для демо
      setUser(foundUser);
      localStorage.setItem('newformat_user', JSON.stringify(foundUser));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('newformat_user');
  };

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    hasRole,
    hasAnyRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
};
