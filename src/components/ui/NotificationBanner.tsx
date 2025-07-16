
import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NotificationBannerProps {
  type: 'success' | 'error';
  message: string;
  isVisible: boolean;
  onClose: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

const NotificationBanner = ({
  type,
  message,
  isVisible,
  onClose,
  autoClose = true,
  autoCloseDelay = 4000
}: NotificationBannerProps) => {
  useEffect(() => {
    if (isVisible && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isVisible, autoClose, autoCloseDelay, onClose]);

  if (!isVisible) return null;

  const getBannerStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600 text-white border-green-700';
      case 'error':
        return 'bg-red-600 text-white border-red-700';
      default:
        return 'bg-gray-600 text-white border-gray-700';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5" />;
      case 'error':
        return <AlertCircle className="h-5 w-5" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-fade-in">
      <div className={cn(
        'w-full px-4 py-4 border-b-2 shadow-lg rounded-b-2xl mx-2 opacity-100',
        getBannerStyles()
      )}>
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getIcon()}
            <span className="font-semibold text-sm">{message}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-black/20 transition-colors bg-transparent"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationBanner;
