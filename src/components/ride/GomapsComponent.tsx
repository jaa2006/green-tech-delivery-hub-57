
import React, { useEffect, useRef, useState } from 'react';

interface GomapsComponentProps {
  driverLocation?: { lat: number; lng: number } | null;
  userLocation?: { lat: number; lng: number };
  showRoute?: boolean;
  onDistanceCalculated?: (distance: string, duration: string) => void;
}

const GOMAPS_API_KEY = 'AlzaSyZeESi26cHhefwci9CkBwpQ-B1ZjyaS3ej';

export const GomapsComponent: React.FC<GomapsComponentProps> = ({
  driverLocation,
  userLocation = { lat: -7.9666, lng: 112.6326 },
  showRoute = false,
  onDistanceCalculated
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [userMarker, setUserMarker] = useState<any>(null);
  const [driverMarker, setDriverMarker] = useState<any>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Load Gomaps API
  useEffect(() => {
    const loadGomapsAPI = () => {
      // Check if Gomaps API is already loaded
      if (window.goMaps) {
        initializeMap();
        return;
      }

      // Create script element for Gomaps API
      const script = document.createElement('script');
      script.src = `https://maps.gomaps.pro/maps/api/js?key=${GOMAPS_API_KEY}&libraries=geometry&callback=initGoMaps`;
      script.async = true;
      script.defer = true;
      
      // Create global callback
      (window as any).initGoMaps = () => {
        initializeMap();
      };

      document.head.appendChild(script);
    };

    const initializeMap = () => {
      if (!mapRef.current || !window.goMaps) return;

      const mapInstance = new window.goMaps.Map(mapRef.current, {
        center: { lat: userLocation.lat, lng: userLocation.lng },
        zoom: 15,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ],
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      // Create user marker
      const userMarkerInstance = new window.goMaps.Marker({
        position: userLocation,
        map: mapInstance,
        title: 'Lokasi Anda',
        icon: {
          path: window.goMaps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#3b82f6',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        },
      });

      setMap(mapInstance);
      setUserMarker(userMarkerInstance);
      setIsMapLoaded(true);
    };

    loadGomapsAPI();
  }, []);

  // Update user location
  useEffect(() => {
    if (!map || !userMarker || !isMapLoaded) return;

    userMarker.setPosition(userLocation);
    if (!driverLocation) {
      map.setCenter(userLocation);
    }
  }, [userLocation, map, userMarker, driverLocation, isMapLoaded]);

  // Update driver location and route
  useEffect(() => {
    if (!map || !isMapLoaded) return;

    // Remove existing driver marker
    if (driverMarker) {
      driverMarker.setMap(null);
    }

    if (!driverLocation) {
      return;
    }

    // Create driver marker
    const driverMarkerInstance = new window.goMaps.Marker({
      position: driverLocation,
      map: map,
      title: 'Driver',
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="14" fill="#16a34a" stroke="#ffffff" stroke-width="2"/>
            <path d="M10 14l3-4h6l3 4M14 20a2 2 0 0 1-2-2 2 2 0 0 1 2-2 2 2 0 0 1 2 2 2 2 0 0 1-2 2M18 20a2 2 0 0 1-2-2 2 2 0 0 1 2-2 2 2 0 0 1 2 2 2 2 0 0 1-2 2" fill="white"/>
          </svg>
        `),
        scaledSize: new window.goMaps.Size(32, 32),
      },
    });

    setDriverMarker(driverMarkerInstance);

    // Show route if requested (simplified for now)
    if (showRoute && window.goMaps.DirectionsService) {
      const directionsService = new window.goMaps.DirectionsService();
      const directionsRenderer = new window.goMaps.DirectionsRenderer({
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#f97316',
          strokeOpacity: 0.8,
          strokeWeight: 4,
        },
      });
      
      directionsRenderer.setMap(map);

      directionsService.route(
        {
          origin: driverLocation,
          destination: userLocation,
          travelMode: window.goMaps.TravelMode.DRIVING,
        },
        (result: any, status: string) => {
          if (status === 'OK' && result) {
            directionsRenderer.setDirections(result);
          }
        }
      );

      // Calculate distance if callback provided
      if (onDistanceCalculated && window.goMaps.DistanceMatrixService) {
        const distanceService = new window.goMaps.DistanceMatrixService();
        distanceService.getDistanceMatrix(
          {
            origins: [driverLocation],
            destinations: [userLocation],
            travelMode: window.goMaps.TravelMode.DRIVING,
            unitSystem: window.goMaps.UnitSystem.METRIC,
          },
          (response: any, status: string) => {
            if (status === 'OK' && response && response.rows[0]?.elements[0]) {
              const element = response.rows[0].elements[0];
              if (element.status === 'OK') {
                onDistanceCalculated(
                  element.distance?.text || 'Unknown',
                  element.duration?.text || 'Unknown'
                );
              }
            }
          }
        );
      }
    }

    // Fit bounds to show both markers
    if (window.goMaps.LatLngBounds) {
      const bounds = new window.goMaps.LatLngBounds();
      bounds.extend(userLocation);
      bounds.extend(driverLocation);
      map.fitBounds(bounds, 80);
    }
  }, [driverLocation, showRoute, map, userLocation, onDistanceCalculated, isMapLoaded]);

  return (
    <div className="relative w-full h-full">
      <div 
        ref={mapRef} 
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      />
      {!isMapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-[#07595A] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">Memuat peta...</p>
          </div>
        </div>
      )}
    </div>
  );
};
