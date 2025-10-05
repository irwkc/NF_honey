// Типы пользователей и ролей
export enum UserRole {
  ADMIN = 'admin',
  PROMOTER = 'promoter'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  locationId?: string;
  phone?: string;
  isActive: boolean;
  createdAt: Date;
}

// Типы товаров
export interface Product {
  id: string;
  name: string;
  type: 'honey' | 'jam';
  category: string;
  description?: string;
  basePrice: number;
  unit: 'kg' | 'g' | 'l' | 'ml';
  minWeight: number;
  maxWeight: number;
  isActive: boolean;
  imageUrl?: string;
}

// Типы поставщиков
export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  products: SupplierProduct[];
  isActive: boolean;
}

export interface SupplierProduct {
  productId: string;
  purchasePrice: number;
  minOrderQuantity: number;
  deliveryDays: number;
}

// Типы локаций/точек продаж
export interface Location {
  id: string;
  name: string;
  address: string;
  managerId: string;
  isActive: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// Типы продаж
export interface Sale {
  id: string;
  locationId: string;
  promoterId: string;
  items: SaleItem[];
  totalAmount: number;
  paymentMethod: 'cash' | 'card' | 'transfer';
  customerInfo?: {
    name?: string;
    phone?: string;
  };
  gifts?: GiftItem[];
  photos: string[]; // Фото товара при фасовке
  timestamp: Date;
  isVerified: boolean;
  notes?: string;
}

export interface SaleItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  weight?: number; // Для меда
  volume?: number; // Для варенья
}

export interface GiftItem {
  productId: string;
  quantity: number;
  reason: string; // Причина подарка
}

// Типы остатков
export interface Inventory {
  id: string;
  locationId: string;
  productId: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  lastUpdated: Date;
  lastRestock: Date;
}

// Типы заказов поставщикам
export interface PurchaseOrder {
  id: string;
  locationId: string;
  supplierId: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: Date;
  expectedDelivery: Date;
  actualDelivery?: Date;
  notes?: string;
}

export interface PurchaseOrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

// Типы акций и подарков
export interface Promotion {
  id: string;
  name: string;
  description: string;
  type: 'buy_x_get_y' | 'discount' | 'gift';
  conditions: PromotionCondition[];
  gifts: PromotionGift[];
  isActive: boolean;
  startDate: Date;
  endDate?: Date;
  locations: string[]; // ID локаций где действует акция
}

export interface PromotionCondition {
  productId: string;
  minQuantity: number;
  minAmount?: number;
}

export interface PromotionGift {
  productId: string;
  quantity: number;
  maxUses?: number; // Максимальное количество использований
}

// Типы уведомлений
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
}

// Типы отчетов
export interface SalesReport {
  period: {
    start: Date;
    end: Date;
  };
  locationId?: string;
  promoterId?: string;
  totalSales: number;
  totalItems: number;
  topProducts: Array<{
    productId: string;
    quantity: number;
    revenue: number;
  }>;
  dailyBreakdown: Array<{
    date: Date;
    sales: number;
    items: number;
  }>;
}

// Типы для антифрод системы
export interface FraudCheck {
  id: string;
  saleId: string;
  checks: {
    weightMatch: boolean;
    priceMatch: boolean;
    photoRequired: boolean;
    timeReasonable: boolean;
  };
  riskScore: number; // 0-100
  flagged: boolean;
  reviewedBy?: string;
  reviewedAt?: Date;
  notes?: string;
}
