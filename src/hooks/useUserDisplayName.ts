
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

export const useUserDisplayName = () => {
  const [displayName, setDisplayName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchUserDisplayName = async () => {
      if (!currentUser) {
        setDisplayName('');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching user display name for:', currentUser.uid);
        
        // Try to get from Firebase Auth first
        if (currentUser.displayName) {
          setDisplayName(currentUser.displayName);
          setLoading(false);
          return;
        }

        // Fallback to Firestore users collection
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const name = userData.name || userData.displayName || currentUser.email?.split('@')[0] || 'User';
          setDisplayName(name);
        } else {
          // Final fallback
          setDisplayName(currentUser.email?.split('@')[0] || 'User');
        }
      } catch (error) {
        console.error('Error fetching user display name:', error);
        setDisplayName(currentUser.email?.split('@')[0] || 'User');
      } finally {
        setLoading(false);
      }
    };

    fetchUserDisplayName();
  }, [currentUser]);

  return { displayName, loading };
};
