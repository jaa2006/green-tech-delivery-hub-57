import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Search, Star, Map } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FoodItemCard from "../components/food/FoodItemCard";
import MainLayout from "../components/layout/MainLayout";

// Sample restaurant data
const restaurantData = [
  {
    id: "1",
    name: "Ayam Geprek Pak Gembus",
    rating: 4.8,
    estimatedTime: "15-20",
    cuisineType: "Indonesian",
    image: "https://images.unsplash.com/photo-1626804475297-41608ea09aeb?auto=format&fit=crop&w=600",
    description: "Authentic Indonesian cuisine specializing in spicy fried chicken and traditional side dishes.",
    address: "Jl. Gatot Subroto No. 45, Jakarta Selatan",
    categories: ["Main Course", "Sides", "Beverages"],
    menu: [
      {
        id: "101",
        name: "Ayam Geprek Original",
        price: 25000,
        description: "Crispy fried chicken smashed with spicy chili",
        category: "Main Course",
        image: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=300&h=200",
      },
      {
        id: "102",
        name: "Ayam Geprek Keju",
        price: 30000,
        description: "Crispy fried chicken smashed with spicy chili and melted cheese",
        category: "Main Course",
        image: "https://images.unsplash.com/photo-1626082927389-6cd097cee6a6?auto=format&fit=crop&w=300&h=200",
      },
      {
        id: "103",
        name: "Tahu Tempe",
        price: 12000,
        description: "Fried tofu and tempeh with spicy sauce",
        category: "Sides",
        image: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&w=300&h=200",
      },
      {
        id: "104",
        name: "Es Teh",
        price: 5000,
        description: "Sweet iced tea",
        category: "Beverages",
        image: "https://images.unsplash.com/photo-1572107998877-f93e01d2f463?auto=format&fit=crop&w=300&h=200",
      },
      {
        id: "105",
        name: "Es Jeruk",
        price: 8000,
        description: "Fresh orange juice with ice",
        category: "Beverages",
        image: "https://images.unsplash.com/photo-1546171853-496f5573a2df?auto=format&fit=crop&w=300&h=200",
      },
    ]
  },
  {
    id: "2",
    name: "Burger King",
    rating: 4.3,
    estimatedTime: "20-30",
    cuisineType: "Fast Food",
    image: "https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=600",
    description: "American fast food restaurant chain specializing in hamburgers.",
    address: "Mall Grand Indonesia, Lt. 3, Jakarta Pusat",
    categories: ["Burgers", "Sides", "Drinks"],
    menu: [
      {
        id: "201",
        name: "Whopper",
        price: 45000,
        description: "Signature flame-grilled beef burger with fresh lettuce, tomatoes, onions, and mayo",
        category: "Burgers",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&h=200",
      },
      {
        id: "202",
        name: "Chicken Royale",
        price: 38000,
        description: "Crispy chicken fillet topped with lettuce and mayo",
        category: "Burgers",
        image: "https://images.unsplash.com/photo-1598182198871-d3f4ab4fd181?auto=format&fit=crop&w=300&h=200",
      },
      {
        id: "203",
        name: "French Fries",
        price: 20000,
        description: "Crispy golden french fries",
        category: "Sides",
        image: "https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=300&h=200",
      },
      {
        id: "204",
        name: "Coca Cola",
        price: 12000,
        description: "Refreshing cola with ice",
        category: "Drinks",
        image: "https://images.unsplash.com/photo-1581996323441-461d2a8f4124?auto=format&fit=crop&w=300&h=200",
      },
    ]
  },
  {
    id: "3",
    name: "Sushi Tei",
    rating: 4.6,
    estimatedTime: "25-35",
    cuisineType: "Japanese",
    image: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=600",
    description: "Premium Japanese restaurant offering a wide range of sushi, sashimi, and other Japanese dishes.",
    address: "Kota Kasablanka Mall, Lt. 2, Jakarta Selatan",
    categories: ["Sushi", "Sashimi", "Rice & Noodles", "Drinks"],
    menu: [
      {
        id: "301",
        name: "Salmon Sushi (6 pcs)",
        price: 60000,
        description: "Fresh salmon nigiri sushi",
        category: "Sushi",
        image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=300&h=200",
      },
      {
        id: "302",
        name: "Tuna Sashimi",
        price: 55000,
        description: "Sliced fresh tuna sashimi",
        category: "Sashimi",
        image: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=300&h=200",
      },
      {
        id: "303",
        name: "Chicken Teriyaki",
        price: 65000,
        description: "Grilled chicken with teriyaki sauce served with rice",
        category: "Rice & Noodles",
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&h=200",
      },
      {
        id: "304",
        name: "Green Tea",
        price: 18000,
        description: "Traditional Japanese green tea",
        category: "Drinks",
        image: "https://images.unsplash.com/photo-1565799568799-1f088e24e10a?auto=format&fit=crop&w=300&h=200",
      },
    ]
  },
];

