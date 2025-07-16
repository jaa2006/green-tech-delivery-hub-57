import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface ModernMapComponentProps {
  driverLocation?: { lat: number; lng: number } | null;
  userLocation?: { lat: number; lng: number };
  showRoute?: boolean;
}

const MAPBOX_TOKEN = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

export const ModernMapComponent: React.FC<ModernMapComponentProps> = ({ 
  driverLocation, 
  userLocation = { lat: -7.9666, lng: 112.6326 },
  showRoute = false 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const userMarker = useRef<mapboxgl.Marker | null>(null);
  const driverMarker = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    // Initialize map with Google Maps style
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [userLocation.lng, userLocation.lat],
      zoom: 15,
      bearing: 0,
      pitch: 0,
    });

    // Add user location marker (blue)
    const userMarkerElement = document.createElement('div');
    userMarkerElement.className = 'user-marker';
    userMarkerElement.style.cssText = `
      width: 20px;
      height: 20px;
      background-color: #3b82f6;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    `;

    userMarker.current = new mapboxgl.Marker(userMarkerElement)
      .setLngLat([userLocation.lng, userLocation.lat])
      .addTo(map.current);

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [userLocation]);

  // Update user location marker when userLocation changes
  useEffect(() => {
    if (!map.current || !userMarker.current) return;

    userMarker.current.setLngLat([userLocation.lng, userLocation.lat]);
    
    // Update map center if no driver location to track
    if (!driverLocation) {
      map.current.easeTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: 15,
        duration: 1000
      });
    }
  }, [userLocation, driverLocation]);

  // Update driver location and route
  useEffect(() => {
    if (!map.current || !driverLocation) return;

    // Remove existing driver marker
    if (driverMarker.current) {
      driverMarker.current.remove();
    }

    // Create driver marker (green car icon)
    const driverMarkerElement = document.createElement('div');
    driverMarkerElement.innerHTML = `
      <div style="
        width: 32px;
        height: 32px;
        background-color: #16a34a;
        border: 2px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
          <path d="M5,11L6.5,6.5H17.5L19,11M17.5,16A1.5,1.5 0 0,1 16,14.5A1.5,1.5 0 0,1 17.5,13A1.5,1.5 0 0,1 19,14.5A1.5,1.5 0 0,1 17.5,16M6.5,16A1.5,1.5 0 0,1 5,14.5A1.5,1.5 0 0,1 6.5,13A1.5,1.5 0 0,1 8,14.5A1.5,1.5 0 0,1 6.5,16M18.92,6C18.72,5.42 18.16,5 17.5,5H6.5C5.84,5 5.28,5.42 5.08,6L3,12V20A1,1 0 0,0 4,21H5A1,1 0 0,0 6,20V19H18V20A1,1 0 0,0 19,21H20A1,1 0 0,0 21,20V12L18.92,6Z"/>
        </svg>
      </div>
    `;

    driverMarker.current = new mapboxgl.Marker(driverMarkerElement)
      .setLngLat([driverLocation.lng, driverLocation.lat])
      .addTo(map.current);

    // Add route line (orange)
    if (showRoute && map.current.isStyleLoaded()) {
      const routeCoordinates = [
        [driverLocation.lng, driverLocation.lat],
        [userLocation.lng, userLocation.lat]
      ];

      // Remove existing route if any
      if (map.current.getSource('route')) {
        map.current.removeLayer('route');
        map.current.removeSource('route');
      }

      map.current.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: routeCoordinates
          }
        }
      });

      map.current.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#f97316',
          'line-width': 4,
          'line-opacity': 0.8
        }
      });
    }

    // Fit bounds to show both markers
    const bounds = new mapboxgl.LngLatBounds();
    bounds.extend([userLocation.lng, userLocation.lat]);
    bounds.extend([driverLocation.lng, driverLocation.lat]);
    
    map.current.fitBounds(bounds, {
      padding: 80,
      maxZoom: 16
    });

  }, [driverLocation, showRoute, userLocation]);

  return (
    <div className="relative w-full h-full">
      <div 
        ref={mapContainer} 
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      />
    </div>
  );
};
