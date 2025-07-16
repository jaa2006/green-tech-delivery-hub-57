
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/components/ui/use-toast";

interface Food {
  id: number;
  name: string;
  price: number;
  restaurant: string;
  image: string;
}

interface PopularFoodCardProps {
  food: Food;
}

const PopularFoodCard = ({ food }: PopularFoodCardProps) => {
  const { addToCart } = useCart();
  const { toast } = useToast();

  // Format price to IDR
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addToCart({
      id: food.id.toString(),
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

  return (
    <div className="habisin-card hover:shadow-lg transition-shadow duration-300 relative">
      <Link to={`/food/${food.id}`} className="block">
        <div className="aspect-video rounded-xl overflow-hidden mb-2">
          <img
            src={food.image}
            alt={food.name}
            className="w-full h-full object-cover"
          />
        </div>
        <h3 className="font-medium text-sm line-clamp-1">{food.name}</h3>
        <p className="text-xs text-muted-foreground">{food.restaurant}</p>
        <p className="text-habisin-dark font-semibold text-sm mt-1">
          {formatPrice(food.price)}
        </p>
      </Link>
      
      <button
        onClick={handleAddToCart}
        className="absolute top-2 right-2 bg-habisin-dark text-white p-2 rounded-full shadow-lg hover:bg-opacity-90 transition-colors"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
};

export default PopularFoodCard;
