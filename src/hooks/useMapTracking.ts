
import { useEffect, useRef } from 'react';
import { initMapTracking, cleanupMapTracking } from '@/utils/mapTracking';

interface UseMapTrackingProps {
  driverId: string | null;
  enabled?: boolean;
}

export const useMapTracking = ({ driverId, enabled = true }: UseMapTrackingProps) => {
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!enabled || !driverId) {
      return;
    }

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      try {
        mapInstanceRef.current = initMapTracking(driverId);
      } catch (error) {
        console.error('Failed to initialize map tracking:', error);
      }
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (mapInstanceRef.current) {
        cleanupMapTracking();
        mapInstanceRef.current = null;
      }
    };
  }, [driverId, enabled]);

  useEffect(() => {
    return () => {
      cleanupMapTracking();
    };
  }, []);

  return mapInstanceRef.current;
};
