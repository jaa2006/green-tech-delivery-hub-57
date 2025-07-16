
import React, { useEffect, useRef, useState } from "react";
import * as tt from "@tomtom-international/web-sdk-maps";
import "@tomtom-international/web-sdk-maps/dist/maps.css";
import { useDriverLocation } from "@/hooks/useDriverLocation";

interface DriverTrackingMapProps {
  className?: string;
  onLocationUpdate?: (location: { lat: number; lng: number }) => void;
}

const TOMTOM_API_KEY = 'iA54SRddlkPve4SnJ18SpJQPe91ZQZNu';

const DriverTrackingMap: React.FC<DriverTrackingMapProps> = ({
  className = "",
  onLocationUpdate
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const driverMarker = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  
  const { location, isLoading, error, refreshLocation } = useDriverLocation({
    enabled: true,
    options: {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 30000
    }
  });

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    try {
      const map = tt.map({
        key: TOMTOM_API_KEY,
        container: mapRef.current,
        center: [106.8272, -6.1751], // Default Jakarta coordinates
        zoom: 15,
      });

      mapInstance.current = map;

      map.on('load', () => {
        setIsMapReady(true);
      });

      // Cleanup function
      return () => {
        if (mapInstance.current) {
          mapInstance.current.remove();
          mapInstance.current = null;
          setIsMapReady(false);
        }
      };
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, []);

  // Update driver location marker
  useEffect(() => {
    if (!mapInstance.current || !isMapReady || !location) return;

    try {
      // Remove existing marker
      if (driverMarker.current) {
        driverMarker.current.remove();
      }

      // Create motorcycle icon element
      const motorcycleElement = document.createElement('div');
      motorcycleElement.innerHTML = `
        <div style="
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #07595A, #0A6B6D);
          border: 3px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          position: relative;
        ">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M5 11L6.5 6.5H17.5L19 11M17.5 16A1.5 1.5 0 0 1 16 14.5A1.5 1.5 0 0 1 17.5 13A1.5 1.5 0 0 1 19 14.5A1.5 1.5 0 0 1 17.5 16M6.5 16A1.5 1.5 0 0 1 5 14.5A1.5 1.5 0 0 1 6.5 13A1.5 1.5 0 0 1 8 14.5A1.5 1.5 0 0 1 6.5 16M18.92 6C18.72 5.42 18.16 5 17.5 5H6.5C5.84 5 5.28 5.42 5.08 6L3 12V20A1 1 0 0 0 4 21H5A1 1 0 0 0 6 20V19H18V20A1 1 0 0 0 19 21H20A1 1 0 0 0 21 20V12L18.92 6Z"/>
          </svg>
          <div style="
            position: absolute;
            bottom: -2px;
            right: -2px;
            width: 12px;
            height: 12px;
            background: #10B981;
            border: 2px solid white;
            border-radius: 50%;
          "></div>
        </div>
      `;

      // Create driver marker
      driverMarker.current = new tt.Marker({
        element: motorcycleElement,
        anchor: 'center'
      })
        .setLngLat([location.lng, location.lat])
        .setPopup(
          new tt.Popup({ offset: 25 }).setHTML(`
            <div style="text-align: center; padding: 8px;">
              <strong style="color: #07595A;">Lokasi Driver</strong><br/>
              <small>Diperbarui: ${new Date(location.timestamp).toLocaleTimeString()}</small>
              ${location.accuracy ? `<br/><small>Akurasi: ${Math.round(location.accuracy)}m</small>` : ''}
            </div>
          `)
        )
        .addTo(mapInstance.current);

      // Center map on driver location
      mapInstance.current.setCenter([location.lng, location.lat]);

      // Call location update callback
      if (onLocationUpdate) {
        onLocationUpdate({ lat: location.lat, lng: location.lng });
      }

    } catch (error) {
      console.error('Error updating driver marker:', error);
    }
  }, [location, isMapReady, onLocationUpdate]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div 
        ref={mapRef} 
        className="w-full h-full"
        style={{ 
          minHeight: '300px',
          position: "relative"
        }} 
      />
      
      {/* GPS Status Overlay */}
      <div className="absolute top-3 left-3 z-10">
        <div className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 ${
          isLoading ? 'bg-yellow-500/90 text-white' :
          error ? 'bg-red-500/90 text-white' :
          location ? 'bg-green-500/90 text-white' : 'bg-gray-500/90 text-white'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            isLoading ? 'bg-white animate-pulse' :
            error ? 'bg-white' :
            location ? 'bg-white animate-pulse' : 'bg-white'
          }`} />
          <span>
            {isLoading ? 'Mencari GPS...' :
             error ? 'GPS Error' :
             location ? 'GPS Aktif' : 'GPS Mati'}
          </span>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="absolute bottom-4 right-4 z-10">
        <button
          onClick={refreshLocation}
          disabled={isLoading}
          className="bg-[#07595A] text-white p-3 rounded-full shadow-lg hover:bg-[#0A6B6D] transition-colors disabled:opacity-50"
        >
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="currentColor"
            className={isLoading ? 'animate-spin' : ''}
          >
            <path d="M12 4V1L8 5L12 9V6C15.31 6 18 8.69 18 12C18 13.01 17.75 13.97 17.3 14.8L18.76 16.26C19.54 15.03 20 13.57 20 12C20 7.58 16.42 4 12 4ZM12 18C8.69 18 6 15.31 6 12C6 10.99 6.25 10.03 6.7 9.2L5.24 7.74C4.46 8.97 4 10.43 4 12C4 16.42 7.58 20 12 20V23L16 19L12 15V18Z"/>
          </svg>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="bg-red-500/90 text-white px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverTrackingMap;
