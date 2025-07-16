import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface UserData {
  name?: string;
  email?: string;
  displayName?: string;
}

export const useUserName = (userId: string) => {
  const [userName, setUserName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || userId.trim() === '') {
      setUserName('User');
      return;
    }

    const fetchUserName = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Fetching user name for ID:', userId);
        
        // First try users collection
        const userDoc = await getDoc(doc(db, 'users', userId));
        
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserData;
          const displayName = userData.name || userData.displayName || userData.email?.split('@')[0] || `User-${userId.slice(-4)}`;
          
          console.log('User data found:', userData);
          setUserName(displayName);
        } else {
          console.log('User not found, using fallback name');
          setUserName(`User-${userId.slice(-4)}`);
        }
      } catch (err) {
        console.error('Error fetching user name:', err);
        setError('Failed to fetch user name');
        setUserName(`User-${userId.slice(-4)}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUserName();
  }, [userId]);

  return { userName, loading, error };
};