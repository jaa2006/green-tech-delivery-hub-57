
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User2, Bike, Utensils, LogOut } from "lucide-react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useToast } from "@/components/ui/use-toast";
import MainLayout from "../components/layout/MainLayout";
import PopularFoodCard from "../components/food/PopularFoodCard";
import PromoSlider from "../components/ui/PromoSlider";
import PromoPopup from "../components/ui/PromoPopup";
import DriverRegisterPopup from "../components/ui/DriverRegisterPopup";
import DriverFoundPopup from "@/components/ride/DriverFoundPopup";
import DriverComingPopup from "@/components/ride/DriverComingPopup";
import { useRealTimeOrderMonitor } from "@/hooks/useRealTimeOrderMonitor";
import { useOrderExpiration } from "@/hooks/useOrderExpiration";

// Sample popular food data
const popularFoods = [
  {
    id: 1,
    name: "Burger",
    price: 30000,
    restaurant: "Delicious Bites",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&h=200"
  },
  {
    id: 2,
    name: "Fried Chicken",
    price: 25000,
    restaurant: "Taste Corner",
    image: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=300&h=200"
  },
  {
    id: 3,
    name: "Pizza",
    price: 35000,
    restaurant: "Food Lovers",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=300&h=200"
  },
  {
    id: 4,
    name: "Salad",
    price: 20000,
    restaurant: "Healthy Eats",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=300&h=200"
  },
];

const UserDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userName, setUserName] = useState("");
  const [userPhoto, setUserPhoto] = useState("");
  const [showDriverComingPopup, setShowDriverComingPopup] = useState(false);
  
  // Check and expire old orders when page loads
  useOrderExpiration();
  
  // Enhanced real-time order monitoring
  const { 
    currentOrder, 
    showDriverFoundPopup, 
    driverData,
    hideDriverFoundPopup
  } = useRealTimeOrderMonitor();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          const userData = userDoc.data();
          if (userData) {
            setUserName(userData.name || userData.fullName || user.email?.split('@')[0] || "User");
            setUserPhoto(userData.photoURL || "");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        navigate("/auth");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Enhanced driver found popup handling
  const handleDriverFoundClose = () => {
    console.log('Dashboard: Driver found popup closed, showing coming popup');
    hideDriverFoundPopup();
    setShowDriverComingPopup(true);
  };

  const handleDriverComingClose = () => {
    console.log('Dashboard: Driver coming popup closed');
    setShowDriverComingPopup(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logout berhasil",
        description: "Sampai jumpa lagi!",
      });
      navigate("/auth");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Enhanced logging for debugging
  useEffect(() => {
    if (currentOrder || showDriverFoundPopup) {
      console.log('=== DASHBOARD ORDER STATE ===');
      console.log('Current Order:', currentOrder);
      console.log('Show Driver Found:', showDriverFoundPopup);
      console.log('Driver Data:', driverData);
      console.log('==========================');
    }
  }, [currentOrder, showDriverFoundPopup, driverData]);

  return (
    <MainLayout>
      <PromoPopup />
      <DriverRegisterPopup />
      
      {/* Enhanced Driver Found Popup with proper validation */}
      {showDriverFoundPopup && 
       currentOrder?.status === 'accepted' &&
       currentOrder?.assigned_driver_id && 
       driverData && (
        <DriverFoundPopup
          isOpen={showDriverFoundPopup}
          driverData={driverData}
          onClose={handleDriverFoundClose}
        />
      )}
      
      {/* Driver Coming Popup */}
      <DriverComingPopup
        isOpen={showDriverComingPopup}
        onClose={handleDriverComingClose}
      />
      
      <div className="min-h-screen bg-gradient-to-b from-[#07595A] to-black">
        {/* Header */}
        <div className="bg-[#07595A] px-4 py-4 flex justify-between items-center rounded-b-3xl">
          <div>
            <h1 className="text-white text-2xl font-semibold">habisin</h1>
            <p className="text-white/80 text-sm">Halo, {userName}</p>
            {currentOrder && (
              <p className="text-white/60 text-xs">
                Order aktif: {currentOrder.status}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-full">
              {userPhoto ? (
                <img 
                  src={userPhoto} 
                  alt="Profile" 
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <User2 className="text-[#07595A] w-6 h-6" />
              )}
            </div>
            <button
              onClick={handleLogout}
              className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors"
            >
              <LogOut className="text-white w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Promo Slider */}
        <div className="px-2 mt-4">
          <PromoSlider />
        </div>

        {/* Content */}
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-2 text-white">Welcome!</h2>
          <p className="text-gray-300 mb-6">Choose a service</p>

          {/* Service Buttons */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <Link
              to="/habiride"
              className="bg-[#07595A] text-white flex flex-col items-center justify-center p-6 rounded-xl"
            >
              <Bike className="w-8 h-8 mb-2" />
              <span className="text-lg font-medium">HabiRide</span>
            </Link>
            
            <Link
              to="/habifood"
              className="bg-[#07595A] text-white flex flex-col items-center justify-center p-6 rounded-xl"
            >
              <Utensils className="w-8 h-8 mb-2" />
              <span className="text-lg font-medium">HabiFood</span>
            </Link>
          </div>

          {/* Popular Items */}
          <div>
            <h2 className="text-xl font-bold mb-4 text-white">Popular Items</h2>
            <div className="grid grid-cols-2 gap-3">
              {popularFoods.map(food => (
                <PopularFoodCard key={food.id} food={food} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default UserDashboard;
