
import React, { useEffect, useRef, useState } from "react";
import * as tt from "@tomtom-international/web-sdk-maps";
import * as services from "@tomtom-international/web-sdk-services";
import "@tomtom-international/web-sdk-maps/dist/maps.css";
import LocationConfirmationPopup from "./LocationConfirmationPopup";

interface InteractiveTomTomMapProps {
  pickupLocation: { lat: number; lng: number; address: string };
  destinationLocation?: { lat: number; lng: number; address: string } | null;
  onLocationSelect?: (location: { lat: number; lng: number; address: string }) => void;
  onPickupLocationUpdate?: (location: { lat: number; lng: number; address: string }) => void;
  showRoute?: boolean;
  className?: string;
  userDisplayName?: string;
}

const TOMTOM_API_KEY = 'iA54SRddlkPve4SnJ18SpJQPe91ZQZNu';

const InteractiveTomTomMap: React.FC<InteractiveTomTomMapProps> = ({
  pickupLocation,
  destinationLocation,
  onLocationSelect,
  onPickupLocationUpdate,
  showRoute = false,
  className = "",
  userDisplayName = "User"
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const pickupMarker = useRef<any>(null);
  const destinationMarker = useRef<any>(null);
  const routeLayer = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [showLocationPopup, setShowLocationPopup] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || pickupLocation.lat === 0) return;

    const map = tt.map({
      key: TOMTOM_API_KEY,
      container: mapRef.current,
      center: [pickupLocation.lng, pickupLocation.lat],
      zoom: 13,
    });

    mapInstance.current = map;

    map.on('load', () => {
      setIsMapReady(true);
      
      // Add pickup marker with user name
      pickupMarker.current = new tt.Marker({ color: '#07595A' })
        .setLngLat([pickupLocation.lng, pickupLocation.lat])
        .setPopup(new tt.Popup({ offset: 25 }).setHTML(`
          <div>
            <strong>${userDisplayName}</strong><br/>
            <small>Lokasi Jemput</small><br/>
            ${pickupLocation.address}
          </div>
        `))
        .addTo(map);

      // Add click handler for destination selection
      map.on('click', (event) => {
        const lngLat = event.lngLat;
        
        // Reverse geocode to get address first
        services.services.reverseGeocode({
          key: TOMTOM_API_KEY,
          position: { lat: lngLat.lat, lon: lngLat.lng }
        }).then((response) => {
          if (response.addresses && response.addresses.length > 0) {
            const address = response.addresses[0].address.freeformAddress;
            const location = {
              lat: lngLat.lat,
              lng: lngLat.lng,
              address
            };
            
            // Show location confirmation popup
            setSelectedLocation(location);
            setShowLocationPopup(true);
          }
        }).catch(console.error);
      });
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [pickupLocation.lat, pickupLocation.lng, userDisplayName]);

  // Update pickup marker when pickup location changes
  useEffect(() => {
    if (!isMapReady || !mapInstance.current || pickupLocation.lat === 0) return;

    if (pickupMarker.current) {
      pickupMarker.current.setLngLat([pickupLocation.lng, pickupLocation.lat]);
      pickupMarker.current.setPopup(
        new tt.Popup({ offset: 25 }).setHTML(`
          <div>
            <strong>${userDisplayName}</strong><br/>
            <small>Lokasi Jemput</small><br/>
            ${pickupLocation.address}
          </div>
        `)
      );
      mapInstance.current.setCenter([pickupLocation.lng, pickupLocation.lat]);
    }
  }, [pickupLocation, isMapReady, userDisplayName]);

  // Update destination marker when destination changes
  useEffect(() => {
    if (!isMapReady || !mapInstance.current || !destinationLocation) return;

    if (destinationMarker.current) {
      destinationMarker.current.remove();
    }

    destinationMarker.current = new tt.Marker({ color: '#ff0000' })
      .setLngLat([destinationLocation.lng, destinationLocation.lat])
      .setPopup(new tt.Popup({ offset: 25 }).setHTML(`
        <div>
          <strong>Tujuan</strong><br/>
          ${destinationLocation.address}
        </div>
      `))
      .addTo(mapInstance.current);
  }, [destinationLocation, isMapReady]);

  // Show route when requested
  useEffect(() => {
    if (!isMapReady || !mapInstance.current || !showRoute || !destinationLocation) return;

    // Remove existing route only if it exists
    if (routeLayer.current && mapInstance.current.getSource('route')) {
      try {
        mapInstance.current.removeLayer(routeLayer.current);
        mapInstance.current.removeSource('route');
      } catch (error) {
        console.log('Route source/layer already removed or does not exist');
      }
    }

    // Calculate route using correct TomTom API format
    services.services.calculateRoute({
      key: TOMTOM_API_KEY,
      locations: [
        [pickupLocation.lng, pickupLocation.lat],
        [destinationLocation.lng, destinationLocation.lat]
      ]
    }).then((routeResponse) => {
      if (routeResponse.routes && routeResponse.routes.length > 0) {
        const route = routeResponse.routes[0];
        const coordinates = route.legs[0].points.map((point: any) => [point.longitude, point.latitude]);

        // Add route to map
        mapInstance.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates
            }
          }
        });

        routeLayer.current = 'route-line';
        mapInstance.current.addLayer({
          id: routeLayer.current,
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#07595A',
            'line-width': 4
          }
        });

        // Fit map to show entire route
        const bounds = new tt.LngLatBounds();
        coordinates.forEach((coord: number[]) => bounds.extend([coord[0], coord[1]]));
        mapInstance.current.fitBounds(bounds, { padding: 50 });
      }
    }).catch(console.error);
  }, [showRoute, destinationLocation, pickupLocation, isMapReady]);

  const handleLocationConfirm = () => {
    if (selectedLocation && onLocationSelect) {
      // Remove existing destination marker
      if (destinationMarker.current) {
        destinationMarker.current.remove();
      }

      // Add new destination marker
      destinationMarker.current = new tt.Marker({ color: '#ff0000' })
        .setLngLat([selectedLocation.lng, selectedLocation.lat])
        .setPopup(new tt.Popup({ offset: 25 }).setHTML(`
          <div>
            <strong>Tujuan</strong><br/>
            ${selectedLocation.address}
          </div>
        `))
        .addTo(mapInstance.current);

      onLocationSelect(selectedLocation);
    }
    setShowLocationPopup(false);
    setSelectedLocation(null);
  };

  const handleLocationCancel = () => {
    setShowLocationPopup(false);
    setSelectedLocation(null);
  };

  return (
    <>
      <div 
        ref={mapRef} 
        className={`w-full h-full ${className}`}
        style={{ 
          minHeight: '300px',
          position: "relative"
        }} 
      />
      
      <LocationConfirmationPopup
        isOpen={showLocationPopup}
        location={selectedLocation}
        onConfirm={handleLocationConfirm}
        onCancel={handleLocationCancel}
      />
    </>
  );
};

export default InteractiveTomTomMap;
