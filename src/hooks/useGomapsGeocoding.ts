
import { useState, useEffect, useCallback } from 'react';
import { geocodeAddress, Coordinates } from '@/utils/gomapsGeocoding';

interface UseGomapsGeocodingResult {
  isLoading: boolean;
  coordinates: Coordinates | null;
  error: string | null;
}

/**
 * Custom hook for geocoding addresses with Gomaps API and debouncing
 * @param address - Address string to geocode
 * @param delay - Debounce delay in milliseconds (default: 1000)
 * @returns Object with loading state, coordinates, and error
 */
export const useGomapsGeocoding = (address: string, delay: number = 1000): UseGomapsGeocodingResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [error, setError] = useState<string | null>(null);

  const debouncedGeocode = useCallback(
    async (addressToGeocode: string) => {
      if (!addressToGeocode || addressToGeocode.trim().length < 3) {
        setCoordinates(null);
        setError(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await geocodeAddress(addressToGeocode);
        
        if (result) {
          setCoordinates(result);
        } else {
          setError("Alamat tidak ditemukan");
          setCoordinates(null);
        }
      } catch (err) {
        setError("Terjadi kesalahan saat mencari alamat");
        setCoordinates(null);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      debouncedGeocode(address);
    }, delay);

    return () => clearTimeout(timer);
  }, [address, delay, debouncedGeocode]);

  return { isLoading, coordinates, error };
};
