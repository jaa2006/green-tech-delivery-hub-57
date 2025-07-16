
import { useState, useEffect } from 'react';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

export interface UserData {
  uid: string;
  name: string;
  email: string;
  role: string;
  createdAt?: any;
  photoURL?: string;
}

export const useUserData = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  // Save user data to Firestore
  const saveUserData = async (data: Omit<UserData, 'uid'>) => {
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    setLoading(true);
    setError(null);

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userDataWithUid: UserData = {
        ...data,
        uid: currentUser.uid
      };

      await setDoc(userRef, userDataWithUid, { merge: true });
      setUserData(userDataWithUid);
      console.log('User data saved successfully:', userDataWithUid);
    } catch (err: any) {
      console.error('Error saving user data:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get user data from Firestore
  const getUserData = async (uid?: string) => {
    const targetUid = uid || currentUser?.uid;
    if (!targetUid) {
      throw new Error('No user ID provided');
    }

    setLoading(true);
    setError(null);

    try {
      const userRef = doc(db, 'users', targetUid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const data = userDoc.data() as UserData;
        setUserData(data);
        console.log('User data retrieved:', data);
        return data;
      } else {
        console.log('No user data found for UID:', targetUid);
        return null;
      }
    } catch (err: any) {
      console.error('Error getting user data:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update user data
  const updateUserData = async (updates: Partial<UserData>) => {
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, updates);
      
      if (userData) {
        setUserData({ ...userData, ...updates });
      }
      
      console.log('User data updated:', updates);
    } catch (err: any) {
      console.error('Error updating user data:', err);
      throw err;
    }
  };

  // Load user data on component mount
  useEffect(() => {
    if (currentUser) {
      getUserData().catch(console.error);
    }
  }, [currentUser]);

  return {
    userData,
    loading,
    error,
    saveUserData,
    getUserData,
    updateUserData
  };
};
