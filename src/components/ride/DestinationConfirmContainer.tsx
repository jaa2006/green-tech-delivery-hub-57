import React, { useState, useCallback, useEffect } from 'react';
import { MapPin, Navigation, Crosshair, Clock, Loader2, ChevronDown, ChevronUp, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import * as ttapi from '@tomtom-international/web-sdk-services';

const TOMTOM_API_KEY = 'iA54SRddlkPve4SnJ18SpJQPe91ZQZNu';

interface DestinationConfirmContainerProps {
  destination: string;
  destinationAddress: string;
  pickupLocation: { lat: number; lng: number; address: string };
  onDestinationChange: (location: { lat: number; lng: number; address: string }) => void;
  onPickupLocationChange: (location: { lat: number; lng: number; address: string }) => void;
  onConfirmDestination: () => void;
  onOrderCreated?: () => void;
  remainingQuota?: number;
  isVisible?: boolean;
  onClose?: () => void;
}

const DestinationConfirmContainer: React.FC<DestinationConfirmContainerProps> = ({
  destination,
  destinationAddress,
  pickupLocation,
  onDestinationChange,
  onPickupLocationChange,
  onConfirmDestination,
  onOrderCreated,
  remainingQuota = 5,
  isVisible = true,
  onClose
}) => {
  const [isEditingPickup, setIsEditingPickup] = useState(false);
  const [isEditingDestination, setIsEditingDestination] = useState(false);
  const [pickupInput, setPickupInput] = useState(pickupLocation.address);
  const [destinationInput, setDestinationInput] = useState(destinationAddress);
  const [loading, setLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [destinationCoords, setDestinationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  
  const { toast } = useToast();
  const { currentUser } = useAuth();

  useEffect(() => {
    setPickupInput(pickupLocation.address);
  }, [pickupLocation.address]);

  useEffect(() => {
    if (destinationAddress && destinationAddress !== "Ketuk lokasi di peta untuk memilih tujuan") {
      setDestinationInput(destinationAddress);
    }
  }, [destinationAddress]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "GPS tidak tersedia",
        description: "Browser Anda tidak mendukung GPS",
        variant: "destructive",
      });
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          const response = await ttapi.services.reverseGeocode({
            key: TOMTOM_API_KEY,
            position: { lat: latitude, lon: longitude }
          });

          let address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          if (response.addresses && response.addresses.length > 0) {
            address = response.addresses[0].address.freeformAddress;
          }

          const location = {
            lat: latitude,
            lng: longitude,
            address: address
          };

          setPickupInput(address);
          onPickupLocationChange(location);
          setIsEditingPickup(false);
          
          toast({
            title: "Lokasi berhasil dideteksi",
            description: address,
          });
        } catch (error) {
          console.error('Reverse geocoding error:', error);
          const fallbackAddress = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          setPickupInput(fallbackAddress);
          onPickupLocationChange({
            lat: latitude,
            lng: longitude,
            address: fallbackAddress
          });
          setIsEditingPickup(false);
        }
        
        setIsGettingLocation(false);
      },
      (error) => {
        setIsGettingLocation(false);
        console.error('GPS Error:', error);
        toast({
          title: "Gagal mendapatkan lokasi",
          description: "Pastikan GPS aktif dan coba lagi",
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const handlePickupSearch = async () => {
    if (!pickupInput.trim()) return;

    try {
      const response = await ttapi.services.fuzzySearch({
        key: TOMTOM_API_KEY,
        query: pickupInput.trim(),
        limit: 1,
        center: { lat: pickupLocation.lat, lon: pickupLocation.lng },
        radius: 50000
      });

      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        const location = {
          lat: result.position.lat,
          lng: result.position.lng,
          address: result.address.freeformAddress
        };
        
        onPickupLocationChange(location);
        setIsEditingPickup(false);
        toast({
          title: "Lokasi pickup ditemukan",
          description: location.address,
        });
      } else {
        toast({
          title: "Lokasi tidak ditemukan",
          description: "Coba masukkan alamat yang lebih spesifik",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      toast({
        title: "Gagal mencari lokasi",
        description: "Terjadi kesalahan saat mencari alamat",
        variant: "destructive",
      });
    }
  };

  const handleDestinationSearch = async () => {
    if (!destinationInput.trim()) return;

    try {
      const response = await ttapi.services.fuzzySearch({
        key: TOMTOM_API_KEY,
        query: destinationInput.trim(),
        limit: 1,
        center: { lat: pickupLocation.lat, lon: pickupLocation.lng },
        radius: 50000
      });

      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        const location = {
          lat: result.position.lat,
          lng: result.position.lng,
          address: result.address.freeformAddress
        };
        
        setDestinationCoords({ lat: location.lat, lng: location.lng });
        onDestinationChange(location);
        setIsEditingDestination(false);
        toast({
          title: "Tujuan ditemukan",
          description: location.address,
        });
      } else {
        toast({
          title: "Tujuan tidak ditemukan",
          description: "Coba masukkan alamat yang lebih spesifik",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      toast({
        title: "Gagal mencari tujuan",
        description: "Terjadi kesalahan saat mencari alamat",
        variant: "destructive",
      });
    }
  };

  const handleOrderOjek = async () => {
    console.log('=== ORDER CREATION DEBUG ===');
    console.log('DestinationConfirmContainer: handleOrderOjek called');

    if (!currentUser) {
      console.log('DestinationConfirmContainer: No current user found');
      toast({
        title: "Gagal membuat order",
        description: "Anda harus login terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    if (!destinationInput || destinationInput === "Ketuk lokasi di peta untuk memilih tujuan") {
      console.log('DestinationConfirmContainer: No destination address');
      toast({
        title: "Gagal membuat order",
        description: "Silakan pilih tujuan terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    let finalDestinationCoords = destinationCoords;
    
    if (!finalDestinationCoords && destinationInput !== "Ketuk lokasi di peta untuk memilih tujuan") {
      finalDestinationCoords = { lat: -6.2088, lng: 106.8456 };
      console.log('DestinationConfirmContainer: Using fallback coordinates for destination');
    }

    if (!finalDestinationCoords) {
      console.log('DestinationConfirmContainer: No destination coordinates available');
      toast({
        title: "Gagal membuat order",
        description: "Koordinat tujuan tidak ditemukan, silakan pilih ulang tujuan",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Enhanced order data with standardized field names and additional debugging info
      const orderData = {
        user_id: currentUser.uid,
        pickup: pickupLocation.address,
        destination: destinationInput,
        pickup_coordinates: {
          lat: pickupLocation.lat,
          lng: pickupLocation.lng
        },
        destination_coordinates: {
          lat: finalDestinationCoords.lat,
          lng: finalDestinationCoords.lng
        },
        status: "waiting", // Explicit waiting status
        assigned_driver_id: null, // Standardized field name, explicitly null
        driver_data: null, // Initialize as null
        created_at: Timestamp.now(),
        updated_at: Timestamp.now(),
        // Add debugging fields
        debug_info: {
          user_email: currentUser.email,
          created_timestamp: new Date().toISOString(),
          pickup_distance_from_jakarta: Math.sqrt(
            Math.pow(pickupLocation.lat - (-6.2088), 2) + 
            Math.pow(pickupLocation.lng - 106.8456, 2)
          ).toFixed(6)
        }
      };

      console.log('DestinationConfirmContainer: Creating order with enhanced data:', orderData);
      console.log('DestinationConfirmContainer: User ID:', currentUser.uid);
      console.log('DestinationConfirmContainer: Pickup coordinates:', orderData.pickup_coordinates);
      console.log('DestinationConfirmContainer: Destination coordinates:', orderData.destination_coordinates);

      const ordersRef = collection(db, 'orders');
      const docRef = await addDoc(ordersRef, orderData);

      console.log('DestinationConfirmContainer: Order created successfully with ID:', docRef.id);
      console.log('DestinationConfirmContainer: Order should now be visible to drivers within 5km of pickup location');
      console.log('================================');

      toast({
        title: "Berhasil membuat order!",
        description: `Order #${docRef.id.slice(-6)} telah dibuat. Mencari driver terdekat...`,
      });

      if (onOrderCreated) {
        onOrderCreated();
      }

      onConfirmDestination();

    } catch (error: any) {
      console.error('DestinationConfirmContainer: Error creating order:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      if (error.code === 'permission-denied') {
        toast({
          title: "Gagal membuat order",
          description: "Tidak memiliki izin untuk membuat order. Silakan hubungi administrator.",
          variant: "destructive",
        });
      } else if (error.code === 'unavailable') {
        toast({
          title: "Gagal membuat order", 
          description: "Koneksi database terputus. Periksa koneksi internet Anda.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Gagal membuat order",
          description: `Error: ${error.message || 'Periksa data dan coba lagi!'}`,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="bg-[#07595A] rounded-t-3xl shadow-2xl">
      {/* Header dengan tombol minimize/maximize */}
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
      
      {/* Content yang bisa di-minimize */}
      {!isMinimized && (
        <div className="px-4 pb-6">
          
          
          {/* Lokasi Jemput Section */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/80 text-sm font-medium">Lokasi Jemput</p>
              <Button
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                size="sm"
                className="h-8 w-8 p-0 bg-white/20 hover:bg-white/30 text-white border-white/20 rounded-full"
              >
                {isGettingLocation ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Crosshair className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
              {isEditingPickup ? (
                <div className="flex space-x-2">
                  <Input
                    value={pickupInput}
                    onChange={(e) => setPickupInput(e.target.value)}
                    placeholder="Masukkan alamat pickup..."
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    onKeyPress={(e) => e.key === 'Enter' && handlePickupSearch()}
                  />
                  <Button
                    onClick={handlePickupSearch}
                    size="sm"
                    className="bg-[#fdbc40] hover:bg-[#e6a835] text-[#07595A]"
                  >
                    Cari
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">Lokasi Anda</p>
                    <p className="text-white/70 text-xs mt-1">{pickupInput}</p>
                    <p className="text-white/50 text-xs mt-1">
                      Koordinat: {pickupLocation.lat.toFixed(6)}, {pickupLocation.lng.toFixed(6)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Tujuan Section */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/80 text-sm font-medium">Tujuan</p>
              <Button
                onClick={() => setIsEditingDestination(true)}
                size="sm"
                className="h-8 px-3 bg-white/20 hover:bg-white/30 text-white border-white/20 rounded-full text-xs"
              >
                <Edit className="h-3 w-3 mr-1" />
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
                    onKeyPress={(e) => e.key === 'Enter' && handleDestinationSearch()}
                  />
                  <Button
                    onClick={handleDestinationSearch}
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

          {/* Action Button */}
          <Button
            onClick={handleOrderOjek}
            disabled={loading || !destinationInput || destinationInput === "Ketuk lokasi di peta untuk memilih tujuan"}
            className="w-full bg-white hover:bg-white/90 text-[#07595A] font-semibold py-3 rounded-xl"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Membuat Order...</span>
              </div>
            ) : (
              "Konfirmasi Perjalanan"
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default DestinationConfirmContainer;
