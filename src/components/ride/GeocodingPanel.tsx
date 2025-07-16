
import React, { useState } from 'react';
import { Search, MapPin, Loader } from 'lucide-react';

interface GeocodingPanelProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  onGeocodeSearch: (query: string) => Promise<any[]>;
  onReverseGeocode: (lat: number, lng: number) => Promise<string>;
}

export const GeocodingPanel: React.FC<GeocodingPanelProps> = ({
  onLocationSelect,
  onGeocodeSearch,
  onReverseGeocode
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [coordinates, setCoordinates] = useState('');
  const [reverseResult, setReverseResult] = useState('');
  const [isReversing, setIsReversing] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await onGeocodeSearch(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      alert('Pencarian gagal. Silakan coba lagi.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleReverseGeocode = async () => {
    const coords = coordinates.split(',');
    if (coords.length !== 2) {
      alert('Format koordinat salah. Gunakan format: lat,lng');
      return;
    }

    const lat = parseFloat(coords[0].trim());
    const lng = parseFloat(coords[1].trim());

    if (isNaN(lat) || isNaN(lng)) {
      alert('Koordinat tidak valid.');
      return;
    }

    setIsReversing(true);
    try {
      const address = await onReverseGeocode(lat, lng);
      setReverseResult(address);
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      alert('Reverse geocoding gagal.');
    } finally {
      setIsReversing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 space-y-6">
      <div className="flex items-center space-x-2">
        <Search className="w-5 h-5 text-[#07595A]" />
        <h3 className="font-semibold text-gray-800">Pencarian & Geocoding</h3>
      </div>

      {/* Forward Geocoding - Address to Coordinates */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-700">Cari Alamat</h4>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Masukkan alamat atau nama tempat"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#07595A]"
          />
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="bg-[#07595A] text-white px-4 py-2 rounded-md hover:bg-[#065658] disabled:opacity-50 flex items-center"
          >
            {isSearching ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md">
            {searchResults.map((result, index) => (
              <button
                key={index}
                onClick={() => {
                  onLocationSelect({
                    lat: result.position.lat,
                    lng: result.position.lon,
                    address: result.address?.freeformAddress || result.poi?.name || 'Unknown'
                  });
                  setSearchResults([]);
                  setSearchQuery('');
                }}
                className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
              >
                <div className="font-medium text-sm">{result.poi?.name || result.address?.freeformAddress}</div>
                <div className="text-gray-500 text-xs">{result.address?.freeformAddress}</div>
                <div className="text-gray-400 text-xs">
                  {result.position.lat.toFixed(6)}, {result.position.lon.toFixed(6)}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Reverse Geocoding - Coordinates to Address */}
      <div className="space-y-3 border-t pt-4">
        <h4 className="font-medium text-gray-700">Koordinat ke Alamat</h4>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="lat,lng (contoh: -7.9666,112.6326)"
            value={coordinates}
            onChange={(e) => setCoordinates(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#07595A]"
          />
          <button
            onClick={handleReverseGeocode}
            disabled={isReversing}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:opacity-50 flex items-center"
          >
            {isReversing ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <MapPin className="w-4 h-4" />
            )}
          </button>
        </div>

        {reverseResult && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <div className="text-sm font-medium text-green-800">Alamat:</div>
            <div className="text-sm text-green-700">{reverseResult}</div>
          </div>
        )}
      </div>
    </div>
  );
};
