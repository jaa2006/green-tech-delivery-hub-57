
import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy,
  doc,
  updateDoc,
  Timestamp,
  limit,
  getDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

interface AvailableOrder {
  id: string;
  user_id: string;
  user_name: string;
  user_email?: string;
  pickup: string;
  destination: string;
  pickup_coordinates: { lat: number; lng: number };
  destination_coordinates: { lat: number; lng: number };
  status: 'waiting' | 'accepted' | 'completed' | 'cancelled' | 'expired';
  created_at: any;
  expires_at: any;
}

export const useDriverOrderMonitor = () => {
  const [availableOrders, setAvailableOrders] = useState<AvailableOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setAvailableOrders([]);
      setLoading(false);
      return;
    }

    console.log('=== DRIVER ORDER MONITOR INIT ===');
    console.log('Driver ID:', currentUser.uid);
    
    // Query for waiting orders in the last 30 minutes
    const thirtyMinutesAgo = Timestamp.fromMillis(Date.now() - 30 * 60 * 1000);
    const ordersRef = collection(db, 'orders');
    
    const waitingOrdersQuery = query(
      ordersRef,
      where('status', '==', 'waiting'),
      where('created_at', '>=', thirtyMinutesAgo),
      orderBy('created_at', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(waitingOrdersQuery, (snapshot) => {
      try {
        console.log('=== DRIVER ORDER UPDATE ===');
        console.log('Available orders count:', snapshot.size);
        
        const orders = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as AvailableOrder[];

        setAvailableOrders(orders);
        setLoading(false);
        setError(null);
        
      } catch (err) {
        console.error('Error processing driver orders:', err);
        setError('Gagal memuat order tersedia');
        setLoading(false);
      }
    }, (err) => {
      console.error('Firestore listener error:', err);
      setError('Koneksi database terputus');
      setLoading(false);
    });

    return () => {
      console.log('useDriverOrderMonitor: Cleaning up');
      unsubscribe();
    };
  }, [currentUser]);

  const acceptOrder = useCallback(async (orderId: string) => {
    if (!currentUser) {
      throw new Error('Driver not authenticated');
    }

    try {
      console.log('=== DRIVER ACCEPTING ORDER ===');
      console.log('Order ID:', orderId);
      console.log('Driver ID:', currentUser.uid);

      // Get driver data
      const driverDoc = await getDoc(doc(db, 'drivers', currentUser.uid));
      if (!driverDoc.exists()) {
        throw new Error('Driver data not found');
      }

      const driverData = driverDoc.data();
      const orderRef = doc(db, 'orders', orderId);
      
      // Update order with driver assignment
      await updateDoc(orderRef, {
        status: 'accepted',
        assigned_driver_id: currentUser.uid,
        assigned_driver_data: {
          name: driverData.name || 'Driver',
          vehicle_type: driverData.vehicle_type || 'Kendaraan',
          plate_number: driverData.plate_number || 'Unknown'
        },
        updated_at: Timestamp.now(),
        accepted_at: Timestamp.now()
      });

      console.log('Order accepted successfully');
      
    } catch (error) {
      console.error('Error accepting order:', error);
      throw error;
    }
  }, [currentUser]);

  const updateOrderStatus = useCallback(async (orderId: string, status: 'driver_coming' | 'driver_arrived' | 'in_progress' | 'completed') => {
    try {
      console.log('=== UPDATING ORDER STATUS ===');
      console.log('Order ID:', orderId);
      console.log('New Status:', status);

      const orderRef = doc(db, 'orders', orderId);
      const updateData: any = {
        status,
        updated_at: Timestamp.now()
      };

      // Add timestamp for specific statuses
      if (status === 'driver_coming') {
        updateData.driver_coming_at = Timestamp.now();
      } else if (status === 'driver_arrived') {
        updateData.driver_arrived_at = Timestamp.now();
      } else if (status === 'in_progress') {
        updateData.trip_started_at = Timestamp.now();
      } else if (status === 'completed') {
        updateData.completed_at = Timestamp.now();
      }

      await updateDoc(orderRef, updateData);
      console.log('Order status updated successfully');
      
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }, []);

  return {
    availableOrders,
    loading,
    error,
    acceptOrder,
    updateOrderStatus
  };
};
