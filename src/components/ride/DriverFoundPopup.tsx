
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { User, Car, Hash } from 'lucide-react';

interface DriverData {
  name: string;
  vehicle_type: string;
  plate_number: string;
}

interface DriverFoundPopupProps {
  isOpen: boolean;
  driverData: DriverData;
  onClose: () => void;
}

const DriverFoundPopup: React.FC<DriverFoundPopupProps> = ({ isOpen, driverData, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md mx-4">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold text-[#07595A]">
            🎉 Driver Ditemukan!
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600 mt-2">
            Driver telah menerima pesanan Anda
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6 space-y-4">
          <div className="bg-[#07595A]/5 rounded-xl p-4 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-[#07595A] rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">Nama Driver</p>
                <p className="font-semibold text-[#07595A] text-lg">{driverData.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-[#fdbc40] rounded-full flex items-center justify-center">
                <Car className="w-6 h-6 text-[#07595A]" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">Kendaraan</p>
                <p className="font-semibold text-[#07595A] text-lg">{driverData.vehicle_type}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-500 rounded-full flex items-center justify-center">
                <Hash className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">Plat Nomor</p>
                <p className="font-semibold text-[#07595A] text-lg">{driverData.plate_number}</p>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-[#07595A] text-white py-3 rounded-xl font-medium hover:bg-[#064d4e] transition-colors"
          >
            Oke
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DriverFoundPopup;
