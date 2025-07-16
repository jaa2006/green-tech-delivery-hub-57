
import React, { useEffect, useRef, useState } from 'react';

interface GoogleMapComponentProps {
  driverLocation?: { lat: number; lng: number } | null;
  userLocation?: { lat: number; lng: number };
  showRoute?: boolean;
  onDistanceCalculated?: (distance: string, duration: string) => void;
}

const GOOGLE_MAPS_API_KEY = 'AlzaSyZeESi26cHhefwci9CkBwpQ-B1ZjyaS3ej';

export const GoogleMapComponent: React.FC<GoogleMapComponentProps> = ({
  driverLocation,
  userLocation = { lat: -7.9666, lng: 112.6326 },
  showRoute = false,
  onDistanceCalculated
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [userMarker, setUserMarker] = useState<any>(null);
  const [driverMarker, setDriverMarker] = useState<any>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<any>(null);
  const [directionsService, setDirectionsService] = useState<any>(null);
  const [distanceMatrixService, setDistanceMatrixService] = useState<any>(null);

  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=geometry`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      document.head.appendChild(script);
    };

    const initializeMap = () => {
      if (!mapRef.current || !window.google) return;

      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: userLocation,
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
      const userMarkerInstance = new window.google.maps.Marker({
        position: userLocation,
        map: mapInstance,
        title: 'Lokasi Anda',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#3b82f6',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        },
      });

      // Initialize services
      const directionsServiceInstance = new window.google.maps.DirectionsService();
      const directionsRendererInstance = new window.google.maps.DirectionsRenderer({
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#f97316',
          strokeOpacity: 0.8,
          strokeWeight: 4,
        },
      });
      directionsRendererInstance.setMap(mapInstance);

      const distanceMatrixServiceInstance = new window.google.maps.DistanceMatrixService();

      setMap(mapInstance);
      setUserMarker(userMarkerInstance);
      setDirectionsRenderer(directionsRendererInstance);
      setDirectionsService(directionsServiceInstance);
      setDistanceMatrixService(distanceMatrixServiceInstance);
    };

    loadGoogleMaps();
  }, []);

  // Update user location
  useEffect(() => {
    if (!map || !userMarker) return;

    userMarker.setPosition(userLocation);
    if (!driverLocation) {
      map.setCenter(userLocation);
    }
  }, [userLocation, map, userMarker, driverLocation]);

  // Update driver location and route
  useEffect(() => {
    if (!map || !directionsService || !directionsRenderer) return;

    // Remove existing driver marker
    if (driverMarker) {
      driverMarker.setMap(null);
    }

    if (!driverLocation) {
      directionsRenderer.setDirections({ routes: [] } as any);
      return;
    }

    // Create driver marker
    const driverMarkerInstance = new window.google.maps.Marker({
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
        scaledSize: new window.google.maps.Size(32, 32),
      },
    });

    setDriverMarker(driverMarkerInstance);

    // Show route if requested
    if (showRoute) {
      directionsService.route(
        {
          origin: driverLocation,
          destination: userLocation,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result: any, status: string) => {
          if (status === 'OK' && result) {
            directionsRenderer.setDirections(result);
          }
        }
      );

      // Calculate distance and duration
      if (distanceMatrixService && onDistanceCalculated) {
        distanceMatrixService.getDistanceMatrix(
          {
            origins: [driverLocation],
            destinations: [userLocation],
            travelMode: window.google.maps.TravelMode.DRIVING,
            unitSystem: window.google.maps.UnitSystem.METRIC,
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
    const bounds = new window.google.maps.LatLngBounds();
    bounds.extend(userLocation);
    bounds.extend(driverLocation);
    map.fitBounds(bounds, 80);
  }, [driverLocation, showRoute, map, directionsService, directionsRenderer, distanceMatrixService, userLocation, onDistanceCalculated]);

  return (
    <div className="relative w-full h-full">
      <div 
        ref={mapRef} 
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      />
    </div>
  );
};
