
import { useState } from "react";
import { GoogleMapComponent } from "./GoogleMapComponent";

// Komponen Konfirmasi Perjalanan
const ConfirmationContainer = () => {
  return (
    <div className="bg-white rounded-t-3xl p-6 shadow-2xl">
      <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
      <h2 className="text-xl font-semibold mb-3 text-gray-900">Konfirmasi Perjalanan</h2>
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <div>
            <p className="text-sm text-gray-500">Dari</p>
            <p className="font-medium text-gray-900">Lokasi Anda</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div>
            <p className="text-sm text-gray-500">Ke</p>
            <p className="font-medium text-gray-900">Universitas Brawijaya</p>
          </div>
        </div>
        <div className="border-t pt-4">
          <p className="text-gray-600 text-sm mb-4">Pastikan lokasi dan tujuan sudah sesuai.</p>
          <div className="flex space-x-3">
            <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl font-medium transition-colors">
              Ubah Lokasi
            </button>
            <button className="flex-1 bg-[#07595A] hover:bg-[#064d4e] text-white px-4 py-3 rounded-xl font-medium transition-colors">
              Konfirmasi Perjalanan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Komponen Utama
export default function RideLayout() {
  const [showConfirm, setShowConfirm] = useState(true);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* MAP BACKGROUND - Full Screen */}
      <div className="absolute inset-0 z-0">
        <GoogleMapComponent 
          userLocation={{ lat: -7.9666, lng: 112.6326 }}
          showRoute={false}
        />
      </div>

      {/* KONFIRMASI CONTAINER - Bottom Overlay - Only show when showConfirm is true */}
      {showConfirm && (
        <div className="absolute bottom-0 left-0 right-0 z-30 transition-all duration-300 ease-in-out transform">
          <ConfirmationContainer />
        </div>
      )}

      {/* TOGGLE TEST BUTTON - Top Right */}
      <button
        onClick={() => setShowConfirm(!showConfirm)}
        className="absolute top-6 right-6 z-40 bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-full font-medium shadow-lg hover:bg-black/90 transition-all duration-200"
      >
        {showConfirm ? "Tutup Konfirmasi" : "Tampilkan Konfirmasi"}
      </button>

      {/* Optional: Status indicator */}
      <div className="absolute top-6 left-6 z-40 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-gray-700">Siap Perjalanan</span>
        </div>
      </div>
    </div>
  );
}
