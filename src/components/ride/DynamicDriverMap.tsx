
import React, { useEffect, useRef, useState, useCallback } from "react";
import * as tt from "@tomtom-international/web-sdk-maps";
import * as services from "@tomtom-international/web-sdk-services";
import "@tomtom-international/web-sdk-maps/dist/maps.css";
import { NearbyOrder } from "@/hooks/useNearbyOrders";

interface DriverLocation {
  lat: number;
  lng: number;
  timestamp: number;
  accuracy?: number;
}

interface RouteInfo {
  distance: string;
  duration: string;
  distanceMeters: number;
  durationSeconds: number;
}

interface DynamicDriverMapProps {
  order: NearbyOrder;
  driverLocation: DriverLocation | null;
  routingPhase: 'to_pickup' | 'to_destination';
  onRouteCalculated?: (route: RouteInfo) => void;
  className?: string;
}

const TOMTOM_API_KEY = 'iA54SRddlkPve4SnJ18SpJQPe91ZQZNu';

const DynamicDriverMap: React.FC<DynamicDriverMapProps> = ({
  order,
  driverLocation,
  routingPhase,
  onRouteCalculated,
  className = ""
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const driverMarker = useRef<any>(null);
  const pickupMarker = useRef<any>(null);
  const destinationMarker = useRef<any>(null);
  const routeLayer = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  console.log('=== DYNAMIC DRIVER MAP ===');
  console.log('Routing phase:', routingPhase);
  console.log('Driver location:', driverLocation);
  console.log('Order pickup:', order.pickup_coordinates);
  console.log('Order destination:', order.destination_coordinates);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    const centerLocation = driverLocation || order.pickup_coordinates || { lng: 112.6326, lat: -7.9666 };

    const map = tt.map({
      key: TOMTOM_API_KEY,
      container: mapRef.current,
      center: [centerLocation.lng, centerLocation.lat],
      zoom: 15,
    });

    mapInstance.current = map;

    map.on('load', () => {
      setIsMapReady(true);
      console.log('Dynamic map loaded successfully');
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Update markers when locations change
  useEffect(() => {
    if (!isMapReady || !mapInstance.current) return;

    // Remove existing markers
    if (driverMarker.current) {
      driverMarker.current.remove();
      driverMarker.current = null;
    }
    if (pickupMarker.current) {
      pickupMarker.current.remove();
      pickupMarker.current = null;
    }
    if (destinationMarker.current) {
      destinationMarker.current.remove();
      destinationMarker.current = null;
    }

    // Add driver marker if location available
    if (driverLocation) {
      driverMarker.current = new tt.Marker({ 
        color: '#00ff00'
      })
        .setLngLat([driverLocation.lng, driverLocation.lat])
        .setPopup(new tt.Popup({ offset: 25 }).setHTML(`
          <div>
            <strong>Lokasi Driver</strong><br/>
            <small>Akurasi: ${driverLocation.accuracy?.toFixed(0) || 'Unknown'}m</small><br/>
            <small>${new Date(driverLocation.timestamp).toLocaleTimeString()}</small>
          </div>
        `))
        .addTo(mapInstance.current);
    }

    // Add pickup marker
    if (order.pickup_coordinates) {
      pickupMarker.current = new tt.Marker({ 
        color: routingPhase === 'to_pickup' ? '#ff6b35' : '#07595A'
      })
        .setLngLat([order.pickup_coordinates.lng, order.pickup_coordinates.lat])
        .setPopup(new tt.Popup({ offset: 25 }).setHTML(`
          <div>
            <strong>Lokasi Penjemputan</strong><br/>
            ${order.pickup}
          </div>
        `))
        .addTo(mapInstance.current);
    }

    // Add destination marker
    if (order.destination_coordinates) {
      destinationMarker.current = new tt.Marker({ 
        color: routingPhase === 'to_destination' ? '#ff6b35' : '#ff0000'
      })
        .setLngLat([order.destination_coordinates.lng, order.destination_coordinates.lat])
        .setPopup(new tt.Popup({ offset: 25 }).setHTML(`
          <div>
            <strong>Tujuan</strong><br/>
            ${order.destination}
          </div>
        `))
        .addTo(mapInstance.current);
    }
  }, [isMapReady, driverLocation, order, routingPhase]);

  // Calculate and display route based on routing phase
  const calculateRoute = useCallback(async () => {
    if (!isMapReady || !mapInstance.current) return;

    let origin, destination;

    if (routingPhase === 'to_pickup') {
      // Driver to pickup location
      if (!driverLocation || !order.pickup_coordinates) return;
      origin = [driverLocation.lng, driverLocation.lat];
      destination = [order.pickup_coordinates.lng, order.pickup_coordinates.lat];
    } else if (routingPhase === 'to_destination') {
      // Pickup to destination location
      if (!order.pickup_coordinates || !order.destination_coordinates) return;
      origin = [order.pickup_coordinates.lng, order.pickup_coordinates.lat];
      destination = [order.destination_coordinates.lng, order.destination_coordinates.lat];
    } else {
      return;
    }

    console.log('Calculating route for phase:', routingPhase);
    console.log('Origin:', origin);
    console.log('Destination:', destination);

    // Remove existing route
    if (routeLayer.current && mapInstance.current.getSource('dynamic-route')) {
      try {
        mapInstance.current.removeLayer(routeLayer.current);
        mapInstance.current.removeSource('dynamic-route');
      } catch (error) {
        console.log('Route layer already removed');
      }
    }

    try {
      const routeResponse = await services.services.calculateRoute({
        key: TOMTOM_API_KEY,
        locations: [origin, destination]
      });

      if (routeResponse.routes && routeResponse.routes.length > 0) {
        const route = routeResponse.routes[0];
        const coordinates = route.legs[0].points.map((point: any) => [point.longitude, point.latitude]);

        // Calculate route info
        const distanceMeters = route.summary.lengthInMeters;
        const durationSeconds = route.summary.travelTimeInSeconds;
        const distanceKm = (distanceMeters / 1000).toFixed(1);
        const durationMinutes = Math.round(durationSeconds / 60);

        const routeInfo: RouteInfo = {
          distance: `${distanceKm} km`,
          duration: `${durationMinutes} menit`,
          distanceMeters,
          durationSeconds
        };

        console.log('Route calculated:', routeInfo);
        
        if (onRouteCalculated) {
          onRouteCalculated(routeInfo);
        }

        // Add route to map
        mapInstance.current.addSource('dynamic-route', {
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

        routeLayer.current = 'dynamic-route-line';
        mapInstance.current.addLayer({
          id: routeLayer.current,
          type: 'line',
          source: 'dynamic-route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': routingPhase === 'to_pickup' ? '#ff6b35' : '#07595A',
            'line-width': 5,
            'line-opacity': 0.8
          }
        });

        // Fit map to show route
        const bounds = new tt.LngLatBounds();
        coordinates.forEach((coord: number[]) => bounds.extend([coord[0], coord[1]]));
        mapInstance.current.fitBounds(bounds, { padding: 50 });
      }
    } catch (error) {
      console.error('Error calculating route:', error);
    }
  }, [isMapReady, driverLocation, order, routingPhase, onRouteCalculated]);

  // Trigger route calculation when dependencies change
  useEffect(() => {
    calculateRoute();
  }, [calculateRoute]);

  return (
    <div className={`relative ${className}`}>
      <div 
        ref={mapRef} 
        className="w-full h-full"
        style={{ minHeight: '300px' }}
      />
      
      {/* Phase Indicator */}
      <div className="absolute top-4 left-4 bg-black/80 text-white px-3 py-2 rounded-lg text-sm">
        {routingPhase === 'to_pickup' ? (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
            Menuju Penjemputan
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#07595A] rounded-full animate-pulse"></div>
            Menuju Tujuan
          </div>
        )}
      </div>

      {!driverLocation && routingPhase === 'to_pickup' && (
        <div className="absolute bottom-4 left-4 right-4 bg-yellow-500/90 text-black px-3 py-2 rounded-lg text-sm text-center">
          Menunggu lokasi GPS driver...
        </div>
      )}
    </div>
  );
};

export default DynamicDriverMap;
