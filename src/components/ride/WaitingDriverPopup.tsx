
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Loader2, Clock, MapPin } from 'lucide-react';

interface WaitingDriverPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const WaitingDriverPopup: React.FC<WaitingDriverPopupProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-sm mx-auto bg-[#07595A] border-0 rounded-2xl p-6">
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl font-semibold text-white mb-2">
            🔍 Mencari Driver
          </DialogTitle>
          <DialogDescription className="text-white/80 text-sm">
            Sedang mencari driver terdekat untuk Anda. Mohon tunggu sebentar...
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center py-4 space-y-4">
          {/* Enhanced loading animation */}
          <div className="relative flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-white animate-spin" />
            <div className="absolute inset-0 w-12 h-12 border-3 border-[#fdbc40] rounded-full opacity-30 animate-pulse"></div>
          </div>
          
          {/* Status messages */}
          <div className="text-center space-y-1">
            <p className="text-sm font-medium text-white">
              Mencari driver terdekat...
            </p>
            <p className="text-xs text-white/70">
              Biasanya membutuhkan waktu 1-3 menit
            </p>
          </div>
          
          {/* Progress indicator */}
          <div className="w-full bg-white/20 rounded-full h-1.5 max-w-[200px]">
            <div className="bg-[#fdbc40] h-1.5 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
          
          {/* Tips section */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 w-full border border-white/20">
            <div className="flex items-center space-x-2 text-white mb-1">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium">Tips:</span>
            </div>
            <p className="text-xs text-white/80 leading-relaxed">
              Pastikan Anda berada di lokasi penjemputan yang mudah diakses driver
            </p>
          </div>

          {/* Additional info section */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 w-full border border-white/10">
            <div className="flex items-center space-x-2 text-white/90 mb-1">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium">Status Pencarian:</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-[#fdbc40] rounded-full animate-pulse flex-shrink-0"></div>
              <span className="text-xs text-white/70">Menghubungkan dengan driver aktif...</span>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="mt-2 px-6 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl text-white font-medium transition-colors text-sm w-full max-w-[150px]"
          >
            Tutup
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WaitingDriverPopup;
