
import { useState, useEffect } from 'react';
import * as ttapi from '@tomtom-international/web-sdk-services';

const TOMTOM_API_KEY = 'iA54SRddlkPve4SnJ18SpJQPe91ZQZNu';

interface Location {
  lat: number;
  lng: number;
  address: string;
}

export const useLocationManagement = () => {
  const [pickupLocation, setPickupLocation] = useState<Location>({
    lat: 0,
    lng: 0,
    address: "Mendapatkan lokasi Anda..."
  });
  const [destinationLocation, setDestinationLocation] = useState<Location | null>(null);
  const [distanceInfo, setDistanceInfo] = useState<{ distance: string; duration: string } | null>(null);

  // Get user's current location on hook initialization
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: "Lokasi Anda Saat Ini"
          };
          setPickupLocation(userLocation);
          
          // Reverse geocode to get proper address
          ttapi.services.reverseGeocode({
            key: TOMTOM_API_KEY,
            position: { lat: userLocation.lat, lon: userLocation.lng }
          }).then((response) => {
            if (response.addresses && response.addresses.length > 0) {
              const address = response.addresses[0].address.freeformAddress;
              setPickupLocation(prev => ({ ...prev, address }));
            }
          }).catch(console.error);
        },
        (error) => {
          console.error('Error getting GPS location:', error);
          // Fallback to default location (Jakarta) if GPS fails
          setPickupLocation({
            lat: -6.2088,
            lng: 106.8456,
            address: "Jakarta, Indonesia"
          });
        }
      );
    } else {
      // Fallback if geolocation is not supported
      setPickupLocation({
        lat: -6.2088,
        lng: 106.8456,
        address: "Jakarta, Indonesia"
      });
    }
  }, []);

  const handleLocationSelect = (location: Location) => {
    setDestinationLocation(location);
  };

  const handlePickupLocationUpdate = (location: Location) => {
    setPickupLocation(location);
  };

  const handleDistanceCalculated = (distance: string, duration: string) => {
    setDistanceInfo({ distance, duration });
  };

  const handleCalculateRoute = (origin: { lat: number; lng: number }, destination: { lat: number; lng: number }) => {
    setPickupLocation({ ...origin, address: pickupLocation.address });
    if (destinationLocation) {
      setDestinationLocation({ ...destination, address: destinationLocation.address });
    }
  };

  const handleGeocodeSearch = async (query: string) => {
    try {
      const response = await ttapi.services.fuzzySearch({
        key: TOMTOM_API_KEY,
        query: query,
        limit: 5,
        center: { lat: pickupLocation.lat, lon: pickupLocation.lng },
        radius: 50000
      });
      return response.results || [];
    } catch (error) {
      console.error('Geocoding error:', error);
      throw error;
    }
  };

  const handleReverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await ttapi.services.reverseGeocode({
        key: TOMTOM_API_KEY,
        position: { lat: lat, lon: lng }
      });

      if (response.addresses && response.addresses.length > 0) {
        return response.addresses[0].address.freeformAddress;
      }
      return 'Unknown location';
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      throw error;
    }
  };

  return {
    pickupLocation,
    destinationLocation,
    distanceInfo,
    handleLocationSelect,
    handlePickupLocationUpdate,
    handleDistanceCalculated,
    handleCalculateRoute,
    handleGeocodeSearch,
    handleReverseGeocode
  };
};
