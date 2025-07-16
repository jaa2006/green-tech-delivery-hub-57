
import L from 'leaflet';
import { getDatabase, ref, onValue, off } from 'firebase/database';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface DriverLocation {
  lat: number;
  lng: number;
  timestamp?: number;
}

interface MapTrackingInstance {
  map: L.Map;
  marker: L.Marker | null;
  cleanup: () => void;
}

let mapInstance: MapTrackingInstance | null = null;

export const initMapTracking = (driverId: string): MapTrackingInstance => {
  // Cleanup existing map if any
  if (mapInstance) {
    mapInstance.cleanup();
  }

  const mapContainer = document.getElementById('map');
  if (!mapContainer) {
    throw new Error('Map container with id "map" not found');
  }

  // Clear container
  mapContainer.innerHTML = '';

  // Initialize map
  const map = L.map('map').setView([-6.2088, 106.8456], 13); // Default to Jakarta

  // Add OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  let marker: L.Marker | null = null;
  const database = getDatabase();
  const locationRef = ref(database, `drivers/${driverId}/location`);

  // Listen for location updates
  const handleLocationUpdate = (snapshot: any) => {
    const location: DriverLocation = snapshot.val();
    
    if (location && location.lat && location.lng) {
      const latLng = L.latLng(location.lat, location.lng);
      
      if (marker) {
        // Update existing marker position
        marker.setLatLng(latLng);
      } else {
        // Create new marker
        marker = L.marker(latLng).addTo(map);
        marker.bindPopup(`Driver ${driverId}<br>Last update: ${new Date().toLocaleTimeString()}`);
      }
      
      // Center map on driver location
      map.setView(latLng, map.getZoom());
      
      // Update popup content with timestamp
      const updateTime = location.timestamp 
        ? new Date(location.timestamp).toLocaleTimeString()
        : new Date().toLocaleTimeString();
      
      marker.setPopupContent(`Driver ${driverId}<br>Last update: ${updateTime}`);
    }
  };

  // Start listening for updates
  onValue(locationRef, handleLocationUpdate);

  // Cleanup function
  const cleanup = () => {
    off(locationRef, 'value', handleLocationUpdate);
    if (marker) {
      map.removeLayer(marker);
      marker = null;
    }
    map.remove();
  };

  mapInstance = {
    map,
    marker,
    cleanup
  };

  return mapInstance;
};

// Function to update driver location (for testing purposes)
export const updateDriverLocation = (driverId: string, lat: number, lng: number) => {
  const database = getDatabase();
  const locationRef = ref(database, `drivers/${driverId}/location`);
  
  return new Promise((resolve, reject) => {
    const location: DriverLocation = {
      lat,
      lng,
      timestamp: Date.now()
    };
    
    // Note: set function would need to be imported from firebase/database
    // This is just for reference, actual implementation depends on your Firebase setup
    console.log('Would update location:', location);
    resolve(location);
  });
};

// Function to cleanup map when component unmounts
export const cleanupMapTracking = () => {
  if (mapInstance) {
    mapInstance.cleanup();
    mapInstance = null;
  }
};
