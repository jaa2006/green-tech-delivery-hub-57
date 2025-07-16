
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapComponentProps {
  driverLocation?: { lat: number; lng: number } | null;
  showDriverLocation?: boolean;
}

// Temporary public token - in production this should come from environment variables
const MAPBOX_TOKEN = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

export const MapComponent: React.FC<MapComponentProps> = ({ 
  driverLocation, 
  showDriverLocation = false 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Set Mapbox access token
    mapboxgl.accessToken = MAPBOX_TOKEN;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [106.8456, -6.2088], // Jakarta coordinates
      zoom: 13,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  // Update driver location marker
  useEffect(() => {
    if (!map.current || !showDriverLocation || !driverLocation) return;

    // Remove existing marker
    if (marker.current) {
      marker.current.remove();
    }

    // Add new marker for driver location
    marker.current = new mapboxgl.Marker({ color: '#00ff00' })
      .setLngLat([driverLocation.lng, driverLocation.lat])
      .setPopup(
        new mapboxgl.Popup({ offset: 25 })
          .setHTML(`<div>Driver Location<br/>Last updated: ${new Date().toLocaleTimeString()}</div>`)
      )
      .addTo(map.current);

    // Center map on driver location
    map.current.flyTo({
      center: [driverLocation.lng, driverLocation.lat],
      zoom: 15
    });
  }, [driverLocation, showDriverLocation]);

  return (
    <div className="w-full h-full rounded-xl overflow-hidden">
      <div 
        ref={mapContainer} 
        className="w-full h-full"
        style={{ minHeight: '300px' }}
      />
    </div>
  );
};
