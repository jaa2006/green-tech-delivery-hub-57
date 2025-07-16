
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Rate limiting for debug calls
let lastDebugCall = 0;
const DEBUG_COOLDOWN = 30000; // 30 seconds

export const debugFirebaseOrders = async () => {
  // Rate limiting to prevent quota exhaustion
  const now = Date.now();
  if (now - lastDebugCall < DEBUG_COOLDOWN) {
    console.log('=== DEBUG RATE LIMITED ===');
    console.log('Please wait 30 seconds between debug calls to prevent quota exhaustion');
    return;
  }
  lastDebugCall = now;

  console.log('=== FIREBASE ORDERS DEBUG (OPTIMIZED) ===');
  
  try {
    // Optimized query - only get recent orders to reduce reads
    const ordersRef = collection(db, 'orders');
    const recentOrdersQuery = query(
      ordersRef,
      where('status', '==', 'waiting'),
      orderBy('created_at', 'desc'),
      limit(5) // Limit to reduce Firebase reads
    );
    
    const recentOrdersSnapshot = await getDocs(recentOrdersQuery);
    console.log('Recent waiting orders (last 5):', recentOrdersSnapshot.size);
    
    if (recentOrdersSnapshot.empty) {
      console.log('No recent waiting orders found');
      return;
    }
    
    // Log only essential data to reduce processing
    recentOrdersSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`Order ${doc.id.slice(-6)}:`, {
        status: data.status,
        pickup: data.pickup?.substring(0, 30),
        destination: data.destination?.substring(0, 30),
        has_coordinates: !!data.pickup_coordinates,
        created_minutes_ago: data.created_at ? 
          Math.round((Date.now() - data.created_at.toMillis()) / 60000) : 'unknown'
      });
    });
    
    console.log('=== OPTIMIZATION RECOMMENDATIONS ===');
    console.log('1. Ensure composite indexes exist in Firebase Console');
    console.log('2. Monitor Firebase usage in console to stay within quotas');
    console.log('3. Consider pagination for large datasets');
    
  } catch (error) {
    console.error('Error in optimized Firebase debug:', error);
    if (error.code === 'resource-exhausted') {
      console.error('QUOTA EXCEEDED - Reduce Firebase calls immediately');
    }
  }
  
  console.log('=== END OPTIMIZED DEBUG ===');
};

export const debugDriverLocation = (driverLocation: { lat: number; lng: number } | null) => {
  // Simplified location debug - no heavy processing
  if (!driverLocation) {
    console.log('Driver location: NULL - GPS issue detected');
    return;
  }
  
  console.log('Driver GPS:', {
    lat: driverLocation.lat.toFixed(4),
    lng: driverLocation.lng.toFixed(4),
    timestamp: new Date().toLocaleTimeString()
  });
};
