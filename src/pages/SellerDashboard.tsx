
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Store, Package, ShoppingBag, BarChart3, LogOut, Bell } from "lucide-react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, collection, query, where, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useToast } from "@/components/ui/use-toast";
import SellerLayout from "../components/layout/SellerLayout";

const SellerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sellerName, setSellerName] = useState("");
  const [storeName, setStoreName] = useState("");
  const [stats, setStats] = useState({
    totalProducts: 0,
    pendingOrders: 0,
    todaySales: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Check if user is a seller
          const sellerDoc = await getDoc(doc(db, "sellers", user.uid));
          if (sellerDoc.exists()) {
            const sellerData = sellerDoc.data();
            setSellerName(sellerData.name || "Seller");
            setStoreName(sellerData.storeName || "My Store");
          } else {
            // Fallback to users collection for legacy data
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists() && userDoc.data().role === "seller") {
              const userData = userDoc.data();
              setSellerName(userData.name || "Seller");
              setStoreName(userData.storeName || "My Store");
            } else {
              navigate("/auth");
            }
          }

          // Listen to real-time stats
          const productsQuery = query(collection(db, "products"), where("sellerId", "==", user.uid));
          const ordersQuery = query(collection(db, "orders"), where("sellerId", "==", user.uid), where("status", "==", "pending"));
          
          // Subscribe to products count
          const unsubProducts = onSnapshot(productsQuery, (snapshot) => {
            setStats(prev => ({ ...prev, totalProducts: snapshot.size }));
          });

          // Subscribe to pending orders
          const unsubOrders = onSnapshot(ordersQuery, (snapshot) => {
            setStats(prev => ({ ...prev, pendingOrders: snapshot.size }));
          });

          return () => {
            unsubProducts();
            unsubOrders();
          };
        } catch (error) {
          console.error("Error fetching seller data:", error);
        }
      } else {
        navigate("/auth");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

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

  return (
    <SellerLayout>
      <div className="min-h-screen bg-gradient-to-b from-[#07595A] to-black">
        {/* Header */}
        <div className="bg-[#07595A] px-4 py-4 flex justify-between items-center rounded-b-3xl">
          <div>
            <h1 className="text-white text-2xl font-semibold">HabiFood Seller</h1>
            <p className="text-white/80 text-sm">Halo, {sellerName}</p>
            <p className="text-white/60 text-xs">{storeName}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full">
              <Bell className="text-white w-5 h-5" />
            </div>
            <button
              onClick={handleLogout}
              className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors"
            >
              <LogOut className="text-white w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="p-4 grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Package className="text-white w-8 h-8" />
              <div>
                <p className="text-white/70 text-sm">Total Produk</p>
                <p className="text-white text-2xl font-bold">{stats.totalProducts}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-3">
              <ShoppingBag className="text-white w-8 h-8" />
              <div>
                <p className="text-white/70 text-sm">Pesanan Pending</p>
                <p className="text-white text-2xl font-bold">{stats.pendingOrders}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="text-white w-8 h-8" />
              <div>
                <p className="text-white/70 text-sm">Penjualan Hari Ini</p>
                <p className="text-white text-2xl font-bold">Rp {stats.todaySales.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Store className="text-white w-8 h-8" />
              <div>
                <p className="text-white/70 text-sm">Total Revenue</p>
                <p className="text-white text-2xl font-bold">Rp {stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-4">
          <h2 className="text-white text-xl font-bold mb-4">Aksi Cepat</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/seller/products/add"
              className="bg-[#07595A] text-white flex flex-col items-center justify-center p-6 rounded-xl hover:bg-[#065658] transition-colors"
            >
              <Package className="w-8 h-8 mb-2" />
              <span className="text-lg font-medium">Tambah Produk</span>
            </Link>
            
            <Link
              to="/seller/orders"
              className="bg-[#07595A] text-white flex flex-col items-center justify-center p-6 rounded-xl hover:bg-[#065658] transition-colors"
            >
              <ShoppingBag className="w-8 h-8 mb-2" />
              <span className="text-lg font-medium">Kelola Pesanan</span>
            </Link>
            
            <Link
              to="/seller/statistics"
              className="bg-[#07595A] text-white flex flex-col items-center justify-center p-6 rounded-xl hover:bg-[#065658] transition-colors"
            >
              <BarChart3 className="w-8 h-8 mb-2" />
              <span className="text-lg font-medium">Statistik</span>
            </Link>
            
            <Link
              to="/seller/profile"
              className="bg-[#07595A] text-white flex flex-col items-center justify-center p-6 rounded-xl hover:bg-[#065658] transition-colors"
            >
              <Store className="w-8 h-8 mb-2" />
              <span className="text-lg font-medium">Profil Toko</span>
            </Link>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
};

export default SellerDashboard;
