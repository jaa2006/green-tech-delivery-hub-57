
import { useState, useCallback } from 'react';

export type NotificationType = 'success' | 'error';

interface NotificationState {
  isVisible: boolean;
  type: NotificationType;
  message: string;
}

export const useNotificationBanner = () => {
  const [notification, setNotification] = useState<NotificationState>({
    isVisible: false,
    type: 'success',
    message: ''
  });

  const showNotification = useCallback((type: NotificationType, message: string) => {
    setNotification({
      isVisible: true,
      type,
      message
    });
  }, []);

  const showSuccess = useCallback((message: string) => {
    showNotification('success', message);
  }, [showNotification]);

  const showError = useCallback((message: string) => {
    showNotification('error', message);
  }, [showNotification]);

  const hideNotification = useCallback(() => {
    setNotification(prev => ({
      ...prev,
      isVisible: false
    }));
  }, []);

  return {
    notification,
    showSuccess,
    showError,
    hideNotification
  };
};
