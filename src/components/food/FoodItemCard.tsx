
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/components/ui/use-toast";

interface FoodItem {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
}

interface FoodItemCardProps {
  item: FoodItem;
}

const FoodItemCard = ({ item }: FoodItemCardProps) => {
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
      id: item.id,
      name: item.name,
      price: item.price,
      restaurant: "Restaurant", // Default restaurant name
      image: item.image
    });
    
    toast({
      title: "Ditambahkan ke keranjang",
      description: `${item.name} telah ditambahkan ke keranjang`,
    });
  };

  return (
    <div className="habisin-card flex gap-4 hover:shadow-lg transition-shadow duration-300 relative">
      <Link to={`/food/${item.id}`} className="flex gap-4 flex-1">
        {/* Food image */}
        <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
          <img 
            src={item.image} 
            alt={item.name}
            className="w-full h-full object-cover" 
          />
        </div>
        
        {/* Food info */}
        <div className="flex-1">
          <h3 className="font-semibold mb-1">{item.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{item.description}</p>
          <p className="font-bold text-habisin-dark">{formatPrice(item.price)}</p>
        </div>
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

export default FoodItemCard;
