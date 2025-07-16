
import { useState, useEffect, useCallback, useRef } from 'react';

interface DriverLocation {
  lat: number;
  lng: number;
  timestamp: number;
  accuracy?: number;
}

interface UseDriverLocationProps {
  enabled?: boolean;
  options?: PositionOptions;
  activeTripMode?: boolean; // Enhanced for active trips
}

export const useDriverLocation = ({ 
  enabled = true, 
  options = {
    enableHighAccuracy: false,
    timeout: 15000,
    maximumAge: 120000
  },
  activeTripMode = false // Enhanced mode for active trips
}: UseDriverLocationProps = {}) => {
  const [location, setLocation] = useState<DriverLocation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs to prevent memory leaks
  const watchIdRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const locationCacheRef = useRef<DriverLocation | null>(null);

  // Enhanced options for active trip mode
  const enhancedOptions = activeTripMode ? {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 30000 // More frequent updates during trip
  } : options;

  // Enhanced threshold for active trips (smaller = more updates)
  const updateThreshold = activeTripMode ? 5 : 30; // 5 meters vs 30 meters
  const timeThreshold = activeTripMode ? 15000 : 30000; // 15s vs 30s

  const handleSuccess = useCallback((position: GeolocationPosition) => {
    const now = Date.now();
    
    // Throttle updates based on mode
    if (now - lastUpdateRef.current < timeThreshold && locationCacheRef.current && !activeTripMode) {
      return;
    }
    
    const newLocation: DriverLocation = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      timestamp: now,
      accuracy: position.coords.accuracy
    };
    
    // Enhanced location change detection
    if (locationCacheRef.current) {
      const distance = calculateDistance(
        locationCacheRef.current.lat,
        locationCacheRef.current.lng,
        newLocation.lat,
        newLocation.lng
      );
      
      // Use dynamic threshold based on mode
      const threshold = updateThreshold / 1000; // Convert to km
      if (distance < threshold) {
        return;
      }
    }
    
    setLocation(newLocation);
    setIsLoading(false);
    setError(null);
    
    locationCacheRef.current = newLocation;
    lastUpdateRef.current = now;
    
    console.log('Driver location updated:', {
      lat: newLocation.lat.toFixed(4),
      lng: newLocation.lng.toFixed(4),
      accuracy: newLocation.accuracy?.toFixed(0) + 'm',
      mode: activeTripMode ? 'ACTIVE_TRIP' : 'NORMAL',
      threshold: `${updateThreshold}m`
    });
  }, [activeTripMode, timeThreshold, updateThreshold]);

  const handleError = useCallback((error: GeolocationPositionError) => {
    let errorMessage = 'Gagal mendapatkan lokasi';
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Akses lokasi ditolak - Aktifkan GPS';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Lokasi GPS tidak tersedia';
        break;
      case error.TIMEOUT:
        errorMessage = 'Timeout mendapatkan lokasi GPS';
        break;
    }
    
    setError(errorMessage);
    setIsLoading(false);
    console.error('Enhanced Geolocation error:', errorMessage, {
      code: error.code,
      activeTripMode
    });
  }, [activeTripMode]);

  // Simple distance calculation for location change detection
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  useEffect(() => {
    if (!enabled || !navigator.geolocation) {
      if (!navigator.geolocation) {
        setError('GPS tidak tersedia di perangkat ini');
      }
      return;
    }

    setIsLoading(true);
    setError(null);

    // Use cached location if available and recent (except in active trip mode)
    if (locationCacheRef.current && 
        Date.now() - locationCacheRef.current.timestamp < enhancedOptions.maximumAge! &&
        !activeTripMode) {
      setLocation(locationCacheRef.current);
      setIsLoading(false);
      return;
    }

    console.log('Enhanced Driver Location - Starting watch with options:', {
      enhancedOptions,
      activeTripMode,
      updateThreshold: `${updateThreshold}m`,
      timeThreshold: `${timeThreshold}ms`
    });

    // Start watching position with enhanced settings
    watchIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      enhancedOptions
    );

    // Cleanup function
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [enabled, handleSuccess, handleError, activeTripMode]);

  const refreshLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    
    setIsLoading(true);
    setError(null);
    
    console.log('Manual GPS refresh requested - activeTripMode:', activeTripMode);
    
    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0 // Force fresh location
      }
    );
  }, [handleSuccess, handleError, activeTripMode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);

  return {
    location,
    isLoading,
    error,
    refreshLocation
  };
};
