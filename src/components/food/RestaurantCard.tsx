
import { Link } from "react-router-dom";
import { Star } from "lucide-react";

interface Restaurant {
  id: number;
  name: string;
  rating: number;
  estimatedTime: string;
  cuisineType: string;
  image: string;
}

interface RestaurantCardProps {
  restaurant: Restaurant;
}

const RestaurantCard = ({ restaurant }: RestaurantCardProps) => {
  return (
    <Link to={`/restaurant/${restaurant.id}`}>
      <div className="habisin-card flex gap-4 hover:shadow-lg transition-shadow duration-300">
        {/* Restaurant image */}
        <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
          <img 
            src={restaurant.image} 
            alt={restaurant.name}
            className="w-full h-full object-cover" 
          />
        </div>
        
        {/* Restaurant info */}
        <div className="flex-1">
          <h3 className="font-semibold mb-1">{restaurant.name}</h3>
          <p className="text-sm text-muted-foreground mb-2">{restaurant.cuisineType}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-medium">{restaurant.rating}</span>
            </div>
            
            <div className="text-sm text-muted-foreground">
              {restaurant.estimatedTime} min
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;
