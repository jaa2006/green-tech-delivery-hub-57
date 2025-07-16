
import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useNavigation } from '@/contexts/NavigationContext';

interface UseNavigationHistoryOptions {
  excludePaths?: string[];
  defaultBackPath?: string;
}

export const useNavigationHistory = (options: UseNavigationHistoryOptions = {}) => {
  const { excludePaths = ['/auth', '/splash'], defaultBackPath = '/' } = options;
  const location = useLocation();
  const navigate = useNavigate();
  const { goBackSafely, pushToStack, previousPath, canGoBack } = useNavigation();
  const lastValidPath = useRef<string | null>(null);

  // Track valid navigation paths (exclude auth pages)
  useEffect(() => {
    const currentPath = location.pathname;
    
    if (!excludePaths.includes(currentPath)) {
      lastValidPath.current = currentPath;
      console.log('NavigationHistory: Valid path tracked:', currentPath);
    }
  }, [location.pathname, excludePaths]);

  const navigateBack = () => {
    console.log('NavigationHistory: navigateBack called');
    
    if (canGoBack && previousPath && !excludePaths.includes(previousPath)) {
      console.log('NavigationHistory: Using safe back navigation to:', previousPath);
      goBackSafely();
    } else if (lastValidPath.current && lastValidPath.current !== location.pathname) {
      console.log('NavigationHistory: Using last valid path:', lastValidPath.current);
      navigate(lastValidPath.current, { replace: true });
    } else {
      console.log('NavigationHistory: Using default back path:', defaultBackPath);
      navigate(defaultBackPath, { replace: true });
    }
  };

  const navigateTo = (path: string, options?: { replace?: boolean; state?: any }) => {
    console.log('NavigationHistory: navigateTo called with path:', path);
    
    if (!excludePaths.includes(path)) {
      pushToStack(path);
    }
    
    navigate(path, options);
  };

  const getBackPath = (): string => {
    if (canGoBack && previousPath && !excludePaths.includes(previousPath)) {
      return previousPath;
    }
    if (lastValidPath.current && lastValidPath.current !== location.pathname) {
      return lastValidPath.current;
    }
    return defaultBackPath;
  };

  return {
    navigateBack,
    navigateTo,
    getBackPath,
    canNavigateBack: canGoBack,
    previousPath,
    currentPath: location.pathname
  };
};
