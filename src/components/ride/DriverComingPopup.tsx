
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { MapPin, Clock } from 'lucide-react';

interface DriverComingPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const DriverComingPopup: React.FC<DriverComingPopupProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md mx-4">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold text-[#07595A]">
            🚗 Driver Sedang Menuju
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600 mt-2">
            Driver sedang menuju lokasi penjemputan Anda
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6 space-y-4">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-[#07595A]/10 rounded-full flex items-center justify-center">
              <div className="w-12 h-12 bg-[#07595A] rounded-full flex items-center justify-center animate-pulse">
                <MapPin className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-2 text-[#07595A]">
              <Clock className="w-5 h-5" />
              <span className="font-medium">Estimasi tiba dalam 5-10 menit</span>
            </div>
            <p className="text-gray-600 text-sm">
              Harap bersiap di lokasi penjemputan yang telah ditentukan
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-[#07595A] text-white py-3 rounded-xl font-medium hover:bg-[#064d4e] transition-colors"
          >
            Mengerti
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DriverComingPopup;
