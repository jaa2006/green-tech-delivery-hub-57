
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User2, Bike, Utensils } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { validateUserRole, getDashboardPath } from "@/utils/authValidation";
import MainLayout from "../components/layout/MainLayout";
import PopularFoodCard from "../components/food/PopularFoodCard";
import { IllustratedLoginButton } from "@/components/ui/illustrated-login-button";
import DriverRegisterPopup from "../components/ui/DriverRegisterPopup";
import { useOrderExpiration } from "@/hooks/useOrderExpiration";
import LoadingScreen from "../components/auth/LoadingScreen";

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

const Index = () => {
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check and expire old orders when page loads (for authenticated users)
  useOrderExpiration();

  useEffect(() => {
    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem("has_seen_onboarding");
    const hasRegistered = localStorage.getItem("has_registered");
    
    if (!hasSeenOnboarding) {
      navigate("/onboarding");
      return;
    }

    // If user has seen onboarding but hasn't registered yet, send to register page
    if (!hasRegistered) {
      navigate("/register");
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          console.log('Index: Checking user role for UID:', user.uid);
          
          // Use the new validation utility
          const userValidation = await validateUserRole(user.uid, 'user');
          if (userValidation.isValid) {
            navigate("/user-dashboard");
            return;
          }
          
          const driverValidation = await validateUserRole(user.uid, 'driver');
          if (driverValidation.isValid) {
            navigate("/driver-dashboard");
            return;
          }

          const sellerValidation = await validateUserRole(user.uid, 'seller');
          if (sellerValidation.isValid) {
            navigate("/seller-dashboard");
            return;
          }
          
          console.log('Index: User found but no valid role data');
        } catch (error) {
          console.error("Index: Error fetching user role:", error);
        }
      } else {
        // No user logged in, but user has registered before, redirect to auth (login) page
        navigate("/auth");
        return;
      }
      setIsCheckingAuth(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  if (isCheckingAuth) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#07595A] to-black">
      <DriverRegisterPopup />
      {/* Header */}
      <div className="bg-[#095155] px-6 py-6 flex justify-between items-center rounded-b-3xl">
        <h1 className="text-white text-2xl font-semibold">habisin</h1>
        <div className="bg-white p-2 rounded-full">
          <User2 className="text-[#095155] w-6 h-6" />
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-2 text-white">Selamat Datang Kembali!</h2>
        <p className="text-gray-300 mb-6">Pilih cara masuk</p>

        {/* 3D Illustrated Login Options */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          <Link to="/login-user">
            <IllustratedLoginButton variant="user">
              Masuk Sebagai User
            </IllustratedLoginButton>
          </Link>
          
          <Link to="/login-driver">
            <IllustratedLoginButton variant="driver">
              Masuk Sebagai Driver
            </IllustratedLoginButton>
          </Link>
        </div>

        {/* Service Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-800 text-gray-400 flex flex-col items-center justify-center p-6 rounded-xl opacity-50">
            <Bike className="w-8 h-8 mb-2" />
            <span className="text-lg font-medium">HabiRide</span>
            <span className="text-xs">Login dulu</span>
          </div>
          
          <div className="bg-gray-800 text-gray-400 flex flex-col items-center justify-center p-6 rounded-xl opacity-50">
            <Utensils className="w-8 h-8 mb-2" />
            <span className="text-lg font-medium">HabiFood</span>
            <span className="text-xs">Login dulu</span>
          </div>
        </div>

        {/* Popular Items */}
        <div>
          <h2 className="text-xl font-bold mb-4 text-white">Popular Items</h2>
          <div className="grid grid-cols-2 gap-4">
            {popularFoods.map(food => (
              <PopularFoodCard key={food.id} food={food} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
