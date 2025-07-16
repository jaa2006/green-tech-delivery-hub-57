import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface NavigationState {
  previousPath: string | null;
  navigationStack: string[];
  canGoBack: boolean;
  goBackSafely: () => void;
  pushToStack: (path: string) => void;
  clearStack: () => void;
}

const NavigationContext = createContext<NavigationState | null>(null);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
};

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [navigationStack, setNavigationStack] = useState<string[]>([]);
  const [previousPath, setPreviousPath] = useState<string | null>(null);
  const isInitialMount = useRef(true);

  // Track navigation changes
  useEffect(() => {
    const currentPath = location.pathname;
    
    console.log('Navigation: Current path changed to:', currentPath);
    
    if (isInitialMount.current) {
      isInitialMount.current = false;
      setNavigationStack([currentPath]);
      console.log('Navigation: Initial mount, stack:', [currentPath]);
      return;
    }

    // Update navigation stack
    setNavigationStack(prev => {
      const newStack = [...prev];
      
      // If this is a new path (not going back), add to stack
      if (newStack[newStack.length - 1] !== currentPath) {
        setPreviousPath(newStack[newStack.length - 1] || null);
        newStack.push(currentPath);
        
        // Keep stack size manageable (max 10 items)
        if (newStack.length > 10) {
          newStack.shift();
        }
      }
      
      console.log('Navigation: Updated stack:', newStack);
      console.log('Navigation: Previous path:', newStack[newStack.length - 2] || null);
      
      return newStack;
    });
  }, [location.pathname]);

  const goBackSafely = () => {
    console.log('Navigation: goBackSafely called');
    console.log('Navigation: Current stack:', navigationStack);
    
    if (navigationStack.length > 1) {
      const previousRoute = navigationStack[navigationStack.length - 2];
      console.log('Navigation: Going back to:', previousRoute);
      
      // Remove current path from stack
      setNavigationStack(prev => prev.slice(0, -1));
      navigate(previousRoute, { replace: true });
    } else {
      console.log('Navigation: No previous route, going to home');
      navigate('/', { replace: true });
    }
  };

  const pushToStack = (path: string) => {
    console.log('Navigation: Manually pushing to stack:', path);
    setNavigationStack(prev => [...prev, path]);
  };

  const clearStack = () => {
    console.log('Navigation: Clearing navigation stack');
    setNavigationStack([location.pathname]);
    setPreviousPath(null);
  };

  const canGoBack = navigationStack.length > 1;

  const value: NavigationState = {
    previousPath,
    navigationStack,
    canGoBack,
    goBackSafely,
    pushToStack,
    clearStack
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};
