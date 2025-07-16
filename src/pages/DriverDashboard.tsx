import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { User2, LogOut, Clock, Maximize2, Home, Settings, X } from "lucide-react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useToast } from "@/components/ui/use-toast";
import DriverTrackingMap from "@/components/ride/DriverTrackingMap";
import EnhancedNearbyOrdersList from "@/components/ride/EnhancedNearbyOrdersList";
import { NavLink } from "react-router-dom";
import { useDriverData } from "@/hooks/useDriverData";

const DriverDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [driverName, setDriverName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [todayDeliveries] = useState(5);
  const [todayEarnings] = useState(150000);
  const [isMapFullScreen, setIsMapFullScreen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{lat: number; lng: number} | null>(null);
  
  // Refs for location update optimization
  const lastLocationUpdateRef = useRef<{lat: number; lng: number} | null>(null);
  const locationUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { driverData, updateDriverLocation, saveDriverData, getDriverData } = useDriverData();

  const navItems = [
    { 
      path: "/driver-dashboard", 
      label: "Home", 
      icon: <Home className="h-5 w-5" /> 
    },
    { 
      path: "/driver-profile", 
      label: "Profile", 
      icon: <User2 className="h-5 w-5" /> 
    },
    { 
      path: "/driver-settings", 
      label: "Settings", 
      icon: <Settings className="h-5 w-5" /> 
    }
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          console.log('=== ENHANCED DRIVER DASHBOARD INIT ===');
          console.log('User ID:', user.uid);
          console.log('User email:', user.email);
          
          // First try to get driver data from drivers collection
          const driverData = await getDriverData(user.uid);
          
          if (driverData) {
            console.log('Driver data found:', driverData);
            setDriverName(driverData.name);
          } else {
            console.log('No driver data found, checking users collection...');
            // Fallback to users collection and migrate data
            const userDoc = await getDoc(doc(db, "users", user.uid));
            const userData = userDoc.data();
            
            if (userData && userData.role === "driver") {
              console.log('User data found, migrating to drivers collection:', userData);
              setDriverName(userData.name || "Driver");
              
              // Migrate data to drivers collection
              try {
                await saveDriverData({
                  name: userData.name || "Driver",
                  vehicle_type: userData.kendaraan || userData.vehicle_type || "Motor",
                  plate_number: userData.plat_nomor || userData.plate_number || "Unknown",
                  location: { lat: -6.2088, lng: 106.8456 } // Default location
                });
                console.log('Driver data migrated successfully to drivers collection');
              } catch (error) {
                console.error('Error migrating driver data:', error);
              }
            } else {
              console.log('No valid driver data found, redirecting to home');
              navigate("/");
            }
          }
        } catch (error) {
          console.error("Enhanced error fetching driver data:", error);
          toast({
            title: "Error memuat data driver",
            description: "Silakan coba login ulang",
            variant: "destructive",
          });
          navigate("/");
        }
      } else {
        console.log('No user authenticated, redirecting to home');
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, [navigate, getDriverData, saveDriverData, toast]);

  const handleLogout = async () => {
    try {
      console.log('Enhanced logout initiated');
      await signOut(auth);
      toast({
        title: "Logout berhasil",
        description: "Sampai jumpa lagi!",
      });
      navigate("/");
    } catch (error) {
      console.error("Enhanced error logging out:", error);
      toast({
        title: "Error logout",
        description: "Terjadi kesalahan saat logout",
        variant: "destructive",
      });
    }
  };

  const toggleActiveStatus = () => {
    const newStatus = !isActive;
    setIsActive(newStatus);
    
    console.log('Enhanced driver status changed to:', newStatus ? 'ACTIVE' : 'INACTIVE');
    
    toast({
      title: newStatus ? "Status Aktif" : "Status Nonaktif",
      description: newStatus ? "Anda siap menerima order" : "Anda tidak akan menerima order baru",
    });
  };

  const toggleMapFullScreen = () => {
    setIsMapFullScreen(!isMapFullScreen);
  };

  // Enhanced location update with better logging and error handling
  const handleLocationUpdate = useCallback(async (location: {lat: number; lng: number}) => {
    setCurrentLocation(location);
    
    console.log('=== ENHANCED LOCATION UPDATE ===');
    console.log('New location:', location);
    
    // Check if location changed significantly (more than ~5 meters)
    const lastLocation = lastLocationUpdateRef.current;
    if (lastLocation) {
      const distance = Math.sqrt(
        Math.pow((location.lat - lastLocation.lat) * 111000, 2) + 
        Math.pow((location.lng - lastLocation.lng) * 111000, 2)
      );
      
      console.log('Distance from last update:', distance.toFixed(2), 'meters');
      
      // Only update if moved more than 5 meters
      if (distance < 5) {
        console.log('Location change too small, skipping update');
        return;
      }
    }
    
    // Enhanced debounce location updates
    if (locationUpdateTimeoutRef.current) {
      clearTimeout(locationUpdateTimeoutRef.current);
    }
    
    locationUpdateTimeoutRef.current = setTimeout(async () => {
      try {
        console.log('Updating driver location in database...');
        await updateDriverLocation(location);
        lastLocationUpdateRef.current = location;
        console.log('Enhanced driver location updated successfully:', location);
      } catch (error) {
        console.error('Enhanced error updating driver location:', error);
        toast({
          title: "Error update lokasi",
          description: "Gagal memperbarui lokasi GPS",
          variant: "destructive",
        });
      }
    }, 1500); // Update every 1.5 seconds max
  }, [updateDriverLocation, toast]);

  // Enhanced cleanup
  useEffect(() => {
    return () => {
      if (locationUpdateTimeoutRef.current) {
        clearTimeout(locationUpdateTimeoutRef.current);
      }
    };
  }, []);

  // Enhanced full screen map overlay
  if (isMapFullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black">
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={toggleMapFullScreen}
            className="bg-white/20 backdrop-blur-sm p-3 rounded-full text-white hover:bg-white/30 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <DriverTrackingMap onLocationUpdate={handleLocationUpdate} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#07595A] to-black pb-20">
      {/* Enhanced Header */}
      <div className="bg-[#07595A] px-4 py-4 flex justify-between items-center rounded-b-3xl">
        <div>
          <h1 className="text-white text-2xl font-semibold">habisin</h1>
          <p className="text-white/80 text-sm">Enhanced Driver - {driverName}</p>
          {driverData && (
            <p className="text-white/60 text-xs">
              {driverData.vehicle_type} - {driverData.plate_number}
            </p>
          )}
          {currentLocation && (
            <p className="text-white/60 text-xs">
              GPS: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleActiveStatus}
            className={`px-4 py-2 rounded-full flex items-center space-x-2 transition-all ${
              isActive 
                ? 'bg-[#fdbc40] text-[#07595A]' 
                : 'bg-white/20 text-white'
            }`}
          >
            <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-[#07595A]' : 'bg-white'}`} />
            <span className="font-medium text-sm">
              {isActive ? 'Aktif' : 'Nonaktif'}
            </span>
          </button>
          <button
            onClick={handleLogout}
            className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors"
          >
            <LogOut className="text-white w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="px-4 mt-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            <div className="text-white/70 text-sm mb-1">Pengantaran</div>
            <div className="text-white/70 text-sm mb-1">Hari Ini</div>
            <div className="text-white text-3xl font-bold">{todayDeliveries}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            <div className="text-white text-2xl font-bold">Rp{todayEarnings.toLocaleString()}</div>
            <div className="text-white/70 text-sm">Penghasilan Hari Ini</div>
          </div>
        </div>
      </div>

      {/* Enhanced Nearby Orders List - Only show when active */}
      {isActive && (
        <div className="px-4 mb-6">
          <EnhancedNearbyOrdersList />
        </div>
      )}

      {/* Enhanced GPS Tracking Map Container */}
      <div className="px-4 mb-6">
        <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-4">
          <div 
            className="bg-white rounded-2xl overflow-hidden h-64 cursor-pointer relative group shadow-lg"
            onClick={toggleMapFullScreen}
          >
            <div className="absolute inset-0 z-10 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
                <Maximize2 className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="h-full w-full">
              <DriverTrackingMap onLocationUpdate={handleLocationUpdate} />
            </div>
          </div>
          <div className="absolute top-7 left-7 bg-[#07595A] text-white px-3 py-1 rounded-full text-sm font-medium z-20">
            Enhanced GPS Tracking
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="px-4 space-y-3">
        <button className="w-full bg-white/10 backdrop-blur-sm rounded-2xl p-4 flex items-center justify-between text-white hover:bg-white/20 transition-colors">
          <div className="flex items-center space-x-3">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13,3A9,9 0 0,0 4,12H1L4.96,16.03L9,12H6A7,7 0 0,1 13,5A7,7 0 0,1 20,12A7,7 0 0,1 13,19C11.07,19 9.32,18.21 8.06,16.94L6.64,18.36C8.27,20 10.5,21 13,21A9,9 0 0,0 22,12A9,9 0 0,0 13,3Z" />
            </svg>
            <span className="font-medium">Riwayat Order</span>
          </div>
          <div className="w-5 h-5">→</div>
        </button>
        
        <button className="w-full bg-white/10 backdrop-blur-sm rounded-2xl p-4 flex items-center justify-between text-white hover:bg-white/20 transition-colors">
          <div className="flex items-center space-x-3">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21,18V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,3H19A2,2 0 0,1 21,5V6H12C10.89,6 10,6.9 10,8V16C10,17.11 10.89,18 12,18H21M12,16H22V8H12V16Z" />
            </svg>
            <span className="font-medium">Dompet</span>
          </div>
          <div className="w-5 h-5">→</div>
        </button>
      </div>

      {/* Enhanced Empty State */}
      {!isActive && (
        <div className="px-4 py-12 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
            <Clock className="w-16 h-16 text-white/50 mx-auto mb-4" />
            <p className="text-white text-lg font-medium mb-2">Status Nonaktif</p>
            <p className="text-white/70 text-sm">Aktifkan status untuk menerima order dengan sistem enhanced</p>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 px-6 z-50 rounded-t-3xl">
        <div className="max-w-md mx-auto flex items-center justify-between">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `flex flex-col items-center pt-1 ${isActive ? 'text-[#07595A] font-medium' : 'text-gray-400'}`
              }
            >
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default DriverDashboard;