const Restaurant = () => {
  const { id } = useParams<{ id: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  
  // Find the restaurant based on ID
  const restaurant = restaurantData.find(r => r.id === id);
  
  if (!restaurant) {
    return (
      <MainLayout>
        <div className="p-8 text-center">
          <p className="text-white">Restaurant not found</p>
          <Link to="/habifood" className="text-blue-400 hover:text-blue-300 underline mt-4 block">
            Back to Restaurants
          </Link>
        </div>
      </MainLayout>
    );
  }
  
  // Filter menu items based on search and category
  const filteredMenu = restaurant.menu.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });
  
  // Group menu items by category
  const menuByCategory: Record<string, typeof restaurant.menu> = {};
  restaurant.menu.forEach(item => {
    if (!menuByCategory[item.category]) {
      menuByCategory[item.category] = [];
    }
    menuByCategory[item.category].push(item);
  });

  return (
    <MainLayout>
      <div className="pb-8">
        {/* Header with restaurant image */}
        <div className="relative h-56">
          <div className="absolute left-0 top-4 z-10 ml-4">
            <Link to="/habifood" className="p-2 bg-white/80 rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </div>
          <img 
            src={restaurant.image} 
            alt={restaurant.name}
            className="w-full h-full object-cover" 
          />
        </div>
        
        {/* Restaurant info */}
        <div className="px-4 -mt-6 relative">
          <div className="habisin-card">
            <div className="flex justify-between items-start">
              <h1 className="text-xl font-bold">{restaurant.name}</h1>
              <div className="flex items-center gap-1 bg-habisin-dark/10 px-2 py-1 rounded-full">
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                <span className="text-sm font-medium">{restaurant.rating}</span>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mt-1">{restaurant.cuisineType}</p>
            
            <div className="flex items-center text-sm text-muted-foreground mt-3 gap-1">
              <Map className="h-4 w-4" />
              <span>{restaurant.address}</span>
            </div>
            
            <p className="text-sm mt-3">{restaurant.description}</p>
            
            <div className="flex items-center gap-2 mt-4">
              <span className="text-sm font-medium">Delivery time:</span>
              <span className="text-sm">{restaurant.estimatedTime} min</span>
            </div>
          </div>
        </div>
        
        {/* Menu search */}
        <div className="px-4 mt-6">
          <div className="relative mb-6">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <input
              type="text"
              placeholder="Search menu items..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-habisin-dark/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Category tabs */}
          <div className="mb-6 overflow-x-auto scrollbar-none">
            <div className="flex gap-2 pb-2">
              <button
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                  activeCategory === "All"
                    ? "bg-habisin-dark text-white"
                    : "bg-muted text-foreground"
                }`}
                onClick={() => setActiveCategory("All")}
              >
                All
              </button>
              {restaurant.categories.map(category => (
                <button
                  key={category}
                  className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                    activeCategory === category
                      ? "bg-habisin-dark text-white"
                      : "bg-muted text-foreground"
                  }`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          
          {/* Menu items */}
          {searchQuery || activeCategory !== "All" ? (
            // Display filtered menu items
            <div className="space-y-4">
              {filteredMenu.length > 0 ? (
                filteredMenu.map(item => (
                  <FoodItemCard 
                    key={item.id} 
                    item={{
                      id: item.id,
                      name: item.name,
                      price: item.price,
                      description: item.description,
                      image: item.image
                    }}
                  />
                ))
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No menu items found</p>
                </div>
              )}
            </div>
          ) : (
            // Display menu items by category
            <div className="space-y-8">
              {Object.entries(menuByCategory).map(([category, items]) => (
                <div key={category}>
                  <h2 className="font-semibold text-lg mb-4">{category}</h2>
                  <div className="space-y-4">
                    {items.map(item => (
                      <FoodItemCard 
                        key={item.id} 
                        item={{
                          id: item.id,
                          name: item.name,
                          price: item.price,
                          description: item.description,
                          image: item.image
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Restaurant;
