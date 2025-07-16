
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/hooks/useUserData';
import { useDriverData } from '@/hooks/useDriverData';
import LoadingScreen from './LoadingScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'driver' | 'seller';
  redirectTo?: string;
}

const ProtectedRouteV2 = ({ 
  children, 
  requiredRole, 
  redirectTo = '/auth' 
}: ProtectedRouteProps) => {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const location = useLocation();
  const { currentUser } = useAuth();
  const { getUserData } = useUserData();
  const { getDriverData } = useDriverData();

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      console.log('ProtectedRouteV2: Checking auth for path:', location.pathname);
      
      if (!currentUser) {
        console.log('ProtectedRouteV2: No user found, redirecting to auth');
        if (isMounted) {
          setIsAuthorized(false);
          setRedirectPath('/auth');
          setLoading(false);
        }
        return;
      }

      // If no specific role required, just check if user is authenticated
      if (!requiredRole) {
        console.log('ProtectedRouteV2: No role required, user is authenticated');
        if (isMounted) {
          setIsAuthorized(true);
          setRedirectPath(null);
          setLoading(false);
        }
        return;
      }

      try {
        let userData = null;
        let hasCorrectRole = false;
        
        if (requiredRole === 'driver') {
          console.log('ProtectedRouteV2: Checking driver role');
          userData = await getDriverData(currentUser.uid);
          hasCorrectRole = userData && userData.role === 'driver';
        } else if (requiredRole === 'seller') {
          console.log('ProtectedRouteV2: Checking seller role');
          userData = await getUserData(currentUser.uid);
          hasCorrectRole = userData && userData.role === 'seller';
        } else {
          console.log('ProtectedRouteV2: Checking user role');
          userData = await getUserData(currentUser.uid);
          hasCorrectRole = userData && userData.role === requiredRole;
        }

        console.log('ProtectedRouteV2: Role check result:', { 
          requiredRole, 
          userRole: userData?.role, 
          hasCorrectRole,
          userId: currentUser.uid
        });
        
        if (!isMounted) return;

        if (hasCorrectRole) {
          setIsAuthorized(true);
          setRedirectPath(null);
        } else {
          console.log('ProtectedRouteV2: User not authorized for required role');
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
        console.error('ProtectedRouteV2: Error checking user role:', error);
        if (isMounted) {
          setIsAuthorized(false);
          setRedirectPath('/auth');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [currentUser, requiredRole, location.pathname, getUserData, getDriverData]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthorized && redirectPath) {
    console.log('ProtectedRouteV2: User not authorized, redirecting to:', redirectPath);
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  console.log('ProtectedRouteV2: User authorized, rendering protected content');
  return <>{children}</>;
};

export default ProtectedRouteV2;
