
import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  updateDoc, 
  doc, 
  serverTimestamp,
  orderBy 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

export interface Order {
  id: string;
  user_id: string;
  pickup_location: string;
  destination: string;
  status: 'pending' | 'accepted' | 'on_the_way' | 'done' | 'cancelled';
  created_at: any;
  assigned_driver_id?: string;
  distance?: number;
  est_time?: string;
  pickup_coordinates?: {
    lat: number;
    lng: number;
  };
  destination_coordinates?: {
    lat: number;
    lng: number;
  };
  rejected_by?: string[];
}

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();

  // Create new order (for users)
  const createOrder = async (orderData: {
    pickup_location: string;
    destination: string;
    distance?: number;
    est_time?: string;
    pickup_coordinates?: { lat: number; lng: number };
    destination_coordinates?: { lat: number; lng: number };
  }) => {
    if (!currentUser) throw new Error('User not authenticated');

    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, 'orders'), {
        user_id: currentUser.uid,
        pickup_location: orderData.pickup_location,
        destination: orderData.destination,
        status: 'pending',
        created_at: serverTimestamp(),
        assigned_driver_id: null,
        distance: orderData.distance || 0,
        est_time: orderData.est_time || '0 min',
        pickup_coordinates: orderData.pickup_coordinates,
        destination_coordinates: orderData.destination_coordinates,
        rejected_by: []
      });
      
      console.log('Order created with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Accept order (for drivers)
  const acceptOrder = async (orderId: string) => {
    if (!currentUser) throw new Error('Driver not authenticated');

    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'accepted',
        assigned_driver_id: currentUser.uid
      });
      console.log('Order accepted:', orderId);
    } catch (error) {
      console.error('Error accepting order:', error);
      throw error;
    }
  };

  // Reject order (for drivers)
  const rejectOrder = async (orderId: string) => {
    if (!currentUser) throw new Error('Driver not authenticated');

    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        rejected_by: [...(orders.find(o => o.id === orderId)?.rejected_by || []), currentUser.uid]
      });
      console.log('Order rejected:', orderId);
    } catch (error) {
      console.error('Error rejecting order:', error);
      throw error;
    }
  };

  // Update order status (for drivers)
  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status
      });
      console.log('Order status updated:', orderId, status);
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  };

  return {
    orders,
    loading,
    createOrder,
    acceptOrder,
    rejectOrder,
    updateOrderStatus
  };
};

// Hook for drivers to listen to pending orders
export const usePendingOrders = () => {
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    const ordersRef = collection(db, 'orders');
    const pendingQuery = query(
      ordersRef,
      where('status', '==', 'pending'),
      orderBy('created_at', 'desc')
    );

    const unsubscribe = onSnapshot(pendingQuery, (snapshot) => {
      const orders: Order[] = [];
      
      snapshot.docChanges().forEach((change) => {
        const orderData = { id: change.doc.id, ...change.doc.data() } as Order;
        
        // Filter out orders rejected by current driver
        if (!orderData.rejected_by?.includes(currentUser.uid)) {
          if (change.type === 'added') {
            console.log('New pending order:', orderData);
          }
          orders.push(orderData);
        }
      });

      setPendingOrders(orders);
    }, (error) => {
      console.error('Error listening to pending orders:', error);
    });

    return () => unsubscribe();
  }, [currentUser]);

  return pendingOrders;
};

// Hook for users to listen to their orders
export const useUserOrders = () => {
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    const ordersRef = collection(db, 'orders');
    const userOrdersQuery = query(
      ordersRef,
      where('user_id', '==', currentUser.uid),
      orderBy('created_at', 'desc')
    );

    const unsubscribe = onSnapshot(userOrdersQuery, (snapshot) => {
      const orders: Order[] = [];
      
      snapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() } as Order);
      });

      setUserOrders(orders);
    });

    return () => unsubscribe();
  }, [currentUser]);

  return userOrders;
};
