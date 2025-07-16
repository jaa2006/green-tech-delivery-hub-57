
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { MapPin, Navigation, Clock, AlertCircle, Wifi, WifiOff, Bug, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useNearbyOrders } from '@/hooks/useNearbyOrders';
import { useDriverLocation } from '@/hooks/useDriverLocation';
import { useUserName } from '@/hooks/useUserName';
import { useNavigate } from 'react-router-dom';
import { debugFirebaseOrders, debugDriverLocation } from '@/utils/firebaseDebugger';
import OrderUserName from './OrderUserName';

interface NearbyOrdersListProps {
  className?: string;
}

const NearbyOrdersList: React.FC<NearbyOrdersListProps> = ({ className = "" }) => {
  const { location: driverLocation, error: locationError } = useDriverLocation({ enabled: true });
  const { orders, loading, takeOrder } = useNearbyOrders(driverLocation || undefined);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [takingOrder, setTakingOrder] = useState<string | null>(null);
  const [debugMode, setDebugMode] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());

  // Optimized logging - only log on significant changes
  const logData = useMemo(() => ({
    orderCount: orders.length,
    hasLocation: !!driverLocation,
    isLoading: loading,
    timestamp: Date.now()
  }), [orders.length, driverLocation, loading]);

  useEffect(() => {
    console.log('=== NEARBY ORDERS UPDATE ===');
    console.log('Orders:', logData.orderCount);
    console.log('GPS:', logData.hasLocation ? 'Available' : 'Missing');
    console.log('Status:', logData.isLoading ? 'Loading' : 'Ready');
    setLastUpdateTime(new Date());
  }, [logData]);

  // Memoized order processing with user names
  const displayOrders = useMemo(() => {
    return orders.map(order => ({
      ...order,
      shortId: order.id.slice(-6),
      shortUserId: order.user_id.slice(-6),
      shortPickup: order.pickup.substring(0, 40),
      shortDestination: order.destination.substring(0, 40),
      distanceText: order.distance ? `${order.distance.toFixed(1)} KM` : 'Calculating...',
      timeText: order.created_at?.toDate ? 
        order.created_at.toDate().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) :
        'Baru saja'
    }));
  }, [orders]);

  const handleTakeOrder = useCallback(async (orderId: string) => {
    setTakingOrder(orderId);
    try {
      await takeOrder(orderId);
      toast({
        title: "Order berhasil diambil!",
        description: "Mengarahkan ke halaman antar penumpang...",
      });
      navigate('/antar-penumpang', { state: { orderId } });
    } catch (error) {
      console.error('Error taking order:', error);
      toast({
        title: "Gagal mengambil order",
        description: error instanceof Error ? error.message : "Terjadi kesalahan. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setTakingOrder(null);
    }
  }, [takeOrder, toast, navigate]);

  const handleRunDebug = useCallback(async () => {
    if (debugMode) return; // Prevent multiple calls
    
    setDebugMode(true);
    await debugFirebaseOrders();
    debugDriverLocation(driverLocation);
    
    toast({
      title: "Debug selesai",
      description: "Periksa console untuk detail",
    });
    
    setTimeout(() => setDebugMode(false), 3000);
  }, [debugMode, driverLocation, toast]);

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-white/20 rounded mb-2"></div>
          <div className="space-y-3">
            {[1, 2].map((i) => (
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

  if (displayOrders.length === 0) {
    return (
      <div className={`bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center ${className}`}>
        <Clock className="w-12 h-12 text-white/50 mx-auto mb-3" />
        <p className="text-white text-lg font-medium mb-2">Belum Ada Order Tersedia</p>
        <p className="text-white/70 text-sm mb-3">Order baru akan muncul secara real-time</p>
        
        <div className="bg-white/5 rounded-xl p-3 text-left">
          <p className="text-white/60 text-xs mb-1 flex items-center">
            <AlertCircle className="w-3 h-3 mr-1" />
            SYSTEM STATUS:
          </p>
          <div className="space-y-1">
            <p className="text-white/50 text-xs flex items-center">
              {driverLocation ? (
                <Wifi className="w-3 h-3 mr-1 text-green-400" />
              ) : (
                <WifiOff className="w-3 h-3 mr-1 text-red-400" />
              )}
              GPS: {driverLocation ? 
                `${driverLocation.lat.toFixed(3)}, ${driverLocation.lng.toFixed(3)}` : 
                'Mencari lokasi...'
              }
            </p>
            {locationError && (
              <p className="text-red-400 text-xs">Error: {locationError}</p>
            )}
            <p className="text-white/50 text-xs">
              • Last Update: {lastUpdateTime.toLocaleTimeString('id-ID')}
            </p>
          </div>
          
          <Button
            onClick={handleRunDebug}
            disabled={debugMode}
            size="sm"
            className="w-full mt-3 bg-orange-500/20 border border-orange-500/30 text-orange-200 hover:bg-orange-500/30"
          >
            {debugMode ? (
              <div className="flex items-center space-x-2">
                <Bug className="w-3 h-3 animate-spin" />
                <span>Running...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Bug className="w-3 h-3" />
                <span>Quick Debug</span>
              </div>
            )}
          </Button>
        </div>
      </div>
    );
  }

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
            onClick={handleRunDebug}
            disabled={debugMode}
            size="sm"
            className="h-6 px-2 bg-orange-500/20 border border-orange-500/30 text-orange-200 hover:bg-orange-500/30 text-xs"
          >
            <Bug className="w-3 h-3" />
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
                <div className="bg-[#fdbc40] text-[#07595A] px-2 py-1 rounded-full text-sm font-medium">
                  {order.distanceText}
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
                <div className="text-[#fdbc40]">
                  {order.status}
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

export default NearbyOrdersList;
