
import React, { useState, useEffect } from 'react';
import { MapPin, Crosshair, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { reverseGeocode } from '@/utils/gomapsGeocoding';
import { useGomapsGeocoding } from '@/hooks/useGomapsGeocoding';

interface GomapsLocationPickerProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  initialLocation?: { lat: number; lng: number; address: string };
  placeholder?: string;
  label?: string;
  isDarkTheme?: boolean;
}

const GomapsLocationPicker: React.FC<GomapsLocationPickerProps> = ({
  onLocationSelect,
  initialLocation,
  placeholder = "Masukkan alamat...",
  label = "Lokasi",
  isDarkTheme = false
}) => {
  const [address, setAddress] = useState(initialLocation?.address || '');
  const [isLoadingGPS, setIsLoadingGPS] = useState(false);
  const [showGPSPermissionDialog, setShowGPSPermissionDialog] = useState(false);

  // Use Gomaps geocoding hook with debouncing
  const { isLoading: isGeocodingLoading, coordinates, error } = useGomapsGeocoding(address, 1500);

  // Update parent component when coordinates change
  useEffect(() => {
    if (coordinates && address) {
      onLocationSelect({
        lat: coordinates.lat,
        lng: coordinates.lng,
        address: address
      });
    }
  }, [coordinates, address, onLocationSelect]);

  // Show geocoding error in toast
  useEffect(() => {
    if (error) {
      toast({
        title: "Pencarian alamat gagal",
        description: error,
        variant: "destructive",
      });
    }
  }, [error]);

  const requestGPSPermission = () => {
    setShowGPSPermissionDialog(true);
  };

  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "GPS tidak tersedia",
        description: "Browser Anda tidak mendukung GPS",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingGPS(true);
    setShowGPSPermissionDialog(false);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Use Gomaps reverse geocoding
          const geocodedAddress = await reverseGeocode(latitude, longitude);
          const finalAddress = geocodedAddress || `Lokasi GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          
          setAddress(finalAddress);
          onLocationSelect({
            lat: latitude,
            lng: longitude,
            address: finalAddress
          });
          
          toast({
            title: "Lokasi berhasil dideteksi",
            description: finalAddress,
          });
        } catch (error) {
          console.error('Gomaps reverse geocoding error:', error);
          const fallbackAddress = `Lokasi GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          setAddress(fallbackAddress);
          onLocationSelect({
            lat: latitude,
            lng: longitude,
            address: fallbackAddress
          });
          
          toast({
            title: "Lokasi berhasil dideteksi",
            description: "Koordinat GPS berhasil didapatkan",
          });
        }
        
        setIsLoadingGPS(false);
      },
      (error) => {
        setIsLoadingGPS(false);
        console.error('GPS Error:', error);
        
        if (error.code === error.PERMISSION_DENIED) {
          requestGPSPermission();
        } else {
          toast({
            title: "Gagal mendapatkan lokasi",
            description: "Pastikan GPS aktif dan coba lagi",
            variant: "destructive",
          });
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const handleAddressChange = (value: string) => {
    setAddress(value);
  };

  const labelClass = isDarkTheme ? "text-sm font-medium text-white/90" : "text-sm font-medium text-gray-700";
  const inputClass = isDarkTheme ? "bg-white/10 border-white/20 text-white placeholder:text-white/50" : "";
  const buttonClass = isDarkTheme ? "bg-white/20 hover:bg-white/30 text-white border-white/20" : "bg-[#07595A] hover:bg-[#064d4e] text-white";

  return (
    <div className="space-y-3">
      <label className={labelClass}>{label}</label>
      
      <div className="flex space-x-2">
        <div className="flex-1 relative">
          <Input
            value={address}
            onChange={(e) => handleAddressChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full ${inputClass}`}
          />
          {/* Geocoding loading indicator */}
          {isGeocodingLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            </div>
          )}
        </div>
        
        <Button
          onClick={handleUseCurrentLocation}
          disabled={isLoadingGPS}
          className={buttonClass}
          size="sm"
        >
          {isLoadingGPS ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Crosshair className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Geocoding status indicator */}
      {coordinates && address && !isGeocodingLoading && (
        <div className={`text-xs ${isDarkTheme ? 'text-white/70' : 'text-gray-600'} flex items-center space-x-1`}>
          <MapPin className="h-3 w-3" />
          <span>Koordinat: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}</span>
        </div>
      )}

      {/* GPS Permission Dialog */}
      {showGPSPermissionDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Izinkan Akses GPS</h3>
                <p className="text-sm text-gray-600">Untuk mendeteksi lokasi Anda</p>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-6">
              Habisin membutuhkan akses lokasi untuk memberikan layanan terbaik. 
              Silakan aktifkan GPS dan berikan izin akses lokasi.
            </p>
            
            <div className="flex space-x-3">
              <Button
                onClick={() => setShowGPSPermissionDialog(false)}
                variant="outline"
                className="flex-1"
              >
                Nanti Saja
              </Button>
              <Button
                onClick={handleUseCurrentLocation}
                className="flex-1 bg-[#07595A] hover:bg-[#064d4e] text-white"
              >
                Coba Lagi
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GomapsLocationPicker;
