import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product, Location, Inventory, Sale, PurchaseOrder, Promotion, Supplier } from '../types';

interface DataContextType {
  // Товары
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  
  // Локации
  locations: Location[];
  addLocation: (location: Omit<Location, 'id'>) => void;
  updateLocation: (id: string, location: Partial<Location>) => void;
  
  // Остатки
  inventory: Inventory[];
  updateInventory: (locationId: string, productId: string, quantity: number) => void;
  getLowStockItems: () => Inventory[];
  
  // Продажи
  sales: Sale[];
  addSale: (sale: Omit<Sale, 'id'>) => void;
  
  // Заказы поставщикам
  purchaseOrders: PurchaseOrder[];
  addPurchaseOrder: (order: Omit<PurchaseOrder, 'id'>) => void;
  updatePurchaseOrder: (id: string, order: Partial<PurchaseOrder>) => void;
  
  // Акции
  promotions: Promotion[];
  addPromotion: (promotion: Omit<Promotion, 'id'>) => void;
  
  // Поставщики
  suppliers: Supplier[];
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Начальные данные (пустые массивы для реальной работы)
const initialProducts: Product[] = [];

const initialLocations: Location[] = [
  {
    id: 'loc1',
    name: 'Точка "Центр"',
    address: 'ул. Ленина, 15',
    managerId: 'admin1',
    isActive: true,
  },
];

const initialInventory: Inventory[] = [];

const initialSuppliers: Supplier[] = [];

const initialPromotions: Promotion[] = [];

interface DataProviderProps {
  children: ReactNode;
}

// Функции для работы с localStorage
const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const saveToStorage = <T,>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => 
    loadFromStorage('honeyProducts', initialProducts)
  );
  const [locations, setLocations] = useState<Location[]>(() => 
    loadFromStorage('honeyLocations', initialLocations)
  );
  const [inventory, setInventory] = useState<Inventory[]>(() => 
    loadFromStorage('honeyInventory', initialInventory)
  );
  const [sales, setSales] = useState<Sale[]>(() => 
    loadFromStorage('honeySales', [])
  );
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => 
    loadFromStorage('honeyPurchaseOrders', [])
  );
  const [promotions, setPromotions] = useState<Promotion[]>(() => 
    loadFromStorage('honeyPromotions', initialPromotions)
  );
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => 
    loadFromStorage('honeySuppliers', initialSuppliers)
  );

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...product,
      id: `prod${Date.now()}`,
    };
    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    saveToStorage('honeyProducts', updatedProducts);
  };

  const updateProduct = (id: string, product: Partial<Product>) => {
    const updatedProducts = products.map(p => p.id === id ? { ...p, ...product } : p);
    setProducts(updatedProducts);
    saveToStorage('honeyProducts', updatedProducts);
  };

  const addLocation = (location: Omit<Location, 'id'>) => {
    const newLocation: Location = {
      ...location,
      id: `loc${Date.now()}`,
    };
    const updatedLocations = [...locations, newLocation];
    setLocations(updatedLocations);
    saveToStorage('honeyLocations', updatedLocations);
  };

  const updateLocation = (id: string, location: Partial<Location>) => {
    const updatedLocations = locations.map(l => l.id === id ? { ...l, ...location } : l);
    setLocations(updatedLocations);
    saveToStorage('honeyLocations', updatedLocations);
  };

  const updateInventory = (locationId: string, productId: string, quantity: number) => {
    const updatedInventory = inventory.map(inv => 
      inv.locationId === locationId && inv.productId === productId
        ? { ...inv, currentStock: quantity, lastUpdated: new Date() }
        : inv
    );
    setInventory(updatedInventory);
    saveToStorage('honeyInventory', updatedInventory);
  };

  const getLowStockItems = () => {
    return inventory.filter(inv => inv.currentStock <= inv.minStock);
  };

  const addSale = (sale: Omit<Sale, 'id'>) => {
    const newSale: Sale = {
      ...sale,
      id: `sale${Date.now()}`,
    };
    const updatedSales = [...sales, newSale];
    setSales(updatedSales);
    saveToStorage('honeySales', updatedSales);
    
    // Обновляем остатки
    sale.items.forEach(item => {
      const currentInv = inventory.find(inv => 
        inv.locationId === sale.locationId && inv.productId === item.productId
      );
      if (currentInv) {
        updateInventory(sale.locationId, item.productId, currentInv.currentStock - item.quantity);
      }
    });
  };

  const addPurchaseOrder = (order: Omit<PurchaseOrder, 'id'>) => {
    const newOrder: PurchaseOrder = {
      ...order,
      id: `order${Date.now()}`,
    };
    const updatedOrders = [...purchaseOrders, newOrder];
    setPurchaseOrders(updatedOrders);
    saveToStorage('honeyPurchaseOrders', updatedOrders);
  };

  const updatePurchaseOrder = (id: string, order: Partial<PurchaseOrder>) => {
    const updatedOrders = purchaseOrders.map(o => o.id === id ? { ...o, ...order } : o);
    setPurchaseOrders(updatedOrders);
    saveToStorage('honeyPurchaseOrders', updatedOrders);
  };

  const addPromotion = (promotion: Omit<Promotion, 'id'>) => {
    const newPromotion: Promotion = {
      ...promotion,
      id: `promo${Date.now()}`,
    };
    const updatedPromotions = [...promotions, newPromotion];
    setPromotions(updatedPromotions);
    saveToStorage('honeyPromotions', updatedPromotions);
  };

  const addSupplier = (supplier: Omit<Supplier, 'id'>) => {
    const newSupplier: Supplier = {
      ...supplier,
      id: `sup${Date.now()}`,
    };
    const updatedSuppliers = [...suppliers, newSupplier];
    setSuppliers(updatedSuppliers);
    saveToStorage('honeySuppliers', updatedSuppliers);
  };

  const value: DataContextType = {
    products,
    addProduct,
    updateProduct,
    locations,
    addLocation,
    updateLocation,
    inventory,
    updateInventory,
    getLowStockItems,
    sales,
    addSale,
    purchaseOrders,
    addPurchaseOrder,
    updatePurchaseOrder,
    promotions,
    addPromotion,
    suppliers,
    addSupplier,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData должен использоваться внутри DataProvider');
  }
  return context;
};
