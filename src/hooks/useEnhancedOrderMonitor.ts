
import { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy,
  doc,
  getDoc,
  Timestamp,
  limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

interface OrderData {
  id: string;
  user_id: string;
  user_name: string;
  user_email?: string;
  pickup: string;
  destination: string;
  pickup_coordinates: { lat: number; lng: number };
  destination_coordinates: { lat: number; lng: number };
  status: 'waiting' | 'accepted' | 'completed' | 'cancelled' | 'expired';
  assigned_driver_id: string | null;
  assigned_driver_data?: {
    name: string;
    vehicle_type: string;
    plate_number: string;
  };
  created_at: any;
  updated_at: any;
}

type RideStatus = 'idle' | 'searching' | 'driver_found' | 'driver_coming' | 'driver_arrived' | 'in_progress';

export const useEnhancedOrderMonitor = () => {
  const [currentOrder, setCurrentOrder] = useState<OrderData | null>(null);
  const [rideStatus, setRideStatus] = useState<RideStatus>('idle');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusTransitionTime, setStatusTransitionTime] = useState<number>(0);
  
  const { currentUser } = useAuth();
  const previousOrderRef = useRef<OrderData | null>(null);
  const statusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!currentUser) {
      console.log('useEnhancedOrderMonitor: No user, resetting state');
      resetState();
      return;
    }

    console.log('=== ENHANCED ORDER MONITOR INIT ===');
    console.log('User ID:', currentUser.uid);
    
    const thirtyMinutesAgo = Timestamp.fromMillis(Date.now() - 30 * 60 * 1000);
    const ordersRef = collection(db, 'orders');
    
    const userOrdersQuery = query(
      ordersRef,
      where('user_id', '==', currentUser.uid),
      where('status', 'in', ['waiting', 'accepted']),
      where('created_at', '>=', thirtyMinutesAgo),
      orderBy('created_at', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(userOrdersQuery, async (snapshot) => {
      try {
        console.log('=== ORDER SNAPSHOT UPDATE ===');
        console.log('Snapshot size:', snapshot.size);
        
        if (snapshot.empty) {
          console.log('No active orders found');
          setCurrentOrder(null);
          setRideStatus('idle');
          setLoading(false);
          return;
        }
        
        const orderDoc = snapshot.docs[0];
        const orderData = { id: orderDoc.id, ...orderDoc.data() } as OrderData;
        
        console.log('Processing order:', orderData.id, 'Status:', orderData.status);
        console.log('User name in order:', orderData.user_name);
        
        // Enhanced status management with driver data fetching
        await handleOrderStatusChange(orderData);
        
        setCurrentOrder(orderData);
        setLoading(false);
        setError(null);
        
      } catch (err) {
        console.error('Error processing order update:', err);
        setError('Gagal memproses update order');
        setLoading(false);
      }
    }, (err) => {
      console.error('Firestore listener error:', err);
      setError('Koneksi database terputus');
      setLoading(false);
    });

    return () => {
      console.log('useEnhancedOrderMonitor: Cleaning up');
      unsubscribe();
      if (statusTimeoutRef.current) {
        clearTimeout(statusTimeoutRef.current);
      }
    };
  }, [currentUser]);

  const handleOrderStatusChange = async (newOrder: OrderData) => {
    const previousOrder = previousOrderRef.current;
    
    console.log('=== ENHANCED STATUS CHANGE ANALYSIS ===');
    console.log('Previous:', previousOrder?.status, previousOrder?.id);
    console.log('New:', newOrder.status, newOrder.id);
    console.log('Driver assigned:', newOrder.assigned_driver_id);
    
    if (newOrder.status === 'waiting' && !newOrder.assigned_driver_id) {
      console.log('Order waiting for driver - showing searching status');
      setRideStatus('searching');
      setStatusTransitionTime(Date.now());
      
      // Simulate driver finding after 5-10 seconds for demo
      if (statusTimeoutRef.current) {
        clearTimeout(statusTimeoutRef.current);
      }
      
      // Auto-simulate driver acceptance for demo purposes
      statusTimeoutRef.current = setTimeout(() => {
        console.log('Demo: Simulating driver acceptance');
        // In real app, this would be done by actual driver
        // For now, we'll just wait for real driver acceptance
      }, 8000);
      
    } else if (newOrder.status === 'accepted' && newOrder.assigned_driver_id) {
      console.log('Driver assigned, fetching driver data');
      
      // Ensure we have driver data
      let driverData = newOrder.assigned_driver_data;
      
      if (!driverData && newOrder.assigned_driver_id) {
        try {
          const driverDoc = await getDoc(doc(db, 'drivers', newOrder.assigned_driver_id));
          if (driverDoc.exists()) {
            const driverInfo = driverDoc.data();
            driverData = {
              name: driverInfo.name || 'Driver',
              vehicle_type: driverInfo.vehicle_type || 'Kendaraan',
              plate_number: driverInfo.plate_number || 'Unknown'
            };
            
            // Update the order object with driver data
            newOrder.assigned_driver_data = driverData;
          }
        } catch (error) {
          console.error('Error fetching driver data:', error);
        }
      }
      
      if (driverData) {
        console.log('Setting status to driver_found with data:', driverData);
        setRideStatus('driver_found');
        setStatusTransitionTime(Date.now());
        
        // Auto-transition to driver_coming after 4 seconds
        if (statusTimeoutRef.current) {
          clearTimeout(statusTimeoutRef.current);
        }
        
        statusTimeoutRef.current = setTimeout(() => {
          console.log('Auto-transitioning to driver_coming');
          setRideStatus('driver_coming');
          setStatusTransitionTime(Date.now());
          
          // Auto-transition to driver_arrived after 10 seconds for demo
          statusTimeoutRef.current = setTimeout(() => {
            console.log('Auto-transitioning to driver_arrived');
            setRideStatus('driver_arrived');
            setStatusTransitionTime(Date.now());
          }, 10000);
        }, 4000);
      }
    }
    
    previousOrderRef.current = newOrder;
  };

  const resetState = () => {
    setCurrentOrder(null);
    setRideStatus('idle');
    setLoading(false);
    setError(null);
    setStatusTransitionTime(0);
    previousOrderRef.current = null;
    
    if (statusTimeoutRef.current) {
      clearTimeout(statusTimeoutRef.current);
    }
  };

  const manualStatusTransition = (newStatus: RideStatus) => {
    console.log('Manual status transition to:', newStatus);
    setRideStatus(newStatus);
    setStatusTransitionTime(Date.now());
    
    // Clear any pending auto-transitions
    if (statusTimeoutRef.current) {
      clearTimeout(statusTimeoutRef.current);
    }
  };

  const cancelOrder = () => {
    console.log('Cancelling current order');
    setCurrentOrder(null);
    setRideStatus('idle');
    setStatusTransitionTime(0);
    
    if (statusTimeoutRef.current) {
      clearTimeout(statusTimeoutRef.current);
    }
  };

  return {
    currentOrder,
    rideStatus,
    loading,
    error,
    statusTransitionTime,
    manualStatusTransition,
    cancelOrder,
    driverData: currentOrder?.assigned_driver_data,
    userInfo: {
      user_name: currentOrder?.user_name,
      user_email: currentOrder?.user_email
    }
  };
};
