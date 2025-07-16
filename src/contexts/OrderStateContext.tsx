
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface OrderCreationState {
  isCreating: boolean;
  progress: number;
  currentStep: string;
  error: string | null;
}

interface OrderStateContextType {
  creationState: OrderCreationState;
  setCreationState: (state: Partial<OrderCreationState>) => void;
  resetCreationState: () => void;
}

const OrderStateContext = createContext<OrderStateContextType | undefined>(undefined);

export const useOrderState = () => {
  const context = useContext(OrderStateContext);
  if (!context) {
    throw new Error('useOrderState must be used within an OrderStateProvider');
  }
  return context;
};

const initialState: OrderCreationState = {
  isCreating: false,
  progress: 0,
  currentStep: '',
  error: null
};

interface OrderStateProviderProps {
  children: ReactNode;
}

export const OrderStateProvider = ({ children }: OrderStateProviderProps) => {
  const [creationState, setCreationStateInternal] = useState<OrderCreationState>(initialState);

  const setCreationState = (newState: Partial<OrderCreationState>) => {
    setCreationStateInternal(prev => ({ ...prev, ...newState }));
  };

  const resetCreationState = () => {
    setCreationStateInternal(initialState);
  };

  return (
    <OrderStateContext.Provider value={{
      creationState,
      setCreationState,
      resetCreationState
    }}>
      {children}
    </OrderStateContext.Provider>
  );
};
