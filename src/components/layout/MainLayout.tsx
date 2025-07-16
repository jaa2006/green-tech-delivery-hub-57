
import { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { Home, Search, ClipboardList, User, ShoppingCart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useOrder } from "@/contexts/OrderContext";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { currentUser } = useAuth();
  const { getTotalItems } = useCart();
  const { getOrderCount } = useOrder();

  console.log('MainLayout: Rendering for user:', currentUser?.uid || 'No user');

  const navItems = [
    { 
      path: "/user-dashboard",
      label: "Home", 
      icon: <Home className="h-5 w-5" /> 
    },
    { 
      path: "/search", 
      label: "Search", 
      icon: <Search className="h-5 w-5" /> 
    },
    { 
      path: "/cart", 
      label: "Cart", 
      icon: (
        <div className="relative">
          <ShoppingCart className="h-5 w-5" />
          {getTotalItems() > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {getTotalItems()}
            </div>
          )}
        </div>
      )
    },
    { 
      path: "/orders", 
      label: "Orders", 
      icon: (
        <div className="relative">
          <ClipboardList className="h-5 w-5" />
          {getOrderCount() > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {getOrderCount()}
            </div>
          )}
        </div>
      )
    },
    { 
      path: "/profile", 
      label: "Profile", 
      icon: <User className="h-5 w-5" /> 
    }
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#07595A] to-black">
      <div className="mobile-container">
        {children}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 px-6 z-50 rounded-t-3xl">
        <div className="max-w-md mx-auto flex items-center justify-between">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `flex flex-col items-center pt-1 transition-colors ${
                  isActive ? 'text-[#07595A] font-medium' : 'text-gray-400 hover:text-gray-600'
                }`
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

export default MainLayout;
