
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

interface UserOrder {
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
  is_fresh?: boolean;
}

export const useUserOrderStatus = () => {
  const [currentOrder, setCurrentOrder] = useState<UserOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNewOrderSession, setIsNewOrderSession] = useState(false);
  const [showSearchingPopup, setShowSearchingPopup] = useState(false);
  const [showDriverFoundPopup, setShowDriverFoundPopup] = useState(false);
  const { currentUser } = useAuth();
  
  // Use ref to track previous order status to detect changes
  const previousOrderRef = useRef<UserOrder | null>(null);

  useEffect(() => {
    if (!currentUser) {
      console.log('useUserOrderStatus: No current user, resetting states');
      setCurrentOrder(null);
      setLoading(false);
      setError(null);
      setIsNewOrderSession(false);
      setShowSearchingPopup(false);
      setShowDriverFoundPopup(false);
      return;
    }

    console.log('=== USER ORDER STATUS MONITORING ===');
    console.log('User ID:', currentUser.uid);
    
    // Query for user's recent orders (last 30 minutes)
    const thirtyMinutesAgo = Timestamp.fromMillis(Date.now() - 30 * 60 * 1000);
    const ordersRef = collection(db, 'orders');
    
    const userOrdersQuery = query(
      ordersRef,
      where('user_id', '==', currentUser.uid),
      where('status', 'in', ['waiting', 'accepted']), // Only active orders
      where('created_at', '>=', thirtyMinutesAgo),
      orderBy('created_at', 'desc'),
      limit(1)
    );

    console.log('Setting up real-time listener for user orders...');

    const unsubscribe = onSnapshot(userOrdersQuery, async (snapshot) => {
      try {
        console.log('=== USER ORDER UPDATE ===');
        console.log('Snapshot size:', snapshot.size);
        
        if (snapshot.empty) {
          console.log('No active orders found');
          setCurrentOrder(null);
          setIsNewOrderSession(false);
          setShowSearchingPopup(false);
          setShowDriverFoundPopup(false);
          setLoading(false);
          setError(null);
          return;
        }
        
        const mostRecentDoc = snapshot.docs[0];
        const orderData = mostRecentDoc.data() as Omit<UserOrder, 'id'>;
        
        console.log('=== PROCESSING USER ORDER ===');
        console.log('Order ID:', mostRecentDoc.id);
        console.log('Order Status:', orderData.status);
        console.log('Assigned Driver ID:', orderData.assigned_driver_id);
        
        let userOrder = {
          id: mostRecentDoc.id,
          ...orderData
        } as UserOrder;
        
        // Check if this is a fresh order (created in last 5 minutes)
        const fiveMinutesAgo = Timestamp.fromMillis(Date.now() - 5 * 60 * 1000);
        const isFreshOrder = orderData.created_at && orderData.created_at >= fiveMinutesAgo;
        
        console.log('Is Fresh Order:', isFreshOrder);
        setIsNewOrderSession(isFreshOrder);
        userOrder.is_fresh = isFreshOrder;
        
        // Handle popup logic based on status changes
        const previousOrder = previousOrderRef.current;
        
        if (userOrder.status === 'waiting') {
          console.log('=== ORDER STATUS: WAITING ===');
          setShowSearchingPopup(true);
          setShowDriverFoundPopup(false);
          
        } else if (userOrder.status === 'accepted') {
          console.log('=== ORDER STATUS: ACCEPTED ===');
          
          // Check if this is a status change from waiting to accepted
          const isStatusChange = !previousOrder || 
                                previousOrder.status === 'waiting' || 
                                previousOrder.id !== userOrder.id;
          
          console.log('Is status change to accepted:', isStatusChange);
          console.log('Has driver data:', !!userOrder.assigned_driver_data);
          
          // Ensure we have driver data for the popup
          if (userOrder.assigned_driver_id && !userOrder.assigned_driver_data) {
            console.log('Fetching driver data for popup...');
            
            try {
              const driverDoc = await getDoc(doc(db, 'drivers', userOrder.assigned_driver_id));
              
              if (driverDoc.exists()) {
                const driverData = driverDoc.data();
                userOrder.assigned_driver_data = {
                  name: driverData.name || 'Driver',
                  vehicle_type: driverData.vehicle_type || driverData.vehicle || 'Mobil',
                  plate_number: driverData.plate_number || driverData.vehicle_plate || driverData.plate || 'Unknown'
                };
                console.log('Driver data fetched:', userOrder.assigned_driver_data);
              }
            } catch (driverError) {
              console.error('Error fetching driver data:', driverError);
            }
          }
          
          // Show driver found popup if we have driver data and this is a status change
          if (userOrder.assigned_driver_data && isStatusChange) {
            console.log('=== SHOWING DRIVER FOUND POPUP ===');
            setShowSearchingPopup(false);
            setShowDriverFoundPopup(true);
            
            // Auto-hide driver found popup after 5 seconds
            setTimeout(() => {
              console.log('Auto-hiding driver found popup');
              setShowDriverFoundPopup(false);
            }, 5000);
          }
        }
        
        // Update refs for next comparison
        previousOrderRef.current = userOrder;
        setCurrentOrder(userOrder);
        setLoading(false);
        setError(null);
        
      } catch (err) {
        console.error('=== ERROR PROCESSING USER ORDER ===', err);
        setError('Gagal memproses data order');
        setLoading(false);
        setIsNewOrderSession(false);
        setShowSearchingPopup(false);
        setShowDriverFoundPopup(false);
      }
      
    }, (error) => {
      console.error('=== FIRESTORE LISTENER ERROR ===', error);
      
      // Enhanced error handling
      if (error.code === 'permission-denied') {
        setError('Tidak memiliki izin untuk mengakses data order. Silakan login ulang.');
      } else if (error.code === 'resource-exhausted') {
        setError('Server sedang sibuk. Silakan tunggu beberapa saat.');
      } else {
        setError('Terjadi kesalahan saat memantau status order');
      }
      
      setCurrentOrder(null);
      setIsNewOrderSession(false);
      setShowSearchingPopup(false);
      setShowDriverFoundPopup(false);
      setLoading(false);
    });

    return () => {
      console.log('useUserOrderStatus: Cleaning up listener');
      unsubscribe();
    };
  }, [currentUser]);

  const hideSearchingPopup = () => {
    console.log('Manually hiding searching popup');
    setShowSearchingPopup(false);
  };

  const hideDriverFoundPopup = () => {
    console.log('Manually hiding driver found popup');
    setShowDriverFoundPopup(false);
  };

  return {
    currentOrder,
    loading,
    error,
    isNewOrderSession,
    showSearchingPopup,
    showDriverFoundPopup,
    hideSearchingPopup,
    hideDriverFoundPopup
  };
};
