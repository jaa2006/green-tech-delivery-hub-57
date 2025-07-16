
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Link } from "react-router-dom";

const DriverRegisterPopup = () => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 right-4 z-40">
      <div className="relative">
        <button
          onClick={handleClose}
          className="absolute top-1 right-1 z-10 bg-white rounded-full p-1 hover:bg-gray-100 transition-colors shadow-md"
        >
          <X className="h-3 w-3 text-gray-600" />
        </button>
        <Link to="/register-driver" className="block">
          <div className="w-24 h-24 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
            <img 
              src="/lovable-uploads/67b06517-9b7d-4b24-9463-0092097703d6.png" 
              alt="Daftar Jadi Driver Habisin" 
              className="w-full h-full object-cover"
            />
          </div>
        </Link>
      </div>
    </div>
  );
};

export default DriverRegisterPopup;
