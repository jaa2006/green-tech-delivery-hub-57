import { useState } from "react";
import { Search as SearchIcon, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import RestaurantCard from "../components/food/RestaurantCard";
import PopularFoodCard from "../components/food/PopularFoodCard";

// Sample restaurant data - reusing from HabiFood
const restaurants = [
  {
    id: 1,
    name: "Ayam Geprek Pak Gembus",
    rating: 4.8,
    estimatedTime: "15-20",
    cuisineType: "Indonesian",
    image: "https://images.unsplash.com/photo-1626804475297-41608ea09aeb?auto=format&fit=crop&q=80&w=300&h=200"
  },
  {
    id: 2,
    name: "Burger King",
    rating: 4.3,
    estimatedTime: "20-30",
    cuisineType: "Fast Food",
    image: "https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&q=80&w=300&h=200"
  },
  {
    id: 3,
    name: "Sushi Tei",
    rating: 4.6,
    estimatedTime: "25-35",
    cuisineType: "Japanese",
    image: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&q=80&w=300&h=200"
  },
];

// Sample popular food data - reusing from Home
const popularFoods = [
  {
    id: 1,
    name: "Burger Deluxe",
    price: 45000,
    restaurant: "Burger King",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&h=200"
  },
  {
    id: 2,
    name: "Nasi Goreng Special",
    price: 35000,
    restaurant: "Warung Padang",
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=300&h=200"
  },
];

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter restaurants and food items based on search query
  const filteredRestaurants = restaurants.filter(restaurant => 
    restaurant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredFoods = popularFoods.filter(food => 
    food.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    food.restaurant.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const hasResults = filteredRestaurants.length > 0 || filteredFoods.length > 0;

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-[#07595A] to-black">
        {/* Header */}
        <div className="bg-[#07595A] px-6 py-6 flex items-center rounded-b-3xl">
          <Link to="/user-dashboard" className="mr-4">
            <ArrowLeft className="h-6 w-6 text-white" />
          </Link>
          <h1 className="text-white text-2xl font-semibold">Search</h1>
        </div>

        <div className="p-4 pb-24">
          {/* Search bar */}
          <div className="relative mb-6">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <SearchIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              type="text"
              placeholder="Search for restaurants, food, or cuisines..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#07595A]/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {searchQuery === "" ? (
            // Show popular searches when no query is entered
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-4 text-white">Popular Searches</h2>
                <div className="flex flex-wrap gap-2 mb-6">
                  {["Burger", "Nasi Goreng", "Pizza", "Sushi", "Coffee", "Ice Cream", "Vegetarian", "Indonesian"].map((item) => (
                    <button
                      key={item}
                      className="px-4 py-2 bg-gray-700 text-white rounded-full text-sm hover:bg-gray-600 transition-colors"
                      onClick={() => setSearchQuery(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-bold mb-4 text-white">Recommended For You</h2>
                <div className="space-y-3">
                  {restaurants.slice(0, 3).map(restaurant => (
                    <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Show search results
            <div className="space-y-6">
              {hasResults ? (
                <>
                  {filteredRestaurants.length > 0 && (
                    <div>
                      <h2 className="text-xl font-bold mb-4 text-white">Restaurants</h2>
                      <div className="space-y-3">
                        {filteredRestaurants.map(restaurant => (
                          <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {filteredFoods.length > 0 && (
                    <div>
                      <h2 className="text-xl font-bold mb-4 text-white">Food Items</h2>
                      <div className="grid grid-cols-2 gap-3">
                        {filteredFoods.map(food => (
                          <PopularFoodCard key={food.id} food={food} />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                // No results found
                <div className="py-10 text-center">
                  <p className="text-xl font-medium mb-2 text-white">No results found</p>
                  <p className="text-gray-300">Try searching for something else</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Search;
