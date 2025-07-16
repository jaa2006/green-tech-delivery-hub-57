
import React, { createContext, useContext, ReactNode } from 'react';
import { useNotificationBanner, NotificationType } from '@/hooks/useNotificationBanner';

interface NotificationContextType {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const { showSuccess, showError } = useNotificationBanner();

  return (
    <NotificationContext.Provider value={{ showSuccess, showError }}>
      {children}
    </NotificationContext.Provider>
  );
};
