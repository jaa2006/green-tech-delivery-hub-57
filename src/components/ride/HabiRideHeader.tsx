
import React from 'react';
import { ArrowLeft, Car } from 'lucide-react';
import { useNavigationHistory } from '@/hooks/useNavigationHistory';

interface HabiRideHeaderProps {
  currentOrderId?: string;
  ridePhase: 'destination' | 'driver_coming' | 'driver_arrived';
  distanceInfo?: { distance: string; duration: string } | null;
  showRoutingPanel: boolean;
  showGeocodingPanel: boolean;
  onToggleRoutingPanel: () => void;
  onToggleGeocodingPanel: () => void;
}

const HabiRideHeader: React.FC<HabiRideHeaderProps> = ({
  currentOrderId,
  ridePhase,
  distanceInfo,
  showRoutingPanel,
  showGeocodingPanel,
  onToggleRoutingPanel,
  onToggleGeocodingPanel
}) => {
  const { navigateBack } = useNavigationHistory({
    defaultBackPath: '/user-dashboard', // Fixed: use /user-dashboard instead of /
    excludePaths: ['/auth', '/splash']
  });

  return (
    <div className="absolute top-0 left-0 right-0 z-20 px-4 pt-8 pb-2">
      <div className="backdrop-blur-md bg-black/20 rounded-3xl px-4 py-4 border border-white/10">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <button 
              onClick={navigateBack}
              className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4 text-white" />
            </button>
            <div className="flex flex-col">
              <h1 className="text-white text-lg font-bold leading-tight">HabiRide</h1>
              <p className="text-white/70 text-xs">
                {currentOrderId ? `Order #${currentOrderId.slice(-6)}` : 'Ketuk peta untuk pilih tujuan'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={onToggleRoutingPanel}
              className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-all duration-200"
              title="Routing Panel"
            >
              <Car className="h-4 w-4 text-white" />
            </button>
            <button
              onClick={onToggleGeocodingPanel}
              className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-all duration-200"
              title="Search Panel"
            >
              <Car className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>
        
        {/* Compact Status Indicator */}
        <div className="flex items-center justify-center mt-3 pt-3 border-t border-white/10">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              ridePhase === 'destination' ? 'bg-orange-400' : 
              ridePhase === 'driver_coming' ? 'bg-yellow-400' : 'bg-green-400'
            }`} />
            <span className="text-white/80 text-xs font-medium">
              {ridePhase === 'destination' ? (currentOrderId ? 'Mencari Driver' : 'Setup Perjalanan') : 
               ridePhase === 'driver_coming' ? 'Driver Menuju Lokasi' : 'Driver Tiba'}
            </span>
            {distanceInfo && ridePhase !== 'destination' && (
              <span className="text-white/60 text-xs ml-2">
                {distanceInfo.distance} • {distanceInfo.duration}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HabiRideHeader;
