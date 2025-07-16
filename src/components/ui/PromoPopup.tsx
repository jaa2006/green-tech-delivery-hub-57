
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const PromoPopup = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show popup after a short delay every time user enters the app
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-xs mx-auto p-2 bg-transparent border-none shadow-none">
        <div className="relative">
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 z-10 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors shadow-md"
          >
            <X className="h-4 w-4 text-gray-600" />
          </button>
          <div className="rounded-2xl overflow-hidden">
            <img 
              src="/lovable-uploads/89c18810-2f40-4279-85a3-a10a146ab390.png" 
              alt="First Launch Promo - Get 50% OFF" 
              className="w-full h-auto"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PromoPopup;
