import React from 'react';

interface DriverData {
  name: string;
  vehicle_type: string;
  plate_number: string;
}

interface HabiRidePopupsProps {
  localShowWaitingPopup: boolean;
  showWaitingPopup: boolean;
  showDriverFoundPopup: boolean;
  driverData?: DriverData;
  onHideWaitingPopup: () => void;
  onHideDriverFoundPopup: () => void;
  currentOrder?: {
    id: string;
    status: string;
    assigned_driver_id?: string;
    assigned_driver_data?: DriverData;
  } | null;
}

const HabiRidePopups: React.FC<HabiRidePopupsProps> = ({
  localShowWaitingPopup,
  showWaitingPopup,
  showDriverFoundPopup,
  driverData,
  onHideWaitingPopup,
  onHideDriverFoundPopup,
  currentOrder
}) => {
  // This component is being phased out in favor of RideStatusContainer
  // Keeping minimal implementation for backward compatibility during transition
  
  console.log('=== HABIRIDE POPUPS (LEGACY) ===');
  console.log('Popup system is being replaced by RideStatusContainer');
  console.log('Current order:', currentOrder);
  console.log('==============================');

  // Return null to disable popup system entirely
  // The new RideStatusContainer handles all status displays
  return null;
};

export default HabiRidePopups;
