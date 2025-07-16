
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface ErrorState {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
}

export const useErrorHandler = () => {
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    errorInfo: null
  });
  const { toast } = useToast();

  const handleError = (error: Error, errorInfo?: string) => {
    console.error('Error caught by error handler:', error);
    console.error('Error info:', errorInfo);
    
    setErrorState({
      hasError: true,
      error,
      errorInfo: errorInfo || null
    });

    // Show user-friendly error message
    toast({
      title: "Something went wrong",
      description: "Please try again or refresh the page",
      variant: "destructive",
    });
  };

  const clearError = () => {
    setErrorState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  const retryOperation = (operation: () => void) => {
    try {
      clearError();
      operation();
    } catch (error) {
      handleError(error as Error, 'Retry operation failed');
    }
  };

  return {
    errorState,
    handleError,
    clearError,
    retryOperation
  };
};
