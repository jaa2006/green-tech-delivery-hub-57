
import React, { useState } from 'react';
import { Navigation, MapPin, Clock } from 'lucide-react';

interface RoutingControlProps {
  onCalculateRoute: (origin: { lat: number; lng: number }, destination: { lat: number; lng: number }) => void;
  routeInfo?: { distance: string; duration: string } | null;
  isLoading?: boolean;
}

export const RoutingControl: React.FC<RoutingControlProps> = ({
  onCalculateRoute,
  routeInfo,
  isLoading = false
}) => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');

  const handleCalculateRoute = () => {
    // For demo purposes, using fixed coordinates
    // In real implementation, you would geocode the addresses first
    const originCoords = { lat: -7.9666, lng: 112.6326 }; // Default user location
    const destCoords = { lat: -7.9566, lng: 112.6146 }; // Universitas Brawijaya
    
    onCalculateRoute(originCoords, destCoords);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 space-y-4">
      <div className="flex items-center space-x-2">
        <Navigation className="w-5 h-5 text-[#07595A]" />
        <h3 className="font-semibold text-gray-800">Routing Control</h3>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dari
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Lokasi asal"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#07595A]"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ke
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-500" />
            <input
              type="text"
              placeholder="Tujuan"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#07595A]"
            />
          </div>
        </div>

        <button
          onClick={handleCalculateRoute}
          disabled={isLoading}
          className="w-full bg-[#07595A] text-white py-2 px-4 rounded-md hover:bg-[#065658] disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Menghitung Rute...</span>
            </>
          ) : (
            <>
              <Navigation className="w-4 h-4" />
              <span>Hitung Rute</span>
            </>
          )}
        </button>

        {routeInfo && (
          <div className="bg-gray-50 rounded-md p-3 space-y-2">
            <h4 className="font-semibold text-sm text-gray-800">Informasi Rute</h4>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>{routeInfo.distance}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{routeInfo.duration}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
