
import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy,
  doc,
  getDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

export interface UserOrder {
  id: string;
  user_id: string;
  pickup: string;
  destination: string;
  status: string;
  assigned_driver_id?: string; // Standardized field name
  driver_data?: {
    name: string;
    vehicle_type: string;
    plate_number: string;
  };
  created_at: any;
}

export const useUserOrderMonitor = () => {
  const [userOrders, setUserOrders] = useState<UserOrder[]>([]);
  const [latestAcceptedOrder, setLatestAcceptedOrder] = useState<UserOrder | null>(null);
  const [showDriverPopup, setShowDriverPopup] = useState(false);
  const [showDriverComingPopup, setShowDriverComingPopup] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setUserOrders([]);
      return;
    }

    console.log('useUserOrderMonitor: Setting up listener for user orders');
    
    const ordersRef = collection(db, 'orders');
    const userOrdersQuery = query(
      ordersRef,
      where('user_id', '==', currentUser.uid),
      orderBy('created_at', 'desc')
    );

    const unsubscribe = onSnapshot(userOrdersQuery, async (snapshot) => {
      console.log('useUserOrderMonitor: Real-time update received');
      
      const orders: UserOrder[] = [];
      let newAcceptedOrder: UserOrder | null = null;
      
      for (const orderDoc of snapshot.docs) {
        const data = orderDoc.data();
        const order: UserOrder = {
          id: orderDoc.id,
          user_id: data.user_id || '',
          pickup: data.pickup_location || data.pickup || '',
          destination: data.destination || '',
          status: data.status || '',
          assigned_driver_id: data.assigned_driver_id || null, // Standardized field name
          created_at: data.created_at
        };
        
        // Enhanced validation: Check for newly accepted orders with standardized field names
        if (order.status === 'accepted' && 
            order.assigned_driver_id && 
            order.assigned_driver_id !== null &&
            order.assigned_driver_id !== undefined) {
          
          const existingOrder = userOrders.find(o => o.id === order.id);
          if (!existingOrder || existingOrder.status !== 'accepted') {
            console.log('useUserOrderMonitor: New accepted order detected with standardized fields:', order);
            
            // Fetch driver data from drivers collection
            try {
              const driverDoc = await getDoc(doc(db, 'drivers', order.assigned_driver_id));
              if (driverDoc.exists()) {
                const driverData = driverDoc.data();
                order.driver_data = {
                  name: driverData.name || 'Driver',
                  vehicle_type: driverData.vehicle_type || 'Mobil',
                  plate_number: driverData.vehicle_plate || driverData.plate_number || driverData.plate || 'Unknown'
                };
                newAcceptedOrder = order;
                console.log('useUserOrderMonitor: Driver data fetched with standardized structure:', order.driver_data);
              } else {
                console.log('useUserOrderMonitor: Driver not found, skipping popup');
              }
            } catch (error) {
              console.error('Error fetching driver data:', error);
            }
          }
        }
        
        orders.push(order);
      }

      setUserOrders(orders);
      
      // Show popup for newly accepted orders with enhanced validation
      if (newAcceptedOrder && 
          newAcceptedOrder.status === 'accepted' && 
          newAcceptedOrder.assigned_driver_id &&
          newAcceptedOrder.driver_data) {
        setLatestAcceptedOrder(newAcceptedOrder);
        setShowDriverPopup(true);
        console.log('useUserOrderMonitor: Showing driver found popup with standardized validation passed');
      }
    }, (error) => {
      console.error('useUserOrderMonitor: Error listening to user orders:', error);
    });

    return () => {
      console.log('useUserOrderMonitor: Cleaning up user orders listener');
      unsubscribe();
    };
  }, [currentUser, userOrders]);

  const closeDriverPopup = () => {
    console.log('useUserOrderMonitor: Closing driver popup, showing coming popup');
    setShowDriverPopup(false);
    setShowDriverComingPopup(true);
  };

  const closeDriverComingPopup = () => {
    console.log('useUserOrderMonitor: Closing driver coming popup');
    setShowDriverComingPopup(false);
    setLatestAcceptedOrder(null);
  };

  return {
    userOrders,
    latestAcceptedOrder,
    showDriverPopup,
    showDriverComingPopup,
    closeDriverPopup,
    closeDriverComingPopup
  };
};
