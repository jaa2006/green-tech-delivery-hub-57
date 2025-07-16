
import { useState, useEffect } from 'react';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

export interface DriverData {
  uid: string;
  name: string;
  vehicle_type: string;
  plate_number: string;
  location: {
    lat: number;
    lng: number;
  };
  role: string;
}

export const useDriverData = () => {
  const [driverData, setDriverData] = useState<DriverData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  // Save driver data to Firestore
  const saveDriverData = async (data: Omit<DriverData, 'uid' | 'role'>) => {
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    setLoading(true);
    setError(null);

    try {
      const driverRef = doc(db, 'drivers', currentUser.uid);
      const driverDataWithUid: DriverData = {
        ...data,
        uid: currentUser.uid,
        role: 'driver'
      };

      await setDoc(driverRef, driverDataWithUid, { merge: true });
      setDriverData(driverDataWithUid);
      console.log('Driver data saved successfully:', driverDataWithUid);
    } catch (err: any) {
      console.error('Error saving driver data:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get driver data from Firestore
  const getDriverData = async (uid?: string) => {
    const targetUid = uid || currentUser?.uid;
    if (!targetUid) {
      throw new Error('No user ID provided');
    }

    setLoading(true);
    setError(null);

    try {
      const driverRef = doc(db, 'drivers', targetUid);
      const driverDoc = await getDoc(driverRef);

      if (driverDoc.exists()) {
        const data = driverDoc.data() as DriverData;
        setDriverData(data);
        console.log('Driver data retrieved:', data);
        return data;
      } else {
        console.log('No driver data found for UID:', targetUid);
        return null;
      }
    } catch (err: any) {
      console.error('Error getting driver data:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update driver location
  const updateDriverLocation = async (location: { lat: number; lng: number }) => {
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    try {
      const driverRef = doc(db, 'drivers', currentUser.uid);
      await updateDoc(driverRef, { location });
      
      if (driverData) {
        setDriverData({ ...driverData, location });
      }
      
      console.log('Driver location updated:', location);
    } catch (err: any) {
      console.error('Error updating driver location:', err);
      throw err;
    }
  };

  // Load driver data on component mount
  useEffect(() => {
    if (currentUser) {
      getDriverData().catch(console.error);
    }
  }, [currentUser]);

  return {
    driverData,
    loading,
    error,
    saveDriverData,
    getDriverData,
    updateDriverLocation
  };
};
