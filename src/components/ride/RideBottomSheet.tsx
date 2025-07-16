import React, { useState, useCallback, useEffect } from 'react';
import { MapPin, Star, Package, Edit2, Phone, Navigation, Crosshair, Clock, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { orderService } from '@/services/orderService';
import { useOrderState } from '@/contexts/OrderStateContext';
import { useUserDisplayName } from '@/hooks/useUserDisplayName';
import * as ttapi from '@tomtom-international/web-sdk-services';

const TOMTOM_API_KEY = 'iA54SRddlkPve4SnJ18SpJQPe91ZQZNu';

interface RideBottomSheetProps {
  state: 'destination' | 'waiting' | 'driver_coming' | 'driver_arrived';
  destination?: string;
  destinationAddress?: string;
  driverName?: string;
  driverRating?: number;
  reviewCount?: number;
  remainingQuota?: number;
  onConfirmDestination?: () => void;
  onConfirmOrder?: () => void;
  onCancel?: () => void;
  onArrivedAtPickup?: () => void;
  onEditDestination?: () => void;
  isVisible?: boolean;
  onToggleVisibility?: () => void;
  pickupLocation?: { lat: number; lng: number; address: string };
  onOrderCreated?: () => void;
  onShowWaitingPopup?: () => void;
}

const RideBottomSheet: React.FC<RideBottomSheetProps> = ({
  state,
  destination = "Universitas Brawijaya",
  destinationAddress = "Jl. Veteran, Ketawanggede, Kec. Lowokwaru, Kota Malang, Jawa Timur 65145",
  driverName = "Naksu Cahya Putri",
  driverRating = 4.5,
  reviewCount = 498,
  remainingQuota = 5,
  onConfirmDestination,
  onConfirmOrder,
  onCancel,
  onArrivedAtPickup,
  onEditDestination,
  isVisible = true,
  onToggleVisibility,
  pickupLocation,
  onOrderCreated,
  onShowWaitingPopup
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [destinationInput, setDestinationInput] = useState(destinationAddress || '');
  const [isEditingDestination, setIsEditingDestination] = useState(false);
  const [destinationCoords, setDestinationCoords] = useState<{ lat: number; lng: number } | null>(null);
  
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const { creationState, setCreationState, resetCreationState } = useOrderState();
  const { displayName: userDisplayName, loading: nameLoading } = useUserDisplayName();

  // Update inputs when props change
  useEffect(() => {
    if (destinationAddress && destinationAddress !== "Ketuk lokasi di peta untuk memilih tujuan") {
      setDestinationInput(destinationAddress);
    }
  }, [destinationAddress]);

  const handleDestinationSearch = async (address: string) => {
    try {
      setCreationState({ currentStep: 'Mencari alamat tujuan...' });
      
      const coords = await orderService.geocodeAddress(
        address, 
        pickupLocation ? { lat: pickupLocation.lat, lng: pickupLocation.lng } : undefined
      );
      
      if (coords) {
        setDestinationCoords(coords);
        console.log('RideBottomSheet: Destination coordinates found:', coords);
        return coords;
      }
      return null;
    } catch (error) {
      console.error('RideBottomSheet: Error geocoding destination:', error);
      return null;
    }
  };

  const handleOrderOjek = async () => {
    if (!currentUser) {
      toast({
        title: "Gagal membuat order",
        description: "Anda harus login terlebih dahulu",
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

    if (!destinationInput || destinationInput === "Ketuk lokasi di peta untuk memilih tujuan") {
      toast({
        title: "Gagal membuat order",
        description: "Silakan pilih tujuan terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    if (!pickupLocation) {
      toast({
        title: "Gagal membuat order",
        description: "Lokasi pickup tidak ditemukan",
        variant: "destructive",
      });
      return;
    }

    // Reset and start order creation process
    resetCreationState();
    setCreationState({ 
      isCreating: true, 
      progress: 20, 
      currentStep: 'Mempersiapkan order...' 
    });

    try {
      // Step 1: Validate destination coordinates
      let finalDestinationCoords = destinationCoords;
      if (!finalDestinationCoords) {
        setCreationState({ 
          progress: 40, 
          currentStep: 'Mencari koordinat tujuan...' 
        });
        
        finalDestinationCoords = await handleDestinationSearch(destinationInput);
        if (!finalDestinationCoords) {
          finalDestinationCoords = { lat: -7.9696, lng: 112.6356 };
        }
      }

      // Step 2: Create order with complete user information
      setCreationState({ 
        progress: 60, 
        currentStep: 'Membuat order...' 
      });

      const orderId = await orderService.createOrder({
        user_id: currentUser.uid,
        user_name: userDisplayName || currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
        user_email: currentUser.email || '',
        pickup: pickupLocation.address,
        destination: destinationInput,
        destinationAddress: destinationInput,
        pickup_coordinates: {
          lat: pickupLocation.lat,
          lng: pickupLocation.lng
        }
      });

      // Step 3: Success
      setCreationState({ 
        progress: 100, 
        currentStep: 'Order berhasil dibuat!' 
      });

      toast({
        title: "Order berhasil dibuat!",
        description: `Order #${orderId.slice(-6)} sedang mencari driver...`,
      });

      // Trigger callbacks
      if (onOrderCreated) {
        onOrderCreated();
      }

      if (onConfirmDestination) {
        onConfirmDestination();
      }

      // Reset state after delay
      setTimeout(() => {
        resetCreationState();
      }, 2000);

    } catch (error: any) {
      console.error('RideBottomSheet: Order creation error:', error);
      
      setCreationState({ 
        error: error.message,
        isCreating: false 
      });
      
      toast({
        title: "Gagal membuat order",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!isVisible) {
    return null;
  }

  const renderWaitingState = () => (
    <div className="bg-amber-600 rounded-t-3xl shadow-2xl">
      <div className="flex items-center justify-between p-4 pb-2">
        <h2 className="text-lg font-semibold text-white">Mencari Driver...</h2>
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
          <Loader2 className="h-4 w-4 text-white animate-spin" />
        </div>
      </div>
      
      <div className="px-4 pb-6">
        <p className="text-white/90 text-sm mb-4">
          Kami sedang mencari driver terdekat untuk Anda. Mohon tunggu sebentar...
        </p>
        
        <Button
          onClick={onCancel}
          variant="outline"
          className="w-full border-white/20 text-white hover:bg-white/10"
        >
          Batalkan Pencarian
        </Button>
      </div>
    </div>
  );

  const renderDestinationState = () => (
    <div className="bg-[#07595A] rounded-t-3xl shadow-2xl">
      <div className="flex items-center justify-between p-4 pb-2">
        <h2 className="text-lg font-semibold text-white">Konfirmasi Perjalanan</h2>
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-all duration-200"
        >
          {isMinimized ? (
            <ChevronUp className="h-4 w-4 text-white" />
          ) : (
            <ChevronDown className="h-4 w-4 text-white" />
          )}
        </button>
      </div>
      
      {!isMinimized && (
        <div className="px-4 pb-6">
          {/* Pickup Location Display */}
          <div className="mb-4">
            <p className="text-white/80 text-sm font-medium mb-2">Lokasi Jemput</p>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-white font-medium text-sm">Lokasi Anda</p>
                  <p className="text-white/70 text-xs mt-1">{pickupLocation?.address}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Destination Section */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/80 text-sm font-medium">Tujuan</p>
              <Button
                onClick={() => setIsEditingDestination(true)}
                size="sm"
                className="h-8 px-3 bg-white/20 hover:bg-white/30 text-white border-white/20 rounded-full text-xs"
              >
                <Edit2 className="h-3 w-3 mr-1" />
                Edit
              </Button>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
              {isEditingDestination ? (
                <div className="flex space-x-2">
                  <Input
                    value={destinationInput}
                    onChange={(e) => setDestinationInput(e.target.value)}
                    placeholder="Masukkan alamat tujuan..."
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    onKeyPress={async (e) => {
                      if (e.key === 'Enter') {
                        const coords = await handleDestinationSearch(destinationInput);
                        if (coords) {
                          setDestinationCoords(coords);
                          setIsEditingDestination(false);
                        }
                      }
                    }}
                  />
                  <Button
                    onClick={async () => {
                      const coords = await handleDestinationSearch(destinationInput);
                      if (coords) {
                        setDestinationCoords(coords);
                        setIsEditingDestination(false);
                      }
                    }}
                    size="sm"
                    className="bg-[#fdbc40] hover:bg-[#e6a835] text-[#07595A]"
                  >
                    Cari
                  </Button>
                </div>
              ) : (
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mt-1">
                    <Navigation className="h-3 w-3 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">
                      {destinationInput && destinationInput !== "Ketuk lokasi di peta untuk memilih tujuan" 
                        ? (destinationInput.length > 30 ? destinationInput.substring(0, 30) + '...' : destinationInput)
                        : "Pilih tujuan Anda"
                      }
                    </p>
                    {destinationInput && destinationInput !== "Ketuk lokasi di peta untuk memilih tujuan" && (
                      <p className="text-white/70 text-xs mt-1">{destinationInput}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quota Info */}
          <div className="flex items-center justify-between p-3 bg-amber-500/20 rounded-xl border border-amber-500/30 mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <span className="text-amber-100 text-sm font-medium">Kuota harian tersisa</span>
            </div>
            <span className="text-amber-100 text-lg font-bold">{remainingQuota}</span>
          </div>

          {/* Enhanced Action Button with Progress */}
          <Button
            onClick={handleOrderOjek}
            disabled={creationState.isCreating || !destinationInput || destinationInput === "Ketuk lokasi di peta untuk memilih tujuan" || destinationInput.trim() === ""}
            className="w-full bg-white hover:bg-white/90 text-[#07595A] font-semibold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creationState.isCreating ? (
              <div className="flex flex-col items-center space-y-1">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{creationState.currentStep}</span>
                </div>
                {creationState.progress > 0 && (
                  <div className="w-full bg-[#07595A]/20 rounded-full h-1">
                    <div 
                      className="bg-[#07595A] h-1 rounded-full transition-all duration-300"
                      style={{ width: `${creationState.progress}%` }}
                    />
                  </div>
                )}
              </div>
            ) : creationState.error ? (
              <span className="text-red-600">Error: {creationState.error}</span>
            ) : (
              "Konfirmasi Perjalanan"
            )}
          </Button>

          {creationState.error && (
            <Button
              onClick={() => {
                resetCreationState();
                handleOrderOjek();
              }}
              variant="outline"
              className="w-full mt-2 border-white/20 text-white hover:bg-white/10"
            >
              Coba Lagi
            </Button>
          )}
        </div>
      )}
    </div>
  );

  const renderDriverComingState = () => (
    <div className="p-6 bg-white rounded-t-3xl shadow-lg">
      <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6"></div>
      
      <div className="mb-6">
        <div className="text-sm text-gray-600 mb-2">Dijemput oleh</div>
        
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-lg">
              {driverName?.charAt(0) || 'N'}
            </span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{driverName}</h3>
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium">{driverRating}</span>
              <span className="text-sm text-gray-600">({reviewCount})</span>
              <div className="flex items-center space-x-1 ml-2">
                <Package className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-600">Berat badan: 120kg</span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700"
          >
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Phone className="h-4 w-4" />
            </div>
          </Button>
        </div>

        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-1">
            <MapPin className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">{destination}</h4>
            <p className="text-sm text-gray-600 mt-1">{destinationAddress}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Button
          onClick={onConfirmOrder}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium text-base"
        >
          Konfirmasi Pesanan
        </Button>
        
        <Button
          onClick={onCancel}
          variant="outline"
          className="w-full border-red-200 text-red-600 hover:bg-red-50 py-3 rounded-xl font-medium text-base"
        >
          Batalkan
        </Button>
      </div>
    </div>
  );

  const renderDriverArrivedState = () => (
    <div className="p-6 bg-white rounded-t-3xl shadow-lg">
      <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6"></div>
      
      <div className="mb-6">
        <div className="text-sm text-gray-600 mb-2">Dijemput oleh</div>
        
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-lg">
              {driverName?.charAt(0) || 'N'}
            </span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{driverName}</h3>
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium">{driverRating}</span>
              <span className="text-sm text-gray-600">({reviewCount})</span>
              <div className="flex items-center space-x-1 ml-2">
                <Package className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-600">Berat badan: 120kg</span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700"
          >
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Phone className="h-4 w-4" />
            </div>
          </Button>
        </div>

        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-1">
            <MapPin className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">{destination}</h4>
            <p className="text-sm text-gray-600 mt-1">{destinationAddress}</p>
          </div>
        </div>
      </div>

      <Button
        onClick={onArrivedAtPickup}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium text-base"
      >
        Tiba di titik jemput
      </Button>
    </div>
  );

  switch (state) {
    case 'destination':
      return renderDestinationState();
    case 'waiting':
      return renderWaitingState();
    case 'driver_coming':
      return renderDriverComingState();
    case 'driver_arrived':
      return renderDriverArrivedState();
    default:
      return renderDestinationState();
  }
};

export default RideBottomSheet;
