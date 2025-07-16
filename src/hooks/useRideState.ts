
import { useState, useEffect, useCallback } from 'react';
import { useUserOrderStatus } from './useUserOrderStatus';

interface RideState {
  ridePhase: 'destination' | 'driver_coming' | 'driver_arrived';
  showDestinationContainer: boolean;
  showRoute: boolean;
}

export const useRideState = () => {
  const { 
    currentOrder, 
    loading: orderLoading, 
    error: orderError, 
    isNewOrderSession,
    showSearchingPopup,
    showDriverFoundPopup,
    hideSearchingPopup,
    hideDriverFoundPopup
  } = useUserOrderStatus();
  
  const [rideState, setRideState] = useState<RideState>({
    ridePhase: 'destination',
    showDestinationContainer: false,
    showRoute: false
  });

  useEffect(() => {
    console.log('=== RIDE STATE EFFECT ===');
    console.log('Order Loading:', orderLoading);
    console.log('Current Order:', currentOrder?.id);
    console.log('Order Status:', currentOrder?.status);
    console.log('Show Searching Popup:', showSearchingPopup);
    console.log('Show Driver Found Popup:', showDriverFoundPopup);
    console.log('========================');

    if (orderLoading) {
      console.log('useRideState: Still loading, keeping current state');
      return;
    }

    if (orderError) {
      console.log('useRideState: Error detected, resetting all states');
      setRideState({
        ridePhase: 'destination',
        showDestinationContainer: true,
        showRoute: false
      });
      return;
    }

    if (!currentOrder) {
      console.log('useRideState: No current order, showing destination container');
      setRideState({
        ridePhase: 'destination',
        showDestinationContainer: true,
        showRoute: false
      });
      return;
    }

    // Handle state based on order status
    switch (currentOrder.status) {
      case 'waiting':
        console.log('useRideState: Order waiting');
        setRideState({
          ridePhase: 'destination',
          showDestinationContainer: false,
          showRoute: true
        });
        break;
        
      case 'accepted':
        console.log('useRideState: Order accepted');
        setRideState({
          ridePhase: 'driver_coming',
          showDestinationContainer: false,
          showRoute: true
        });
        break;
        
      default:
        console.log('useRideState: Default case for order status:', currentOrder.status);
        setRideState({
          ridePhase: 'destination',
          showDestinationContainer: false,
          showRoute: false
        });
    }
  }, [currentOrder, orderLoading, orderError, showSearchingPopup, showDriverFoundPopup]);

  const handleOrderCreated = useCallback(() => {
    console.log('useRideState: Order created - monitoring will be handled by useUserOrderStatus');
  }, []);

  return {
    ...rideState,
    currentOrder,
    orderLoading,
    orderError,
    isNewOrderSession,
    showWaitingPopup: showSearchingPopup,
    showDriverFoundPopup,
    hideWaitingPopup: hideSearchingPopup,
    hideDriverFoundPopup,
    handleOrderCreated
  };
};
