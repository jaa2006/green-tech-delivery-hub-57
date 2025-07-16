
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { MapPin, Navigation, Clock, AlertCircle, Wifi, WifiOff, Bug, RefreshCw, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useNearbyOrders } from '@/hooks/useNearbyOrders';
import { useDriverLocation } from '@/hooks/useDriverLocation';
import { useNavigate } from 'react-router-dom';
import OrderUserName from './OrderUserName';

interface EnhancedNearbyOrdersListProps {
  className?: string;
}

const EnhancedNearbyOrdersList: React.FC<EnhancedNearbyOrdersListProps> = ({ className = "" }) => {
  const { location: driverLocation, error: locationError, refreshLocation } = useDriverLocation({ enabled: true });
  const { orders, loading, error: ordersError, takeOrder } = useNearbyOrders(driverLocation || undefined);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [takingOrder, setTakingOrder] = useState<string | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Enhanced logging for debugging
  const logData = useMemo(() => ({
    orderCount: orders.length,
    hasLocation: !!driverLocation,
    isLoading: loading,
    locationError: locationError,
    ordersError: ordersError,
    timestamp: Date.now()
  }), [orders.length, driverLocation, loading, locationError, ordersError]);

  useEffect(() => {
    console.log('=== ENHANCED NEARBY ORDERS UPDATE ===');
    console.log('Orders found:', logData.orderCount);
    console.log('GPS available:', logData.hasLocation);
    console.log('Loading status:', logData.isLoading);
    console.log('Location error:', logData.locationError);
    console.log('Orders error:', logData.ordersError);
    
    if (driverLocation) {
      console.log('Driver coordinates:', `${driverLocation.lat.toFixed(6)}, ${driverLocation.lng.toFixed(6)}`);
    }
    
    setLastUpdateTime(new Date());
    setDebugInfo(logData);
  }, [logData, driverLocation]);

  // Enhanced order processing with more details
  const displayOrders = useMemo(() => {
    return orders.map(order => ({
      ...order,
      shortId: order.id.slice(-6),
      shortUserId: order.user_id.slice(-6),
      shortPickup: order.pickup.substring(0, 40),
      shortDestination: order.destination.substring(0, 40),
      distanceText: order.distance ? 
        `${order.distance.toFixed(1)} KM` : 
        (driverLocation ? 'Calculating...' : 'No GPS'),
      timeText: order.created_at?.toDate ? 
        order.created_at.toDate().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) :
        'Baru saja',
      hasCoordinates: !!(order.pickup_coordinates?.lat && order.pickup_coordinates?.lng)
    }));
  }, [orders, driverLocation]);

  const handleTakeOrder = useCallback(async (orderId: string) => {
    setTakingOrder(orderId);
    
    try {
      console.log('=== ENHANCED TAKING ORDER ===');
      console.log('Order ID:', orderId);
      console.log('Driver location:', driverLocation);
      
      const success = await takeOrder(orderId);
      
      if (success) {
        toast({
          title: "Order berhasil diambil!",
          description: "Mengarahkan ke halaman antar penumpang...",
        });
        
        // Enhanced navigation with better state management
        setTimeout(() => {
          navigate('/antar-penumpang', { 
            state: { 
              orderId,
              fromDashboard: true,
              timestamp: Date.now()
            } 
          });
        }, 1000);
      }
    } catch (error) {
      console.error('Enhanced error taking order:', error);
      toast({
        title: "Gagal mengambil order",
        description: error instanceof Error ? error.message : "Terjadi kesalahan. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setTakingOrder(null);
    }
  }, [takeOrder, toast, navigate, driverLocation]);

  const handleRefresh = useCallback(async () => {
    console.log('=== MANUAL REFRESH TRIGGERED ===');
    
    if (refreshLocation) {
      await refreshLocation();
    }
    
    toast({
      title: "Refreshing...",
      description: "Memperbarui lokasi dan daftar order",
    });
  }, [refreshLocation, toast]);

  // Enhanced loading state
  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-white/20 rounded mb-2"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/10 rounded-xl p-4">
                <div className="h-4 bg-white/20 rounded mb-2"></div>
                <div className="h-3 bg-white/20 rounded mb-2"></div>
                <div className="h-3 bg-white/20 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Enhanced error state
  if (ordersError && !displayOrders.length) {
    return (
      <div className={`bg-red-500/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-red-500/20 ${className}`}>
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p className="text-white text-lg font-medium mb-2">Error Memuat Orders</p>
        <p className="text-red-300 text-sm mb-4">{ordersError}</p>
        <Button
          onClick={handleRefresh}
          className="bg-red-500/20 border border-red-500/30 text-red-200 hover:bg-red-500/30"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Coba Lagi
        </Button>
      </div>
    );
  }

  // Enhanced empty state with detailed debug info
  if (displayOrders.length === 0) {
    return (
      <div className={`bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center ${className}`}>
        <Clock className="w-12 h-12 text-white/50 mx-auto mb-3" />
        <p className="text-white text-lg font-medium mb-2">Belum Ada Order Tersedia</p>
        <p className="text-white/70 text-sm mb-4">Order baru akan muncul secara real-time</p>
        
        <div className="bg-white/5 rounded-xl p-4 text-left space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-white/60 text-xs flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              ENHANCED SYSTEM STATUS:
            </p>
            <Button
              onClick={handleRefresh}
              size="sm"
              className="h-6 px-2 bg-blue-500/20 border border-blue-500/30 text-blue-200 hover:bg-blue-500/30 text-xs"
            >
              <RefreshCw className="w-3 h-3" />
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-white/50 text-xs flex items-center">
                {driverLocation ? (
                  <Wifi className="w-3 h-3 mr-1 text-green-400" />
                ) : (
                  <WifiOff className="w-3 h-3 mr-1 text-red-400" />
                )}
                GPS Status:
              </span>
              <span className="text-white/70 text-xs">
                {driverLocation ? 
                  `${driverLocation.lat.toFixed(3)}, ${driverLocation.lng.toFixed(3)}` : 
                  'Tidak tersedia'
                }
              </span>
            </div>
            
            {locationError && (
              <p className="text-red-400 text-xs">GPS Error: {locationError}</p>
            )}
            
            {ordersError && (
              <p className="text-orange-400 text-xs">Orders Error: {ordersError}</p>
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-white/50 text-xs">Last Update:</span>
              <span className="text-white/70 text-xs">
                {lastUpdateTime.toLocaleTimeString('id-ID')}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-white/50 text-xs">Radius:</span>
              <span className="text-white/70 text-xs">15 KM</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced orders display
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-white text-lg font-semibold">
          Order Tersedia ({displayOrders.length})
        </h3>
        <div className="flex items-center space-x-2">
          <div className="text-white/60 text-xs flex items-center">
            {driverLocation ? (
              <Wifi className="w-3 h-3 mr-1 text-green-400" />
            ) : (
              <WifiOff className="w-3 h-3 mr-1 text-red-400" />
            )}
            {driverLocation ? 
              `${driverLocation.lat.toFixed(2)}, ${driverLocation.lng.toFixed(2)}` :
              'No GPS'
            }
          </div>
          <Button
            onClick={handleRefresh}
            size="sm"
            className="h-6 px-2 bg-blue-500/20 border border-blue-500/30 text-blue-200 hover:bg-blue-500/30 text-xs"
          >
            <RefreshCw className="w-3 h-3" />
          </Button>
        </div>
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {displayOrders.map((order) => (
          <div 
            key={order.id} 
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10"
          >
            <div className="mb-3">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-white font-semibold text-base">
                  Order #{order.shortId}
                </h4>
                <div className="flex items-center space-x-2">
                  <div className="bg-[#fdbc40] text-[#07595A] px-2 py-1 rounded-full text-sm font-medium">
                    {order.distanceText}
                  </div>
                  {!order.hasCoordinates && (
                    <div className="bg-orange-500/20 text-orange-300 px-2 py-1 rounded-full text-xs">
                      No GPS
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-1.5" />
                  <div className="flex-1">
                    <p className="text-white/70 text-xs">Pickup:</p>
                    <p className="text-white text-sm font-medium">{order.shortPickup}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-1.5" />
                  <div className="flex-1">
                    <p className="text-white/70 text-xs">Tujuan:</p>
                    <p className="text-white text-sm font-medium">{order.shortDestination}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-2 flex justify-between items-center text-xs">
                <div className="text-white/50 flex items-center">
                  <OrderUserName userId={order.user_id} className="text-white/60" />
                  <span className="mx-1">•</span>
                  <span>{order.timeText}</span>
                </div>
                <div className="text-[#fdbc40] capitalize">
                  {order.status.replace('_', ' ')}
                </div>
              </div>
            </div>

            <Button
              onClick={() => handleTakeOrder(order.id)}
              disabled={takingOrder === order.id}
              className="w-full bg-[#fdbc40] text-[#07595A] py-2 rounded-xl font-medium transition-colors hover:bg-[#fdbc40]/90 disabled:opacity-50"
            >
              {takingOrder === order.id ? "Mengambil..." : "Ambil Order"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnhancedNearbyOrdersList;
