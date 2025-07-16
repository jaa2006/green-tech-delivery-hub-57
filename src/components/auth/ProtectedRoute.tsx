
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useNavigation } from '@/contexts/NavigationContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'driver' | 'seller';
  redirectTo?: string;
}

const ProtectedRoute = ({ 
  children, 
  requiredRole, 
  redirectTo = '/' 
}: ProtectedRouteProps) => {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const location = useLocation();
  const { pushToStack, clearStack } = useNavigation();

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('ProtectedRoute: Auth state change for path:', location.pathname);
      console.log('ProtectedRoute: User:', user?.uid || 'No user');
      console.log('ProtectedRoute: Required role:', requiredRole);
      
      if (!isMounted) return;

      if (!user) {
        console.log('ProtectedRoute: No user found, redirecting to auth');
        setIsAuthorized(false);
        setRedirectPath('/auth');
        setLoading(false);
        return;
      }

      // If no specific role required, just check if user is authenticated
      if (!requiredRole) {
        console.log('ProtectedRoute: No role required, user is authenticated');
        setIsAuthorized(true);
        setRedirectPath(null);
        setLoading(false);
        return;
      }

      try {
        let userData = null;
        let hasCorrectRole = false;
        
        if (requiredRole === 'driver') {
          console.log('ProtectedRoute: Checking driver role for user:', user.uid);
          
          // First check drivers collection
          const driverDoc = await getDoc(doc(db, 'drivers', user.uid));
          userData = driverDoc.data();
          
          if (userData && userData.role === 'driver') {
            console.log('ProtectedRoute: ✅ Driver data found in drivers collection');
            hasCorrectRole = true;
          } else {
            // Fallback: check users collection for legacy driver data
            console.log('ProtectedRoute: 🔍 Driver not found in drivers collection, checking users collection...');
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            const legacyUserData = userDoc.data();
            
            if (legacyUserData && legacyUserData.role === 'driver') {
              console.log('ProtectedRoute: 📦 Found legacy driver data in users collection, migrating...');
              
              // Migrate data to drivers collection
              const migratedDriverData = {
                uid: user.uid,
                name: legacyUserData.name || 'Driver',
                email: legacyUserData.email || user.email,
                role: 'driver',
                vehicle_type: legacyUserData.kendaraan || legacyUserData.vehicle_type || legacyUserData.vehicleType || 'Motor',
                plate_number: legacyUserData.plat_nomor || legacyUserData.plate_number || legacyUserData.vehicleNumber || 'Unknown',
                phone: legacyUserData.phone || '',
                photoURL: legacyUserData.photoURL || '',
                licenseNumber: legacyUserData.licenseNumber || '',
                location: legacyUserData.location || { lat: -6.2088, lng: 106.8456 },
                createdAt: legacyUserData.createdAt || new Date(),
                migratedAt: new Date()
              };
              
              try {
                await setDoc(doc(db, 'drivers', user.uid), migratedDriverData);
                console.log('ProtectedRoute: ✅ Driver data successfully migrated to drivers collection');
                userData = migratedDriverData;
                hasCorrectRole = true;
              } catch (migrationError) {
                console.error('ProtectedRoute: ❌ Error migrating driver data:', migrationError);
                // Even if migration fails, allow access based on legacy data
                userData = legacyUserData;
                hasCorrectRole = true;
              }
            } else {
              console.log('ProtectedRoute: ❌ No driver data found in either collection');
              hasCorrectRole = false;
            }
          }
        } else if (requiredRole === 'seller') {
          console.log('ProtectedRoute: Checking seller role for user:', user.uid);
          
          // First check sellers collection
          const sellerDoc = await getDoc(doc(db, 'sellers', user.uid));
          userData = sellerDoc.data();
          
          if (userData && userData.role === 'seller') {
            console.log('ProtectedRoute: ✅ Seller data found in sellers collection');
            hasCorrectRole = true;
          } else {
            // Fallback: check users collection for legacy seller data
            console.log('ProtectedRoute: 🔍 Seller not found in sellers collection, checking users collection...');
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            const legacyUserData = userDoc.data();
            
            if (legacyUserData && legacyUserData.role === 'seller') {
              console.log('ProtectedRoute: 📦 Found legacy seller data in users collection');
              userData = legacyUserData;
              hasCorrectRole = true;
            } else {
              console.log('ProtectedRoute: ❌ No seller data found in either collection');
              hasCorrectRole = false;
            }
          }
        } else {
          // For regular users, check users collection
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          userData = userDoc.data();
          hasCorrectRole = userData && userData.role === requiredRole;
        }

        console.log('ProtectedRoute: Role check result:', { 
          requiredRole, 
          userRole: userData?.role, 
          hasCorrectRole,
          userId: user.uid
        });
        
        if (!isMounted) return;

        if (hasCorrectRole) {
          setIsAuthorized(true);
          setRedirectPath(null);
        } else {
          console.log('ProtectedRoute: User not authorized for required role');
          // Determine correct redirect path based on user's actual role
          if (userData?.role === 'driver') {
            setRedirectPath('/driver-dashboard');
          } else if (userData?.role === 'seller') {
            setRedirectPath('/seller-dashboard');
          } else if (userData?.role === 'user') {
            setRedirectPath('/user-dashboard');
          } else {
            setRedirectPath('/auth');
          }
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error('ProtectedRoute: ❌ Error checking user role:', error);
        if (!isMounted) return;
        setIsAuthorized(false);
        setRedirectPath('/auth');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [requiredRole, location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#07595A] to-black flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          <p className="text-white mt-4 text-center">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized && redirectPath) {
    console.log('ProtectedRoute: 🚫 User not authorized, redirecting to:', redirectPath);
    
    // Clear navigation stack for auth redirects to prevent loops
    if (redirectPath === '/auth') {
      clearStack();
    }
    
    // Store the attempted location for redirect after login
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  console.log('ProtectedRoute: ✅ User authorized, rendering protected content');
  return <>{children}</>;
};

export default ProtectedRoute;
