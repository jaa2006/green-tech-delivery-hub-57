
import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface LocationPickerProps {
  label?: string;
  placeholder?: string;
  initialLocation?: { lat: number; lng: number; address: string };
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  isDarkTheme?: boolean;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  label,
  placeholder = "Masukkan lokasi...",
  initialLocation,
  onLocationSelect,
  isDarkTheme = false
}) => {
  const [address, setAddress] = useState(initialLocation?.address || "");
  const [isEditing, setIsEditing] = useState(false);

  // Use useCallback to memoize the onLocationSelect function
  const memoizedOnLocationSelect = useCallback(onLocationSelect, []);

  // Only update when initialLocation actually changes
  useEffect(() => {
    if (initialLocation && initialLocation.address !== address && !isEditing) {
      console.log('LocationPicker: Updating address from initialLocation:', initialLocation.address);
      setAddress(initialLocation.address);
      
      // Only call onLocationSelect if we have valid coordinates and the location has actually changed
      if (initialLocation.lat !== 0 && initialLocation.lng !== 0) {
        memoizedOnLocationSelect(initialLocation);
      }
    }
  }, [initialLocation?.address, initialLocation?.lat, initialLocation?.lng, address, isEditing, memoizedOnLocationSelect]);

  const handleAddressChange = (value: string) => {
    setAddress(value);
    setIsEditing(true);
  };

  const handleSearch = () => {
    if (address.trim()) {
      console.log('LocationPicker: Searching for:', address);
      // In a real implementation, you would geocode the address here
      // For now, we'll use default coordinates
      memoizedOnLocationSelect({
        lat: -6.2088,
        lng: 106.8456,
        address: address.trim()
      });
      setIsEditing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div>
      {label && (
        <label className={`block text-sm font-medium mb-2 ${isDarkTheme ? 'text-white/90' : 'text-gray-700'}`}>
          {label}
        </label>
      )}
      <div className={`flex items-center space-x-2 p-3 rounded-xl backdrop-blur-sm ${
        isDarkTheme ? 'bg-white/10 border border-white/20' : 'bg-gray-50 border border-gray-200'
      }`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          isDarkTheme ? 'bg-white/20' : 'bg-gray-200'
        }`}>
          <MapPin className={`h-4 w-4 ${isDarkTheme ? 'text-white' : 'text-gray-600'}`} />
        </div>
        <Input
          type="text"
          placeholder={placeholder}
          value={address}
          onChange={(e) => handleAddressChange(e.target.value)}
          onKeyPress={handleKeyPress}
          className={`flex-1 border-0 bg-transparent focus:ring-0 ${
            isDarkTheme ? 'text-white placeholder-white/50' : 'text-gray-900 placeholder-gray-500'
          }`}
        />
        <Button
          onClick={handleSearch}
          size="sm"
          variant="ghost"
          className={`p-2 ${isDarkTheme ? 'text-white hover:bg-white/10' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default LocationPicker;
