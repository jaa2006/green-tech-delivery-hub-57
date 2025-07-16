
import { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { Home, Package, ShoppingBag, BarChart3, User, Store } from "lucide-react";

interface SellerLayoutProps {
  children: ReactNode;
}

const SellerLayout = ({ children }: SellerLayoutProps) => {
  const navItems = [
    { 
      path: "/seller-dashboard", 
      label: "Dashboard", 
      icon: <Home className="h-5 w-5" /> 
    },
    { 
      path: "/seller/products", 
      label: "Produk", 
      icon: <Package className="h-5 w-5" /> 
    },
    { 
      path: "/seller/orders", 
      label: "Pesanan", 
      icon: <ShoppingBag className="h-5 w-5" /> 
    },
    { 
      path: "/seller/statistics", 
      label: "Statistik", 
      icon: <BarChart3 className="h-5 w-5" /> 
    },
    { 
      path: "/seller/profile", 
      label: "Profil", 
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

export default SellerLayout;
