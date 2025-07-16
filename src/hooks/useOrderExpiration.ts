
import { useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

export const useOrderExpiration = () => {
  const { currentUser } = useAuth();

  useEffect(() => {
    const checkAndExpireOrders = async () => {
      if (!currentUser) return;

      try {
        console.log('useOrderExpiration: Checking for expired orders for user:', currentUser.uid);
        
        // Calculate timestamp for 30 minutes ago
        const thirtyMinutesAgo = Timestamp.fromMillis(Date.now() - 30 * 60 * 1000);
        
        // Query for waiting orders older than 30 minutes
        const ordersRef = collection(db, 'orders');
        const expiredOrdersQuery = query(
          ordersRef,
          where('user_id', '==', currentUser.uid),
          where('status', '==', 'waiting'),
          where('created_at', '<', thirtyMinutesAgo)
        );

        const querySnapshot = await getDocs(expiredOrdersQuery);
        
        if (!querySnapshot.empty) {
          console.log(`useOrderExpiration: Found ${querySnapshot.size} expired orders to update`);
          
          // Update each expired order
          const updatePromises = querySnapshot.docs.map(async (orderDoc) => {
            const orderData = orderDoc.data();
            console.log('useOrderExpiration: Expiring order:', {
              id: orderDoc.id,
              created_at: orderData.created_at?.toDate(),
              age_minutes: (Date.now() - orderData.created_at?.toMillis()) / (1000 * 60)
            });
            
            return updateDoc(doc(db, 'orders', orderDoc.id), {
              status: 'expired'
            });
          });

          await Promise.all(updatePromises);
          console.log('useOrderExpiration: Successfully expired all old waiting orders');
        } else {
          console.log('useOrderExpiration: No expired orders found');
        }
        
      } catch (error) {
        console.error('useOrderExpiration: Error checking/expiring orders:', error);
      }
    };

    // Run the check when the hook is initialized (page load)
    checkAndExpireOrders();
  }, [currentUser]);

  return null; // This hook doesn't return any values, just performs side effects
};
