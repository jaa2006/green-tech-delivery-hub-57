
import React from 'react';
import { Clock, User, Car, Hash, MapPin, Phone, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DriverData {
  name: string;
  vehicle_type: string;
  plate_number: string;
}

interface RideStatusContainerProps {
  status: 'searching' | 'driver_found' | 'driver_coming' | 'driver_arrived' | 'in_progress';
  driverData?: DriverData;
  userInfo?: {
    user_name?: string;
    user_email?: string;
  };
  onCancel?: () => void;
  onConfirm?: () => void;
  estimatedTime?: string;
}

const RideStatusContainer: React.FC<RideStatusContainerProps> = ({
  status,
  driverData,
  userInfo,
  onCancel,
  onConfirm,
  estimatedTime = "5-8 menit"
}) => {
  const getStatusContent = () => {
    switch (status) {
      case 'searching':
        return {
          title: "Mencari Driver",
          subtitle: userInfo?.user_name ? 
            `Mencarikan driver terdekat untuk ${userInfo.user_name}...` :
            "Mencarikan driver terdekat untuk Anda...",
          icon: <div className="w-8 h-8 border-4 border-[#07595A] border-t-transparent rounded-full animate-spin" />,
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200"
        };
      
      case 'driver_found':
        return {
          title: "Driver Ditemukan!",
          subtitle: "Driver telah menerima pesanan Anda",
          icon: <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                  <User className="w-6 h-6 text-white" />
                </div>,
          bgColor: "bg-green-50",
          borderColor: "border-green-200"
        };
      
      case 'driver_coming':
        return {
          title: "Driver Menuju Lokasi Anda",
          subtitle: `Estimasi tiba dalam ${estimatedTime}`,
          icon: <div className="w-12 h-12 bg-[#07595A] rounded-full flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white animate-bounce" />
                </div>,
          bgColor: "bg-[#07595A]/5",
          borderColor: "border-[#07595A]/20"
        };
      
      case 'driver_arrived':
        return {
          title: "Driver Telah Tiba",
          subtitle: "Driver sudah berada di lokasi penjemputan",
          icon: <div className="w-12 h-12 bg-[#fdbc40] rounded-full flex items-center justify-center animate-pulse">
                  <Car className="w-6 h-6 text-[#07595A]" />
                </div>,
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200"
        };
      
      case 'in_progress':
        return {
          title: "Perjalanan Sedang Berlangsung",
          subtitle: "Anda sedang dalam perjalanan menuju tujuan",
          icon: <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                  <Navigation className="w-6 h-6 text-white animate-pulse" />
                </div>,
          bgColor: "bg-green-50",
          borderColor: "border-green-200"
        };
      
      default:
        return {
          title: "Mencari Driver",
          subtitle: "Mencarikan driver terdekat untuk Anda...",
          icon: <div className="w-8 h-8 border-4 border-[#07595A] border-t-transparent rounded-full animate-spin" />,
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200"
        };
    }
  };

  const statusContent = getStatusContent();

  return (
    <div className={`${statusContent.bgColor} ${statusContent.borderColor} border-2 rounded-2xl p-6 mx-4 mb-4 shadow-lg animate-fade-in`}>
      {/* Header with Icon and Status */}
      <div className="flex items-center space-x-4 mb-4">
        {statusContent.icon}
        <div className="flex-1">
          <h3 className="text-xl font-bold text-[#07595A]">{statusContent.title}</h3>
          <p className="text-gray-600">{statusContent.subtitle}</p>
          {userInfo?.user_name && status === 'searching' && (
            <p className="text-sm text-gray-500 mt-1">Penumpang: {userInfo.user_name}</p>
          )}
        </div>
      </div>

      {/* Driver Information - Show when driver is found or ride is in progress */}
      {(status === 'driver_found' || status === 'driver_coming' || status === 'driver_arrived' || status === 'in_progress') && driverData && (
        <div className="bg-white rounded-xl p-4 mb-4 space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#07595A] rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Driver</p>
              <p className="font-semibold text-[#07595A]">{driverData.name}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#fdbc40] rounded-full flex items-center justify-center">
              <Car className="w-5 h-5 text-[#07595A]" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Kendaraan</p>
              <p className="font-semibold text-[#07595A]">{driverData.vehicle_type}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center">
              <Hash className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Plat Nomor</p>
              <p className="font-semibold text-[#07595A]">{driverData.plate_number}</p>
            </div>
          </div>

          {/* Contact Driver Button - Show during trip and when driver is coming/arrived */}
          {(status === 'driver_coming' || status === 'driver_arrived' || status === 'in_progress') && (
            <Button 
              className="w-full bg-[#fdbc40] hover:bg-[#fdbc40]/90 text-[#07595A] font-semibold mt-3"
              onClick={() => {
                // TODO: Implement contact driver functionality
                console.log('Contact driver clicked');
              }}
            >
              <Phone className="w-4 h-4 mr-2" />
              Hubungi Driver
            </Button>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3">
        {status === 'searching' && onCancel && (
          <Button 
            variant="outline" 
            onClick={onCancel}
            className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
          >
            Batalkan
          </Button>
        )}
        
        {status === 'driver_found' && onConfirm && (
          <Button 
            onClick={onConfirm}
            className="flex-1 bg-[#07595A] hover:bg-[#064d4e] text-white"
          >
            Konfirmasi Driver
          </Button>
        )}
        
        {status === 'driver_arrived' && (
          <Button 
            onClick={() => {
              // TODO: Implement start trip functionality
              console.log('Start trip clicked');
            }}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            Mulai Perjalanan
          </Button>
        )}

        {status === 'in_progress' && (
          <Button 
            onClick={() => {
              // TODO: Implement end trip functionality
              console.log('End trip clicked');
            }}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            Selesai Perjalanan
          </Button>
        )}
      </div>

      {/* Progress Indicator */}
      {status === 'searching' && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>Mencari driver...</span>
            <span><Clock className="w-4 h-4 inline mr-1" />Max 3 menit</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-[#07595A] h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      )}

      {/* Trip Progress Indicator */}
      {status === 'in_progress' && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>Perjalanan berlangsung...</span>
            <span><Navigation className="w-4 h-4 inline mr-1" />Menuju tujuan</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-600 h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RideStatusContainer;
