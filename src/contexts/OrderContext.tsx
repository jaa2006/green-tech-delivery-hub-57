
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  restaurant: string;
  image: string;
  quantity: number;
}

interface Order {
  id: string;
  items: OrderItem[];
  restaurant: string;
  total: number;
  status: 'preparing' | 'delivered' | 'cancelled';
  date: string;
  time: string;
  address: string;
  paymentMethod: string;
  image: string;
}

interface OrderContextType {
  orders: Order[];
  addOrder: (orderData: Omit<Order, 'id' | 'date' | 'time' | 'status'>) => void;
  getOrderCount: () => number;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};

interface OrderProviderProps {
  children: ReactNode;
}

export const OrderProvider = ({ children }: OrderProviderProps) => {
  const [orders, setOrders] = useState<Order[]>([]);

  const addOrder = (orderData: Omit<Order, 'id' | 'date' | 'time' | 'status'>) => {
    const now = new Date();
    const newOrder: Order = {
      ...orderData,
      id: `ORD-${Date.now()}`,
      date: now.toLocaleDateString('id-ID'),
      time: now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      status: 'preparing'
    };
    
    setOrders(prevOrders => [newOrder, ...prevOrders]);
  };

  const getOrderCount = () => {
    return orders.length;
  };

  return (
    <OrderContext.Provider value={{
      orders,
      addOrder,
      getOrderCount
    }}>
      {children}
    </OrderContext.Provider>
  );
};
