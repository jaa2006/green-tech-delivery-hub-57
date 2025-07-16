import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import InteractiveTomTomMap from "@/components/ride/InteractiveTomTomMap";
import RideBottomSheet from "@/components/ride/RideBottomSheet";
import EmergencyButton from "@/components/ride/EmergencyButton";
import HabiRideHeader from "@/components/ride/HabiRideHeader";
import HabiRideSidePanels from "@/components/ride/HabiRideSidePanels";
import RideStatusContainer from "@/components/ride/RideStatusContainer";
import { useRideState } from "@/hooks/useRideState";
import { useLocationManagement } from "@/hooks/useLocationManagement";
import { useEnhancedOrderMonitor } from "@/hooks/useEnhancedOrderMonitor";
import { useUserDisplayName } from "@/hooks/useUserDisplayName";
import { OrderStateProvider } from "@/contexts/OrderStateContext";
import { useNavigationHistory } from "@/hooks/useNavigationHistory";
import { orderService } from "@/services/orderService";
import { trackOperation, checkMemory, logPerformanceReport } from "@/utils/performanceMonitor";

const HabiRide = () => {
  const {
    ridePhase,
    showDestinationContainer,
    showRoute,
    handleOrderCreated
  } = useRideState();

  const {
    pickupLocation,
    destinationLocation,
    distanceInfo,
    handleLocationSelect,
    handlePickupLocationUpdate,
    handleDistanceCalculated,
    handleCalculateRoute,
    handleGeocodeSearch,
    handleReverseGeocode
  } = useLocationManagement();

  const { navigateBack } = useNavigationHistory({
    defaultBackPath: '/',
    excludePaths: ['/auth', '/splash']
  });

  // Enhanced real-time order monitoring with user name integration
  const {
    currentOrder,
    rideStatus,
    loading: orderLoading,
    error: orderError,
    driverData,
    userInfo,
    manualStatusTransition,
    cancelOrder
  } = useEnhancedOrderMonitor();

  // Get user display name for order creation
  const { displayName: userDisplayName, loading: nameLoading } = useUserDisplayName();

  const [loading, setLoading] = useState(false);
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showRoutingPanel, setShowRoutingPanel] = useState(false);
  const [showGeocodingPanel, setShowGeocodingPanel] = useState(false);
  const [showBottomSheet, setShowBottomSheet] = useState(true);
  
  const { currentUser } = useAuth();

  // Performance monitoring
  useEffect(() => {
    const endTiming = trackOperation('enhanced-habiride-render');
    checkMemory();
    
    const reportInterval = setInterval(() => {
      logPerformanceReport();
    }, 120000);

    return () => {
      endTiming();
      clearInterval(reportInterval);
    };
  }, []);

  // Enhanced debug logging
  useEffect(() => {
    if (currentOrder || rideStatus !== 'idle') {
      console.log('=== ENHANCED HABIRIDE STATE WITH USER INFO ===');
      console.log('Current Order:', currentOrder);
      console.log('User Info:', userInfo);
      console.log('User Display Name:', userDisplayName);
      console.log('Ride Status:', rideStatus);
      console.log('Driver Data:', driverData);
      console.log('Order Loading:', orderLoading);
      console.log('Order Error:', orderError);
      console.log('============================================');
    }
  }, [currentOrder, rideStatus, driverData, orderLoading, orderError, userInfo, userDisplayName]);
  
  // Simulate driver location for demo
  useEffect(() => {
    if (rideStatus === 'driver_coming' || rideStatus === 'driver_arrived') {
      if (!driverLocation) {
        setDriverLocation({
          lat: -7.9696 + (Math.random() - 0.5) * 0.01,
          lng: 112.6356 + (Math.random() - 0.5) * 0.01
        });
      }
    }
  }, [rideStatus, driverLocation]);

  const handleConfirmDestination = async () => {
    const endTiming = trackOperation('enhanced-confirm-destination-with-user-name');
    
    try {
      if (!currentUser) {
        toast({
          title: "Perlu login",
          description: "Silakan login untuk memesan ride",
          variant: "destructive",
        });
        return;
      }

      if (nameLoading) {
        toast({
          title: "Loading",
          description: "Sedang memuat data user...",
          variant: "destructive",
        });
        return;
      }
      
      if (!destinationLocation || !destinationLocation.address || destinationLocation.address.trim() === "") {
        toast({
          title: "Pilih Tujuan",
          description: "Silakan pilih tujuan dengan mengetuk lokasi di peta",
          variant: "destructive",
        });
        return;
      }
      
      console.log('=== ENHANCED ORDER CREATION WITH USER NAME ===');
      console.log('User ID:', currentUser.uid);
      console.log('User Name:', userDisplayName);
      console.log('User Email:', currentUser.email);
      console.log('Pickup:', pickupLocation);
      console.log('Destination:', destinationLocation);
      
      setLoading(true);
      
      // Create order using enhanced service with user name
      const orderId = await orderService.createOrder({
        user_id: currentUser.uid,
        user_name: userDisplayName || currentUser.email?.split('@')[0] || 'User',
        user_email: currentUser.email || '',
        pickup: pickupLocation?.address || "Lokasi Saat Ini",
        destination: destinationLocation.address,
        destinationAddress: destinationLocation.address,
        pickup_coordinates: { 
          lat: pickupLocation?.lat || -6.2088, 
          lng: pickupLocation?.lng || 106.8456 
        }
      });
      
      console.log('Enhanced order with user name created with ID:', orderId);
      
      toast({
        title: "Pesanan dibuat!",
        description: `Mencari driver terdekat untuk ${userDisplayName}...`,
      });
      
      // The enhanced monitor will automatically handle status transitions
      await handleOrderCreated();
      
    } catch (error: any) {
      console.error('Enhanced order creation error:', error);
      toast({
        title: "Gagal membuat pesanan",
        description: error.message || "Terjadi kesalahan. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      endTiming();
    }
  };

  const handleCancelOrder = async () => {
    const endTiming = trackOperation('enhanced-cancel-order');
    
    try {
      setLoading(true);
      
      // Call cancel function from hook
      cancelOrder();
      
      // TODO: Implement actual order cancellation in Firestore
      console.log('Cancelling order:', currentOrder?.id);
      
      toast({
        title: "Pesanan dibatalkan",
        description: "Pesanan Anda telah dibatalkan",
      });
    } catch (error) {
      console.error("Enhanced error cancelling order:", error);
      toast({
        title: "Gagal membatalkan pesanan",
        description: "Terjadi kesalahan. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      endTiming();
    }
  };

  const handleConfirmDriver = () => {
    console.log('Driver confirmed, transitioning to driver_coming');
    manualStatusTransition('driver_coming');
    
    toast({
      title: "Driver Dikonfirmasi",
      description: "Driver sedang dalam perjalanan ke lokasi Anda",
    });
  };

  const handleGeocodingLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    const endTiming = trackOperation('enhanced-geocoding-location-select');
    
    try {
      handleLocationSelect(location);
      setShowGeocodingPanel(false);
      toast({
        title: "Lokasi Dipilih",
        description: `Tujuan diset ke: ${location.address}`,
      });
    } finally {
      endTiming();
    }
  };

  // Determine bottom sheet state based on ride status
  const getBottomSheetState = () => {
    switch (rideStatus) {
      case 'searching':
      case 'driver_found':
      case 'driver_coming':
        return 'waiting' as const;
      case 'driver_arrived':
        return 'driver_coming' as const;
      default:
        return 'destination' as const;
    }
  };

  // Determine if we should show the status container
  const shouldShowStatusContainer = rideStatus !== 'idle' && currentOrder;

  return (
    <OrderStateProvider>
      <div className="relative w-full h-screen overflow-hidden bg-gray-100">
        {/* Full Screen Interactive Map Background */}
        <div className="absolute inset-0 z-0">
          <InteractiveTomTomMap
            pickupLocation={pickupLocation}
            destinationLocation={destinationLocation}
            onLocationSelect={handleLocationSelect}
            onPickupLocationUpdate={handlePickupLocationUpdate}
            showRoute={showRoute}
            userDisplayName={userDisplayName || currentUser?.displayName || currentUser?.email || "User"}
          />
        </div>

        {/* Header Component */}
        <HabiRideHeader
          currentOrderId={currentOrder?.id}
          ridePhase={ridePhase}
          distanceInfo={distanceInfo}
          showRoutingPanel={showRoutingPanel}
          showGeocodingPanel={showGeocodingPanel}
          onToggleRoutingPanel={() => setShowRoutingPanel(!showRoutingPanel)}
          onToggleGeocodingPanel={() => setShowGeocodingPanel(!showGeocodingPanel)}
        />

        {/* Side Panels Component */}
        <HabiRideSidePanels
          showRoutingPanel={showRoutingPanel}
          showGeocodingPanel={showGeocodingPanel}
          loading={loading}
          distanceInfo={distanceInfo}
          onCalculateRoute={handleCalculateRoute}
          onLocationSelect={handleGeocodingLocationSelect}
          onGeocodeSearch={handleGeocodeSearch}
          onReverseGeocode={handleReverseGeocode}
          onCloseGeocodingPanel={() => setShowGeocodingPanel(false)}
        />

        {/* Enhanced Status Container with User Info */}
        {shouldShowStatusContainer && (
          <div className="absolute top-24 left-0 right-0 z-40">
            <RideStatusContainer
              status={rideStatus}
              driverData={driverData}
              onCancel={handleCancelOrder}
              onConfirm={handleConfirmDriver}
              estimatedTime="5-8 menit"
            />
          </div>
        )}
        
        {/* Emergency Button */}
        <EmergencyButton />
        
        {/* Bottom Content - Hide when status container is showing */}
        {!shouldShowStatusContainer && (
          <div className="absolute bottom-0 left-0 right-0 z-30">
            <RideBottomSheet
              state={getBottomSheetState()}
              destination={destinationLocation ? "Tujuan Terpilih" : "Pilih Tujuan"}
              destinationAddress={destinationLocation?.address || currentOrder?.destination || "Ketuk lokasi di peta untuk memilih tujuan"}
              driverName={driverData?.name || currentOrder?.assigned_driver_data?.name}
              onConfirmDestination={handleConfirmDestination}
              onConfirmOrder={() => {
                toast({
                  title: "Pesanan Dikonfirmasi",
                  description: "Driver sedang dalam perjalanan ke lokasi Anda",
                });
              }}
              onCancel={handleCancelOrder}
              onArrivedAtPickup={() => {
                toast({
                  title: "Perjalanan Dimulai",
                  description: "Selamat menikmati perjalanan Anda!",
                });
              }}
              onEditDestination={() => {
                setShowGeocodingPanel(true);
              }}
              isVisible={showBottomSheet}
              onToggleVisibility={() => setShowBottomSheet(!showBottomSheet)}
              pickupLocation={pickupLocation}
              onOrderCreated={handleOrderCreated}
              onShowWaitingPopup={() => {}} // No longer used with new container system
              remainingQuota={5}
            />
          </div>
        )}
      </div>
    </OrderStateProvider>
  );
};

export default HabiRide;
