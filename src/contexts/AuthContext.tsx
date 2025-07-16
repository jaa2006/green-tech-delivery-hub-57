
import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { migrateDriverData, migrateSellerData } from "@/utils/dataMigration";
import { useErrorHandler } from "@/hooks/useErrorHandler";

interface AuthContextProps {
  currentUser: User | null;
  signup: (email: string, password: string, fullName: string, role: 'user' | 'driver' | 'seller', vehicleData?: { vehicle_type: string, plate_number: string }, sellerData?: { storeName: string, storeDescription: string }) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  validateSellerAuth: () => Promise<boolean>;
  getSellerData: () => Promise<any>;
  isAuthStateLoaded: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthStateLoaded, setIsAuthStateLoaded] = useState(false);
  const { handleError } = useErrorHandler();

  // Enhanced logout function to fix driver logout bug
  const logout = async (): Promise<void> => {
    try {
      console.log('=== LOGOUT PROCESS START ===');
      console.log('Current user before logout:', currentUser?.uid);
      
      // Clear any cached data
      localStorage.removeItem("last_role");
      
      // Sign out from Firebase
      await signOut(auth);
      
      // Force clear the current user state
      setCurrentUser(null);
      
      console.log('✅ Logout successful');
      console.log('=== LOGOUT PROCESS END ===');
      
    } catch (error) {
      console.error("❌ Error in logout:", error);
      handleError(error as Error, 'Logout failed');
      throw error;
    }
  };

  // Validate seller authentication and data consistency
  const validateSellerAuth = async (): Promise<boolean> => {
    if (!currentUser) {
      console.error("❌ No authenticated user");
      return false;
    }

    try {
      console.log("🔍 Validating seller auth for UID:", currentUser.uid);
      
      // Check sellers collection first (primary)
      const sellerDoc = await getDoc(doc(db, "sellers", currentUser.uid));
      
      if (sellerDoc.exists()) {
        const sellerData = sellerDoc.data();
        console.log("✅ Seller found in sellers collection:", sellerData);
        
        if (sellerData.role === "seller") {
          return true;
        } else {
          console.error("❌ User role is not seller:", sellerData.role);
          return false;
        }
      }

      // Try migration if not found in sellers collection
      console.log("🔄 Attempting seller data migration");
      const migrationResult = await migrateSellerData(currentUser.uid);
      
      if (migrationResult.success) {
        console.log("✅ Seller data migration successful");
        return true;
      } else {
        console.error("❌ Seller data migration failed:", migrationResult.error);
        return false;
      }
    } catch (error) {
      console.error("❌ Error validating seller auth:", error);
      handleError(error as Error, 'Seller validation failed');
      return false;
    }
  };

  // Get seller data with fallback
  const getSellerData = async () => {
    if (!currentUser) {
      throw new Error("No authenticated user");
    }

    try {
      // Try sellers collection first
      const sellerDoc = await getDoc(doc(db, "sellers", currentUser.uid));
      
      if (sellerDoc.exists()) {
        return sellerDoc.data();
      }

      // Try migration
      const migrationResult = await migrateSellerData(currentUser.uid);
      
      if (migrationResult.success) {
        const newSellerDoc = await getDoc(doc(db, "sellers", currentUser.uid));
        if (newSellerDoc.exists()) {
          return newSellerDoc.data();
        }
      }

      throw new Error("Seller data not found and migration failed");
    } catch (error) {
      console.error("Error getting seller data:", error);
      handleError(error as Error, 'Failed to get seller data');
      throw error;
    }
  };

  // Enhanced signup function with better error handling
  const signup = async (
    email: string, 
    password: string, 
    fullName: string, 
    role: 'user' | 'driver' | 'seller',
    vehicleData?: { vehicle_type: string, plate_number: string },
    sellerData?: { storeName: string, storeDescription: string }
  ) => {
    try {
      console.log('=== SIGNUP PROCESS START ===');
      console.log('Email:', email);
      console.log('Full Name:', fullName);
      console.log('Role:', role);
      
      // Create the user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('User created with UID:', user.uid);
      
      if (role === 'user') {
        // Save to users collection
        const userData = {
          name: fullName,
          email,
          role: "user",
          uid: user.uid,
          createdAt: new Date(),
        };
        
        console.log('Saving user data to users collection:', userData);
        await setDoc(doc(db, "users", user.uid), userData);
        console.log('✅ User data saved to users collection');
        
      } else if (role === 'driver') {
        // Enhanced driver registration with proper collection handling
        if (!vehicleData) {
          throw new Error('Vehicle data is required for driver registration');
        }
        
        const driverData = {
          uid: user.uid,
          name: fullName,
          email,
          role: "driver",
          vehicle_type: vehicleData.vehicle_type,
          plate_number: vehicleData.plate_number,
          location: {
            lat: -6.2088, // Default location (Jakarta)
            lng: 106.8456
          },
          createdAt: new Date(),
        };
        
        // Save to drivers collection (primary)
        console.log('Saving driver data to drivers collection:', driverData);
        await setDoc(doc(db, "drivers", user.uid), driverData);
        console.log('✅ Driver data saved to drivers collection');
        
        // Also save to users collection for legacy compatibility
        const legacyUserData = {
          name: fullName,
          email,
          role: "driver",
          uid: user.uid,
          vehicle_type: vehicleData.vehicle_type,
          plate_number: vehicleData.plate_number,
          createdAt: new Date(),
        };
        
        console.log('Saving driver data to users collection (legacy):', legacyUserData);
        await setDoc(doc(db, "users", user.uid), legacyUserData);
        console.log('✅ Driver data saved to users collection (legacy)');
        
      } else if (role === 'seller') {
        // Enhanced seller data creation with validation
        const sellerDataToSave = {
          uid: user.uid,
          name: fullName,
          email,
          role: "seller",
          storeName: sellerData?.storeName || `${fullName}'s Store`,
          storeDescription: sellerData?.storeDescription || '',
          location: {
            lat: -6.2088, // Default location (Jakarta)
            lng: 106.8456
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          // Add additional seller-specific fields
          isVerified: false,
          productsCount: 0,
          ordersCount: 0
        };
        
        console.log('Saving seller data to sellers collection:', sellerDataToSave);
        await setDoc(doc(db, "sellers", user.uid), sellerDataToSave);
        console.log('✅ Seller data saved to sellers collection');
        
        // Also save to users collection for legacy compatibility
        const legacyUserData = {
          name: fullName,
          email,
          role: "seller",
          uid: user.uid,
          storeName: sellerDataToSave.storeName,
          storeDescription: sellerDataToSave.storeDescription,
          createdAt: new Date(),
        };
        
        console.log('Saving seller data to users collection (legacy):', legacyUserData);
        await setDoc(doc(db, "users", user.uid), legacyUserData);
        console.log('✅ Seller data saved to users collection (legacy)');
      }
      
      // Set the has_registered flag after successful registration
      localStorage.setItem("has_registered", "true");
      // Store the last role for logout redirect
      localStorage.setItem("last_role", role);
      
      console.log('=== SIGNUP PROCESS END ===');
      
    } catch (error) {
      console.error("❌ Error in signup:", error);
      handleError(error as Error, 'Signup failed');
      throw error;
    }
  };

  // Enhanced login function
  const login = async (email: string, password: string) => {
    try {
      console.log('=== LOGIN PROCESS START ===');
      console.log('Email:', email);
      await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Login successful');
      console.log('=== LOGIN PROCESS END ===');
    } catch (error) {
      console.error("❌ Error in login:", error);
      handleError(error as Error, 'Login failed');
      throw error;
    }
  };

  useEffect(() => {
    console.log('Setting up enhanced auth state observer...');
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user ? `User: ${user.uid}` : 'No user');
      
      setCurrentUser(user);
      
      // Mark auth state as loaded
      if (!isAuthStateLoaded) {
        setIsAuthStateLoaded(true);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, [isAuthStateLoaded]);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    loading,
    validateSellerAuth,
    getSellerData,
    isAuthStateLoaded
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
