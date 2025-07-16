
import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, ShoppingCart, Zap } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useCart } from "@/contexts/CartContext";
import MainLayout from "../components/layout/MainLayout";

// Sample food data
const foodItems = [
  {
    id: "1",
    name: "Burger",
    price: 30000,
    restaurant: "Delicious Bites",
    restaurantId: 1,
    rating: 4.8,
    description: "Our signature burger with premium beef patty, fresh vegetables, and special sauce.",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600"
  },
];

const FoodDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  
  // Find the food item based on the ID
  const food = foodItems.find(item => item.id === id) || foodItems[0];
  
  const addToCartHandler = () => {
    addToCart({
      id: food.id,
      name: food.name,
      price: food.price,
      restaurant: food.restaurant,
      image: food.image
    });
    
    toast({
      title: "Ditambahkan ke keranjang",
      description: `${food.name} telah ditambahkan ke keranjang`,
    });
  };

  const orderNow = () => {
    addToCart({
      id: food.id,
      name: food.name,
      price: food.price,
      restaurant: food.restaurant,
      image: food.image
    });
    
    navigate("/checkout");
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-[#07595A] to-black">
        {/* Header */}
        <div className="bg-[#07595A] px-6 py-6 flex items-center rounded-b-3xl">
          <Link to="/habifood" className="mr-4">
            <ArrowLeft className="h-6 w-6 text-white" />
          </Link>
          <h1 className="text-white text-2xl font-semibold">Detail Makanan</h1>
        </div>
        
        {/* Food image */}
        <div className="h-64 bg-black">
          <img 
            src={food.image} 
            alt={food.name}
            className="w-full h-full object-cover" 
          />
        </div>
        
        {/* Food details */}
        <div className="bg-white rounded-t-3xl -mt-6 px-6 pt-6 pb-32">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">{food.name}</h1>
            <div className="flex justify-between items-center mt-2">
              <p className="text-2xl font-bold">IDR {food.price.toLocaleString()}</p>
              <div className="flex items-center">
                <p className="font-medium mr-1">{food.rating}</p>
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="font-medium text-lg">Restaurant</h3>
              <div className="flex items-center justify-between mt-1">
                <Link to={`/restaurant/${food.restaurantId}`} className="text-[#07595A]">
                  {food.restaurant}
                </Link>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="font-medium text-lg">Deskripsi</h3>
              <p className="mt-1 text-gray-700">{food.description}</p>
            </div>
          </div>
          
          {/* Action buttons - Fixed for mobile responsiveness */}
          <div className="fixed bottom-20 left-4 right-4 flex gap-3 z-10">
            <button 
              onClick={addToCartHandler}
              className="flex-1 bg-white border-2 border-[#07595A] text-[#07595A] py-3 px-4 rounded-xl font-medium text-sm sm:text-base flex items-center justify-center min-h-[48px] active:scale-95 transition-transform"
            >
              <ShoppingCart className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              <span className="truncate">Keranjang</span>
            </button>
            <button 
              onClick={orderNow}
              className="flex-1 bg-[#07595A] text-white py-3 px-4 rounded-xl font-medium text-sm sm:text-base flex items-center justify-center min-h-[48px] active:scale-95 transition-transform"
            >
              <Zap className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              <span className="truncate">Pesan Sekarang</span>
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default FoodDetail;
