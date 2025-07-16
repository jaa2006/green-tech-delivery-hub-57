
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface UserData {
  uid: string;
  name: string;
  email: string;
  role: 'user' | 'driver' | 'seller';
  [key: string]: any;
}

export interface ValidationResult {
  isValid: boolean;
  userData: UserData | null;
  redirectPath: string | null;
}

export const validateUserRole = async (
  userId: string, 
  requiredRole?: 'user' | 'driver' | 'seller'
): Promise<ValidationResult> => {
  try {
    console.log('validateUserRole: Checking role for user:', userId, 'required:', requiredRole);
    
    let userData: UserData | null = null;
    
    if (requiredRole === 'driver') {
      // Check drivers collection first
      const driverDoc = await getDoc(doc(db, 'drivers', userId));
      if (driverDoc.exists()) {
        userData = driverDoc.data() as UserData;
      } else {
        // Fallback to users collection
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          const legacyData = userDoc.data();
          if (legacyData.role === 'driver') {
            userData = legacyData as UserData;
          }
        }
      }
    } else if (requiredRole === 'seller') {
      // Check sellers collection first
      const sellerDoc = await getDoc(doc(db, 'sellers', userId));
      if (sellerDoc.exists()) {
        userData = sellerDoc.data() as UserData;
      } else {
        // Fallback to users collection
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          const legacyData = userDoc.data();
          if (legacyData.role === 'seller') {
            userData = legacyData as UserData;
          }
        }
      }
    } else {
      // For regular users or no specific role
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        userData = userDoc.data() as UserData;
      }
    }

    if (!userData) {
      return {
        isValid: false,
        userData: null,
        redirectPath: '/auth'
      };
    }

    // If no specific role required, just check if user exists
    if (!requiredRole) {
      return {
        isValid: true,
        userData,
        redirectPath: null
      };
    }

    // Check if user has the correct role
    const hasCorrectRole = userData.role === requiredRole;
    
    if (hasCorrectRole) {
      return {
        isValid: true,
        userData,
        redirectPath: null
      };
    }

    // Determine redirect path based on actual role
    let redirectPath = '/auth';
    if (userData.role === 'driver') {
      redirectPath = '/driver-dashboard';
    } else if (userData.role === 'seller') {
      redirectPath = '/seller-dashboard';
    } else if (userData.role === 'user') {
      redirectPath = '/user-dashboard';
    }

    return {
      isValid: false,
      userData,
      redirectPath
    };
    
  } catch (error) {
    console.error('validateUserRole: Error validating user role:', error);
    return {
      isValid: false,
      userData: null,
      redirectPath: '/auth'
    };
  }
};

export const getDashboardPath = (role: string): string => {
  switch (role) {
    case 'driver':
      return '/driver-dashboard';
    case 'seller':
      return '/seller-dashboard';
    case 'user':
      return '/user-dashboard';
    default:
      return '/auth';
  }
};
