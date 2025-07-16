
import React from 'react';
import { RoutingControl } from './RoutingControl';
import { GeocodingPanel } from './GeocodingPanel';

interface HabiRideSidePanelsProps {
  showRoutingPanel: boolean;
  showGeocodingPanel: boolean;
  loading: boolean;
  distanceInfo: { distance: string; duration: string } | null;
  onCalculateRoute: (origin: { lat: number; lng: number }, destination: { lat: number; lng: number }) => void;
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  onGeocodeSearch: (query: string) => Promise<any[]>;
  onReverseGeocode: (lat: number, lng: number) => Promise<string>;
  onCloseGeocodingPanel: () => void;
}

const HabiRideSidePanels: React.FC<HabiRideSidePanelsProps> = ({
  showRoutingPanel,
  showGeocodingPanel,
  loading,
  distanceInfo,
  onCalculateRoute,
  onLocationSelect,
  onGeocodeSearch,
  onReverseGeocode,
  onCloseGeocodingPanel
}) => {
  return (
    <>
      {/* Routing Panel */}
      {showRoutingPanel && (
        <div className="absolute top-24 left-4 z-30 w-80">
          <RoutingControl
            onCalculateRoute={onCalculateRoute}
            routeInfo={distanceInfo}
            isLoading={loading}
          />
        </div>
      )}

      {/* Geocoding Panel */}
      {showGeocodingPanel && (
        <div className="absolute top-24 right-4 z-30 w-80">
          <GeocodingPanel
            onLocationSelect={(location) => {
              onLocationSelect(location);
              onCloseGeocodingPanel();
            }}
            onGeocodeSearch={onGeocodeSearch}
            onReverseGeocode={onReverseGeocode}
          />
        </div>
      )}
    </>
  );
};

export default HabiRideSidePanels;
