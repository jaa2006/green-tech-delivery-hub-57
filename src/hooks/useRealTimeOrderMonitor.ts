
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
  pickup: string;
  destination: string;
  pickup_coordinates: {
    lat: number;
    lng: number;
  };
  destination_coordinates: {
    lat: number;
    lng: number;
  };
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

interface PopupState {
  showWaiting: boolean;
  showDriverFound: boolean;
  driverData?: OrderData['assigned_driver_data'];
}

export const useRealTimeOrderMonitor = () => {
  const [currentOrder, setCurrentOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [popupState, setPopupState] = useState<PopupState>({
    showWaiting: false,
    showDriverFound: false
  });
  
  const { currentUser } = useAuth();
  const previousOrderRef = useRef<OrderData | null>(null);
  const popupTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!currentUser) {
      console.log('useRealTimeOrderMonitor: No user, resetting state');
      resetState();
      return;
    }

    console.log('=== REAL-TIME ORDER MONITOR INIT ===');
    console.log('User ID:', currentUser.uid);
    
    // Query for user's active orders in last 30 minutes
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
          console.log('No active orders found, clearing state');
          setCurrentOrder(null);
          setPopupState({ showWaiting: false, showDriverFound: false });
          setLoading(false);
          return;
        }
        
        const orderDoc = snapshot.docs[0];
        const orderData = { id: orderDoc.id, ...orderDoc.data() } as OrderData;
        
        console.log('Processing order:', orderData.id, 'Status:', orderData.status);
        
        // Handle status transitions
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
      console.log('useRealTimeOrderMonitor: Cleaning up');
      unsubscribe();
      if (popupTimeoutRef.current) {
        clearTimeout(popupTimeoutRef.current);
      }
    };
  }, [currentUser]);

  const handleOrderStatusChange = async (newOrder: OrderData) => {
    const previousOrder = previousOrderRef.current;
    
    console.log('=== STATUS CHANGE ANALYSIS ===');
    console.log('Previous:', previousOrder?.status, previousOrder?.id);
    console.log('New:', newOrder.status, newOrder.id);
    
    if (newOrder.status === 'waiting' && !newOrder.assigned_driver_id) {
      console.log('Order is waiting, showing waiting popup');
      setPopupState({
        showWaiting: true,
        showDriverFound: false
      });
      
    } else if (newOrder.status === 'accepted' && newOrder.assigned_driver_id) {
      console.log('Order accepted by driver, fetching driver data');
      
      // Fetch or validate driver data
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
          }
        } catch (error) {
          console.error('Error fetching driver data:', error);
        }
      }
      
      if (driverData) {
        console.log('Showing driver found popup with data:', driverData);
        setPopupState({
          showWaiting: false,
          showDriverFound: true,
          driverData
        });
        
        // Auto-hide driver found popup after 8 seconds
        if (popupTimeoutRef.current) {
          clearTimeout(popupTimeoutRef.current);
        }
        
        popupTimeoutRef.current = setTimeout(() => {
          console.log('Auto-hiding driver found popup');
          setPopupState(prev => ({ ...prev, showDriverFound: false }));
        }, 8000);
      }
    }
    
    previousOrderRef.current = newOrder;
  };

  const resetState = () => {
    setCurrentOrder(null);
    setLoading(false);
    setError(null);
    setPopupState({ showWaiting: false, showDriverFound: false });
    previousOrderRef.current = null;
    
    if (popupTimeoutRef.current) {
      clearTimeout(popupTimeoutRef.current);
    }
  };

  const hideWaitingPopup = () => {
    console.log('Manually hiding waiting popup');
    setPopupState(prev => ({ ...prev, showWaiting: false }));
  };

  const hideDriverFoundPopup = () => {
    console.log('Manually hiding driver found popup');
    setPopupState(prev => ({ ...prev, showDriverFound: false }));
    
    if (popupTimeoutRef.current) {
      clearTimeout(popupTimeoutRef.current);
    }
  };

  return {
    currentOrder,
    loading,
    error,
    showWaitingPopup: popupState.showWaiting,
    showDriverFoundPopup: popupState.showDriverFound,
    driverData: popupState.driverData,
    hideWaitingPopup,
    hideDriverFoundPopup
  };
};
