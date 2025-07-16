
import { useEffect } from 'react';
import { User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

export const useAuthHandler = () => {
  const { currentUser } = useAuth();

  // Enhanced user data handler with separated collections
  const handleUserLogin = async (user: User) => {
    try {
      console.log('=== USER LOGIN HANDLER ===');
      console.log('User UID:', user.uid);
      console.log('User Email:', user.email);
      
      // First check in users collection
      console.log('Checking users collection...');
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('Found user data:', userData);
        
        // Update last login for user
        const updatedUserData = {
          ...userData,
          lastLogin: new Date()
        };
        
        console.log('Updating user last login');
        await setDoc(userDocRef, updatedUserData, { merge: true });
        console.log('✅ User data updated in users collection');
        return;
      }
      
      // Then check in drivers collection
      console.log('Checking drivers collection...');
      const driverDocRef = doc(db, "drivers", user.uid);
      const driverDoc = await getDoc(driverDocRef);
      
      if (driverDoc.exists()) {
        const driverData = driverDoc.data();
        console.log('Found driver data:', driverData);
        
        // Update last login for driver
        const updatedDriverData = {
          ...driverData,
          lastLogin: new Date()
        };
        
        console.log('Updating driver last login');
        await setDoc(driverDocRef, updatedDriverData, { merge: true });
        console.log('✅ Driver data updated in drivers collection');
        return;
      }
      
      // If user not found in either collection, create as user (for Google sign-in)
      console.log('User not found in any collection, creating as user');
      const newUserData = {
        name: user.displayName || user.email?.split('@')[0] || "User",
        email: user.email || "",
        role: "user",
        uid: user.uid,
        createdAt: new Date(),
        lastLogin: new Date(),
        ...(user.photoURL && { photoURL: user.photoURL })
      };

      console.log('Creating new user data in users collection:', newUserData);
      await setDoc(userDocRef, newUserData);
      console.log('✅ New user data created in users collection');
      
      console.log('=== USER LOGIN HANDLER COMPLETE ===');
    } catch (error) {
      console.error('❌ Error handling user login:', error);
      throw error;
    }
  };

  // Monitor auth state changes - removed auto navigation to prevent conflicts
  useEffect(() => {
    if (currentUser) {
      const timeoutId = setTimeout(() => {
        handleUserLogin(currentUser).catch(error => {
          console.error('Failed to handle user login:', error);
        });
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [currentUser]);

  return {
    handleUserLogin
  };
};
