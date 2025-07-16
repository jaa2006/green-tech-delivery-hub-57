
import React from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, X } from 'lucide-react';

interface LocationConfirmationPopupProps {
  isOpen: boolean;
  location: { lat: number; lng: number; address: string } | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const LocationConfirmationPopup: React.FC<LocationConfirmationPopupProps> = ({
  isOpen,
  location,
  onConfirm,
  onCancel
}) => {
  if (!isOpen || !location) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      
      {/* Popup */}
      <div className="relative bg-white rounded-2xl p-6 mx-4 max-w-sm w-full shadow-2xl">
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>

        {/* Content */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#07595A] rounded-full flex items-center justify-center">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Konfirmasi Lokasi Tujuan
            </h3>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-3 font-medium">Detail Lokasi Terpilih:</p>
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-[#07595A] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900 text-sm leading-relaxed">{location.address}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Koordinat: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-700">
                📍 Lokasi ini akan dijadikan tujuan perjalanan Anda
              </p>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              onClick={onConfirm}
              className="flex-1 bg-[#07595A] hover:bg-[#064d4e]"
            >
              Konfirmasi
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationConfirmationPopup;
