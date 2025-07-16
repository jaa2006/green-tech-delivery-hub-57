
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Navigation, Phone, ArrowLeft, Clock, AlertTriangle, Route } from 'lucide-react';
import { NearbyOrder } from '@/hooks/useNearbyOrders';
import { useAuth } from '@/contexts/AuthContext';
import { useDriverLocation } from '@/hooks/useDriverLocation';
import DynamicDriverMap from '@/components/ride/DynamicDriverMap';

interface RouteInfo {
  distance: string;
  duration: string;
  distanceMeters: number;
  durationSeconds: number;
}

const AntarPenumpang = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [order, setOrder] = useState<NearbyOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  
  const orderId = location.state?.orderId;
  const fromDashboard = location.state?.fromDashboard;

  // Enhanced driver location with more frequent updates during active trip
  const { location: driverLocation, isLoading: locationLoading, error: locationError, refreshLocation } = useDriverLocation({
    enabled: true,
    options: {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000 // Update every 30 seconds during trip
    }
  });

  console.log('=== ENHANCED ANTAR PENUMPANG INIT ===');
  console.log('OrderId from location state:', orderId);
  console.log('From dashboard:', fromDashboard);
  console.log('Current user:', currentUser?.uid);
  console.log('Driver location:', driverLocation);
  console.log('Location state:', location.state);

  // Determine routing phase based on order status
  const getRoutingPhase = (): 'to_pickup' | 'to_destination' => {
    if (!order) return 'to_pickup';
    
    switch (order.status) {
      case 'accepted':
      case 'on_the_way_to_pickup':
      case 'arrived_at_pickup':
        return 'to_pickup';
      case 'passenger_picked_up':
        return 'to_destination';
      default:
        return 'to_pickup';
    }
  };

  const routingPhase = getRoutingPhase();

  // Generate navigation URL based on current phase
  const getNavigationURL = () => {
    if (!order) return null;

    if (routingPhase === 'to_pickup' && order.pickup_coordinates) {
      return `https://www.google.com/maps/dir/?api=1&destination=${order.pickup_coordinates.lat},${order.pickup_coordinates.lng}`;
    } else if (routingPhase === 'to_destination' && order.destination_coordinates) {
      return `https://www.google.com/maps/dir/?api=1&destination=${order.destination_coordinates.lat},${order.destination_coordinates.lng}`;
    }
    return null;
  };

  useEffect(() => {
    console.log('=== ENHANCED ANTAR PENUMPANG useEffect ===');
    
    if (!currentUser) {
      console.log('Enhanced: No current user, redirecting to auth');
      toast({
        title: "Authentication Required",
        description: "Silakan login sebagai driver terlebih dahulu",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    if (!orderId) {
      console.log('Enhanced: No orderId found, redirecting to dashboard');
      toast({
        title: "Order ID Missing",
        description: "Order ID tidak ditemukan. Kembali ke dashboard.",
        variant: "destructive",
      });
      navigate('/driver-dashboard');
      return;
    }

    // Enhanced real-time order monitoring
    const orderRef = doc(db, 'orders', orderId);
    console.log('Enhanced: Setting up real-time order listener for:', orderId);
    
    const unsubscribe = onSnapshot(orderRef, (orderDoc) => {
      try {
        console.log('=== ENHANCED ORDER SNAPSHOT UPDATE ===');
        console.log('Order document exists:', orderDoc.exists());
        
        if (orderDoc.exists()) {
          const orderData = orderDoc.data();
          console.log('Enhanced order data retrieved:', orderData);
          
          // Enhanced validation that this driver is assigned to this order
          if (orderData.assigned_driver_id !== currentUser.uid) {
            console.log('Enhanced: Driver not assigned to this order');
            console.log('Expected driver:', orderData.assigned_driver_id);
            console.log('Current driver:', currentUser.uid);
            
            setConnectionError('Anda tidak memiliki akses ke order ini');
            toast({
              title: "Akses Ditolak",
              description: "Anda tidak memiliki akses ke order ini.",
              variant: "destructive",
            });
            navigate('/driver-dashboard');
            return;
          }
          
          // Enhanced order processing
          const processedOrder: NearbyOrder = {
            id: orderDoc.id,
            user_id: orderData.user_id || '',
            pickup: orderData.pickup || '',
            destination: orderData.destination || '',
            pickup_coordinates: orderData.pickup_coordinates,
            destination_coordinates: orderData.destination_coordinates,
            status: orderData.status || '',
            assigned_driver_id: orderData.assigned_driver_id || null,
            driver_data: orderData.assigned_driver_data || null,
            created_at: orderData.created_at
          };
          
          console.log('Enhanced processed order:', processedOrder);
          console.log('Routing phase will be:', getRoutingPhase());
          setOrder(processedOrder);
          setConnectionError(null);
          
          // Enhanced status-based notifications
          if (orderData.status === 'completed') {
            console.log('Enhanced: Order completed, showing success message');
            toast({
              title: "Perjalanan Selesai!",
              description: "Order telah diselesaikan dengan sukses",
            });
          }
          
        } else {
          console.log('Enhanced: Order document does not exist');
          setConnectionError('Order tidak ditemukan');
          toast({
            title: "Order Tidak Ditemukan",
            description: "Order mungkin sudah dibatalkan atau selesai.",
            variant: "destructive",
          });
          navigate('/driver-dashboard');
        }
      } catch (error) {
        console.error('Enhanced: Error processing order snapshot:', error);
        setConnectionError('Terjadi kesalahan saat memuat order');
      } finally {
        setLoading(false);
      }
    }, (error) => {
      console.error('Enhanced: Real-time order listener error:', error);
      
      // Enhanced error handling
      if (error.code === 'permission-denied') {
        setConnectionError('Tidak memiliki izin untuk mengakses order');
        toast({
          title: "Izin Ditolak",
          description: "Tidak memiliki izin untuk mengakses order ini.",
          variant: "destructive",
        });
      } else if (error.code === 'unavailable') {
        setConnectionError('Koneksi ke server terputus');
        toast({
          title: "Koneksi Terputus",
          description: "Silakan periksa koneksi internet Anda.",
          variant: "destructive",
        });
      } else {
        setConnectionError('Terjadi kesalahan sistem');
        toast({
          title: "Error Sistem",
          description: "Terjadi kesalahan saat memuat data order.",
          variant: "destructive",
        });
      }
      setLoading(false);
      
      // Navigate back after showing error
      setTimeout(() => {
        navigate('/driver-dashboard');
      }, 3000);
    });

    return () => {
      console.log('Enhanced: Cleaning up order listener');
      unsubscribe();
    };
  }, [orderId, navigate, toast, currentUser]);

  const updateOrderStatus = async (newStatus: string) => {
    if (!order || !currentUser) {
      console.log('Enhanced: Cannot update status - missing order or user');
      return;
    }

    console.log('=== ENHANCED ORDER STATUS UPDATE ===');
    console.log('Updating order status to:', newStatus);
    console.log('Order ID:', order.id);
    console.log('Driver ID:', currentUser.uid);
    console.log('Current routing phase:', routingPhase);
    
    setIsUpdating(true);
    
    try {
      const orderRef = doc(db, 'orders', order.id);
      const updateData = {
        status: newStatus,
        updated_at: new Date(),
        [`${newStatus}_at`]: new Date() // Add timestamp for specific status
      };
      
      console.log('Enhanced update data:', updateData);
      await updateDoc(orderRef, updateData);
      console.log('Enhanced: Order status updated successfully');

      // Enhanced status-based messaging and actions
      let title = "";
      let description = "";
      let shouldNavigateBack = false;
      
      switch (newStatus) {
        case 'on_the_way_to_pickup':
          title = "Menuju Lokasi Penjemputan";
          description = "Status order diperbarui. Menuju ke lokasi customer.";
          break;
        case 'arrived_at_pickup':
          title = "Tiba di Lokasi Penjemputan";
          description = "Customer akan diberitahu bahwa Anda telah tiba.";
          break;
        case 'passenger_picked_up':
          title = "Penumpang Telah Dijemput";
          description = "Perjalanan dimulai menuju tujuan. Rute diperbarui.";
          break;
        case 'completed':
          title = "Order Selesai!";
          description = "Terima kasih telah menyelesaikan perjalanan dengan baik.";
          shouldNavigateBack = true;
          break;
        default:
          title = "Status Diperbarui";
          description = `Status order berubah menjadi: ${newStatus}`;
      }
      
      toast({ title, description });
      
      if (shouldNavigateBack) {
        console.log('Enhanced: Navigating back to dashboard after completion');
        setTimeout(() => {
          navigate('/driver-dashboard');
        }, 2500);
      }
      
    } catch (error: any) {
      console.error('Enhanced: Error updating order status:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      if (error.code === 'permission-denied') {
        toast({
          title: "Izin Ditolak",
          description: "Tidak memiliki izin untuk memperbarui order ini.",
          variant: "destructive",
        });
      } else if (error.code === 'not-found') {
        toast({
          title: "Order Tidak Ditemukan",
          description: "Order mungkin sudah dihapus atau dibatalkan.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Gagal Memperbarui Status",
          description: "Terjadi kesalahan. Silakan coba lagi.",
          variant: "destructive",
        });
      }
    } finally {
      console.log('Enhanced: Setting isUpdating to false');
      setIsUpdating(false);
    }
  };

  const handleRouteCalculated = (route: RouteInfo) => {
    console.log('Route calculated for phase:', routingPhase, route);
    setRouteInfo(route);
  };

  // Enhanced loading state
  if (loading) {
    console.log('Enhanced: Rendering loading state');
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#07595A] to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fdbc40] mx-auto mb-4"></div>
          <p className="text-white text-lg">Memuat data order...</p>
          <p className="text-white/70 text-sm mt-2">Enhanced real-time monitoring</p>
        </div>
      </div>
    );
  }

  // Enhanced error state
  if (connectionError) {
    console.log('Enhanced: Rendering connection error state');
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#07595A] to-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-white text-lg mb-2">Koneksi Bermasalah</p>
          <p className="text-red-300 text-sm mb-6">{connectionError}</p>
          <Button 
            onClick={() => navigate('/driver-dashboard')}
            className="bg-[#fdbc40] text-[#07595A]"
          >
            Kembali ke Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Enhanced no order state
  if (!order) {
    console.log('Enhanced: Rendering no order state');
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#07595A] to-black flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-16 h-16 text-white/50 mx-auto mb-4" />
          <p className="text-white text-lg mb-4">Order tidak ditemukan</p>
          <Button onClick={() => navigate('/driver-dashboard')}>
            Kembali ke Dashboard
          </Button>
        </div>
      </div>
    );
  }

  console.log('Enhanced: Rendering main component with order:', order);
  console.log('Current routing phase:', routingPhase);

  const getStatusButton = () => {
    switch (order.status) {
      case 'accepted':
        return (
          <Button
            onClick={() => updateOrderStatus('on_the_way_to_pickup')}
            disabled={isUpdating}
            className="w-full bg-[#fdbc40] text-[#07595A] py-4 text-lg font-semibold"
          >
            {isUpdating ? "Memperbarui..." : "Berangkat ke Lokasi Penjemputan"}
          </Button>
        );
      case 'on_the_way_to_pickup':
        return (
          <Button
            onClick={() => updateOrderStatus('arrived_at_pickup')}
            disabled={isUpdating}
            className="w-full bg-[#fdbc40] text-[#07595A] py-4 text-lg font-semibold"
          >
            {isUpdating ? "Memperbarui..." : "Tiba di Lokasi Penjemputan"}
          </Button>
        );
      case 'arrived_at_pickup':
        return (
          <Button
            onClick={() => updateOrderStatus('passenger_picked_up')}
            disabled={isUpdating}
            className="w-full bg-[#fdbc40] text-[#07595A] py-4 text-lg font-semibold"
          >
            {isUpdating ? "Memperbarui..." : "Penumpang Sudah Naik"}
          </Button>
        );
      case 'passenger_picked_up':
        return (
          <Button
            onClick={() => updateOrderStatus('completed')}
            disabled={isUpdating}
            className="w-full bg-green-500 text-white py-4 text-lg font-semibold"
          >
            {isUpdating ? "Memperbarui..." : "Selesaikan Perjalanan"}
          </Button>
        );
      case 'completed':
        return (
          <div className="text-center py-4">
            <p className="text-green-400 text-lg font-semibold mb-2">Order Selesai!</p>
            <p className="text-white/70 text-sm">Anda akan diarahkan ke dashboard...</p>
          </div>
        );
      default:
        return (
          <div className="text-center py-4">
            <p className="text-white/70 text-sm">Status: {order.status}</p>
          </div>
        );
    }
  };

  const navigationURL = getNavigationURL();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#07595A] to-black">
      {/* Enhanced Header */}
      <div className="bg-[#07595A] px-4 py-4 flex items-center">
        <button
          onClick={() => navigate('/driver-dashboard')}
          className="mr-3 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex-1">
          <h1 className="text-white text-xl font-semibold">Dynamic Route Navigation</h1>
          <p className="text-white/80 text-sm">Order #{order.id.slice(-6)} • {routingPhase === 'to_pickup' ? 'Ke Penjemputan' : 'Ke Tujuan'}</p>
        </div>
        <div className="text-right">
          <p className="text-white/60 text-xs">GPS Status</p>
          <div className={`w-2 h-2 rounded-full ${driverLocation ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
        </div>
      </div>

      {/* Enhanced Dynamic Map */}
      <div className="h-80 relative">
        <DynamicDriverMap
          order={order}
          driverLocation={driverLocation}
          routingPhase={routingPhase}
          onRouteCalculated={handleRouteCalculated}
          className="h-full rounded-2xl overflow-hidden shadow-lg"
        />
        {/* Status overlay for better UX */}
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm z-10">
          {routingPhase === 'to_pickup' ? 'Menuju Pickup' : 'Menuju Tujuan'}
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Route Information */}
        {routeInfo && (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold">Informasi Rute</h3>
              <Route className="w-5 h-5 text-[#fdbc40]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-[#fdbc40] font-semibold text-lg">{routeInfo.distance}</p>
                <p className="text-white/70 text-sm">Jarak</p>
              </div>
              <div className="text-center">
                <p className="text-[#fdbc40] font-semibold text-lg">{routeInfo.duration}</p>
                <p className="text-white/70 text-sm">Estimasi Waktu</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/20">
              <p className="text-white/80 text-sm text-center">
                {routingPhase === 'to_pickup' ? 'Menuju lokasi penjemputan' : 'Menuju tujuan akhir'}
              </p>
            </div>
          </div>
        )}

        {/* Enhanced Order Details */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className={`w-3 h-3 rounded-full mt-2 ${routingPhase === 'to_pickup' ? 'bg-orange-400 animate-pulse' : 'bg-green-400'}`} />
              <div className="flex-1">
                <p className="text-white/70 text-sm">Lokasi Penjemputan:</p>
                <p className="text-white font-medium text-lg">{order.pickup}</p>
                {order.pickup_coordinates && (
                  <p className="text-white/50 text-xs mt-1">
                    GPS: {order.pickup_coordinates.lat.toFixed(6)}, {order.pickup_coordinates.lng.toFixed(6)}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className={`w-3 h-3 rounded-full mt-2 ${routingPhase === 'to_destination' ? 'bg-orange-400 animate-pulse' : 'bg-red-400'}`} />
              <div className="flex-1">
                <p className="text-white/70 text-sm">Tujuan:</p>
                <p className="text-white font-medium text-lg">{order.destination}</p>
                {order.destination_coordinates && (
                  <p className="text-white/50 text-xs mt-1">
                    GPS: {order.destination_coordinates.lat.toFixed(6)}, {order.destination_coordinates.lng.toFixed(6)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Status Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5">
          <div className="text-center">
            <p className="text-white/70 text-sm mb-2">Status Saat Ini:</p>
            <p className="text-[#fdbc40] font-semibold text-lg capitalize">
              {order.status.replace(/_/g, ' ')}
            </p>
            {order.created_at && (
              <p className="text-white/50 text-xs mt-2">
                Dibuat: {order.created_at.toDate?.().toLocaleString('id-ID') || 'Unknown'}
              </p>
            )}
          </div>
        </div>

        {/* Enhanced Action Section */}
        <div className="space-y-3">
          {getStatusButton()}
          
          {/* Enhanced Emergency Contact */}
          {order.status !== 'completed' && (
            <div className="flex space-x-3">
              <Button
                variant="outline"
                className="flex-1 bg-white/10 border-white/20 text-white py-3"
              >
                <Phone className="w-4 h-4 mr-2" />
                Hubungi Penumpang
              </Button>
              <Button
                variant="outline"
                className="flex-1 bg-white/10 border-white/20 text-white py-3"
                onClick={() => {
                  if (navigationURL) {
                    window.open(navigationURL, '_blank');
                  }
                }}
                disabled={!navigationURL}
              >
                <Navigation className="w-4 h-4 mr-2" />
                Buka Maps
              </Button>
            </div>
          )}
        </div>

        {/* GPS Status */}
        {locationError && (
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-2xl p-4">
            <p className="text-yellow-200 text-sm text-center">
              {locationError} - Refresh GPS untuk akurasi terbaik
            </p>
            <Button
              onClick={refreshLocation}
              className="w-full mt-2 bg-yellow-500 text-black"
              size="sm"
            >
              Refresh GPS
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AntarPenumpang;
