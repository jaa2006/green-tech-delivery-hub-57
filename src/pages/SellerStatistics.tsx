
import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, Package, ShoppingBag } from "lucide-react";
import SellerLayout from "../components/layout/SellerLayout";

interface StatData {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  completedOrders: number;
}

const SellerStatistics = () => {
  const [stats, setStats] = useState<StatData>({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    completedOrders: 0
  });
  const [loading, setLoading] = useState(true);

  // Sample data for charts
  const salesData = [
    { name: 'Sen', sales: 120000 },
    { name: 'Sel', sales: 150000 },
    { name: 'Rab', sales: 180000 },
    { name: 'Kam', sales: 200000 },
    { name: 'Jum', sales: 250000 },
    { name: 'Sab', sales: 300000 },
    { name: 'Min', sales: 280000 },
  ];

  const statusData = [
    { name: 'Completed', value: 65, color: '#22c55e' },
    { name: 'Pending', value: 20, color: '#eab308' },
    { name: 'Cancelled', value: 15, color: '#ef4444' },
  ];

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // Subscribe to orders
    const ordersQuery = query(collection(db, "orders"), where("sellerId", "==", user.uid));
    const unsubOrders = onSnapshot(ordersQuery, (snapshot) => {
      const orders = snapshot.docs.map(doc => doc.data());
      const completed = orders.filter(order => order.status === 'completed');
      const totalRevenue = completed.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      
      setStats(prev => ({
        ...prev,
        totalOrders: orders.length,
        completedOrders: completed.length,
        totalRevenue
      }));
    });

    // Subscribe to products
    const productsQuery = query(collection(db, "products"), where("sellerId", "==", user.uid));
    const unsubProducts = onSnapshot(productsQuery, (snapshot) => {
      setStats(prev => ({ ...prev, totalProducts: snapshot.size }));
      setLoading(false);
    });

    return () => {
      unsubOrders();
      unsubProducts();
    };
  }, []);

  if (loading) {
    return (
      <SellerLayout>
        <div className="min-h-screen bg-gradient-to-b from-[#07595A] to-black flex items-center justify-center">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout>
      <div className="min-h-screen bg-gradient-to-b from-[#07595A] to-black">
        {/* Header */}
        <div className="bg-[#07595A] px-4 py-4 rounded-b-3xl">
          <h1 className="text-white text-2xl font-semibold">Statistik Penjualan</h1>
          <p className="text-white/80 text-sm">Analisis performa toko Anda</p>
        </div>

        <div className="p-4 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3">
                <DollarSign className="text-green-400 w-8 h-8" />
                <div>
                  <p className="text-white/70 text-sm">Total Revenue</p>
                  <p className="text-white text-xl font-bold">Rp {stats.totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3">
                <ShoppingBag className="text-blue-400 w-8 h-8" />
                <div>
                  <p className="text-white/70 text-sm">Total Pesanan</p>
                  <p className="text-white text-xl font-bold">{stats.totalOrders}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Package className="text-orange-400 w-8 h-8" />
                <div>
                  <p className="text-white/70 text-sm">Total Produk</p>
                  <p className="text-white text-xl font-bold">{stats.totalProducts}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="text-purple-400 w-8 h-8" />
                <div>
                  <p className="text-white/70 text-sm">Pesanan Selesai</p>
                  <p className="text-white text-xl font-bold">{stats.completedOrders}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sales Chart */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <h3 className="text-white text-lg font-semibold mb-4">Penjualan Mingguan</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis dataKey="name" stroke="#ffffff80" />
                  <YAxis stroke="#ffffff80" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: 'none', 
                      borderRadius: '8px',
                      color: '#ffffff'
                    }}
                    formatter={(value) => [`Rp ${Number(value).toLocaleString()}`, 'Penjualan']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#07595A" 
                    strokeWidth={3}
                    dot={{ fill: '#07595A', strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Order Status Distribution */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <h3 className="text-white text-lg font-semibold mb-4">Status Pesanan</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: 'none', 
                      borderRadius: '8px',
                      color: '#ffffff'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Performance */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <h3 className="text-white text-lg font-semibold mb-4">Performa Bulanan</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis dataKey="name" stroke="#ffffff80" />
                  <YAxis stroke="#ffffff80" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: 'none', 
                      borderRadius: '8px',
                      color: '#ffffff'
                    }}
                    formatter={(value) => [`Rp ${Number(value).toLocaleString()}`, 'Penjualan']}
                  />
                  <Bar dataKey="sales" fill="#07595A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
};

export default SellerStatistics;
