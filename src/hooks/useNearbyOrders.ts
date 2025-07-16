
import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  doc, 
  updateDoc, 
  getDoc,
  Timestamp,
  limit 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

export interface NearbyOrder {
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
  status: string;
  assigned_driver_id: string | null;
  driver_data?: {
    name: string;
    vehicle_type: string;
    plate_number: string;
  } | null;
  created_at: any;
  distance?: number;
}

export const useNearbyOrders = (driverLocation?: { lat: number; lng: number }) => {
  const [orders, setOrders] = useState<NearbyOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  useEffect(() => {
    if (!currentUser) {
      console.log('useNearbyOrders: No current user');
      setOrders([]);
      setLoading(false);
      return;
    }

    console.log('=== ENHANCED DRIVER ORDERS MONITORING ===');
    console.log('Driver ID:', currentUser.uid);
    console.log('Driver Location:', driverLocation);

    // ENHANCED: Simplified query without orderBy to avoid composite index requirement
    const ordersRef = collection(db, 'orders');
    const waitingOrdersQuery = query(
      ordersRef,
      where('status', '==', 'waiting'),
      limit(50) // Limit to avoid excessive data transfer
    );

    console.log('Setting up enhanced real-time listener for waiting orders...');

    const unsubscribe = onSnapshot(waitingOrdersQuery, (snapshot) => {
      try {
        console.log('=== ENHANCED NEARBY ORDERS UPDATE ===');
        console.log('Snapshot size:', snapshot.size);
        console.log('Snapshot metadata - fromCache:', snapshot.metadata.fromCache);
        console.log('Snapshot metadata - hasPendingWrites:', snapshot.metadata.hasPendingWrites);

        const nearbyOrders: NearbyOrder[] = [];

        snapshot.docs.forEach(doc => {
          const data = doc.data();
          console.log('Processing order:', doc.id, 'Status:', data.status, 'Assigned:', data.assigned_driver_id);

          // Only process orders with "waiting" status and no assigned driver
          if (data.status === 'waiting' && (!data.assigned_driver_id || data.assigned_driver_id === '')) {
            const order: NearbyOrder = {
              id: doc.id,
              user_id: data.user_id || '',
              pickup: data.pickup || '',
              destination: data.destination || '',
              pickup_coordinates: data.pickup_coordinates || { lat: 0, lng: 0 },
              destination_coordinates: data.destination_coordinates || { lat: 0, lng: 0 },
              status: data.status || '',
              assigned_driver_id: data.assigned_driver_id || null,
              driver_data: data.driver_data || null,
              created_at: data.created_at
            };

            // ENHANCED: Calculate distance if driver location is available
            if (driverLocation && order.pickup_coordinates && 
                order.pickup_coordinates.lat !== 0 && order.pickup_coordinates.lng !== 0) {
              const distance = calculateDistance(
                driverLocation.lat,
                driverLocation.lng,
                order.pickup_coordinates.lat,
                order.pickup_coordinates.lng
              );
              
              order.distance = distance;
              console.log(`Order ${doc.id} distance: ${distance.toFixed(2)} km`);

              // ENHANCED: Increased radius from 5km to 15km for better coverage
              if (distance <= 15) {
                nearbyOrders.push(order);
              } else {
                console.log(`Order ${doc.id} too far: ${distance.toFixed(2)} km`);
              }
            } else {
              // ENHANCED: Include all orders if no driver location (fallback)
              console.log(`Including order ${doc.id} - no location filtering`);
              nearbyOrders.push(order);
            }
          } else {
            console.log(`Skipping order ${doc.id} - status: ${data.status}, assigned: ${data.assigned_driver_id}`);
          }
        });

        // Sort by distance (closest first), then by creation time
        nearbyOrders.sort((a, b) => {
          if (a.distance && b.distance) {
            return a.distance - b.distance;
          }
          if (a.distance && !b.distance) return -1;
          if (!a.distance && b.distance) return 1;
          
          // Sort by creation time if no distance
          if (a.created_at && b.created_at) {
            return b.created_at.seconds - a.created_at.seconds;
          }
          return 0;
        });

        console.log('=== ENHANCED FILTERING RESULTS ===');
        console.log('Total orders from query:', snapshot.size);
        console.log('Filtered nearby orders:', nearbyOrders.length);
        console.log('Driver location available:', !!driverLocation);
        
        setOrders(nearbyOrders);
        setLoading(false);
        setError(null);

      } catch (err) {
        console.error('=== ERROR PROCESSING ENHANCED NEARBY ORDERS ===', err);
        setError('Gagal memproses data order terdekat');
        setLoading(false);
      }
    }, (error) => {
      console.error('=== ENHANCED FIRESTORE LISTENER ERROR ===', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      // Enhanced error handling
      if (error.code === 'permission-denied') {
        setError('Tidak memiliki izin untuk mengakses data order. Silakan login ulang.');
      } else if (error.code === 'failed-precondition') {
        setError('Index belum siap. Silakan tunggu beberapa menit.');
      } else if (error.code === 'resource-exhausted') {
        setError('Server sedang sibuk. Silakan tunggu beberapa saat.');
      } else {
        setError('Terjadi kesalahan saat memantau order terdekat');
      }
      
      setLoading(false);
    });

    return () => {
      console.log('useNearbyOrders: Cleaning up enhanced listener');
      unsubscribe();
    };
  }, [currentUser, driverLocation]);

  const takeOrder = async (orderId: string): Promise<boolean> => {
    if (!currentUser) {
      throw new Error('Tidak ada driver yang login');
    }

    try {
      console.log('=== ENHANCED TAKING ORDER ===');
      console.log('Order ID:', orderId);
      console.log('Driver ID:', currentUser.uid);

      // ENHANCED: Get driver data with better error handling
      const driverDoc = await getDoc(doc(db, 'drivers', currentUser.uid));
      if (!driverDoc.exists()) {
        console.error('Driver data not found, checking users collection...');
        
        // Fallback to users collection
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (!userDoc.exists()) {
          throw new Error('Data driver tidak ditemukan di database');
        }
        
        const userData = userDoc.data();
        console.log('Using fallback user data:', userData);
      }

      const driverData = driverDoc.exists() ? driverDoc.data() : null;
      const driverInfo = {
        name: driverData?.name || currentUser.displayName || 'Driver',
        vehicle_type: driverData?.vehicle_type || driverData?.vehicle || 'Mobil',
        plate_number: driverData?.plate_number || driverData?.vehicle_plate || driverData?.plate || 'Unknown'
      };

      console.log('Enhanced driver data for order:', driverInfo);

      // ENHANCED: Update order with comprehensive data
      const orderRef = doc(db, 'orders', orderId);
      const updateData = {
        status: 'accepted',
        assigned_driver_id: currentUser.uid,
        assigned_driver_data: driverInfo,
        updated_at: Timestamp.now(),
        driver_accepted_at: Timestamp.now()
      };

      console.log('Enhanced update data:', updateData);
      await updateDoc(orderRef, updateData);

      console.log('=== ENHANCED ORDER TAKEN SUCCESSFULLY ===');
      console.log('Status changed to: accepted');
      console.log('Assigned driver:', currentUser.uid);
      console.log('Driver data saved:', driverInfo);

      return true;
    } catch (error: any) {
      console.error('=== ENHANCED ERROR TAKING ORDER ===', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      if (error.code === 'permission-denied') {
        throw new Error('Tidak memiliki izin untuk mengambil order ini');
      } else if (error.code === 'not-found') {
        throw new Error('Order tidak ditemukan atau sudah diambil driver lain');
      } else {
        throw new Error(`Gagal mengambil order: ${error.message}`);
      }
    }
  };

  return {
    orders,
    loading,
    error,
    takeOrder
  };
};
