
import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useToast } from "@/components/ui/use-toast";
import { Clock, CheckCircle, XCircle, Package } from "lucide-react";
import SellerLayout from "../components/layout/SellerLayout";
import { Button } from "@/components/ui/button";

interface Order {
  id: string;
  userId: string;
  userName: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  createdAt: Date;
}

const SellerOrders = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const ordersQuery = query(
      collection(db, "orders"),
      where("sellerId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Order[];
      
      setOrders(ordersData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status });
      toast({
        title: "Status pesanan diperbarui",
        description: `Pesanan berhasil diubah ke ${status}`,
      });
    } catch (error) {
      console.error("Error updating order:", error);
      toast({
        title: "Error",
        description: "Gagal memperbarui status pesanan",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'confirmed': 
      case 'preparing': 
      case 'ready': return <Package className="w-5 h-5 text-blue-500" />;
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const filteredOrders = orders.filter(order => 
    filter === 'all' || order.status === filter
  );

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
          <h1 className="text-white text-2xl font-semibold">Kelola Pesanan</h1>
          <p className="text-white/80 text-sm">{orders.length} total pesanan</p>
        </div>

        {/* Filter Tabs */}
        <div className="p-4">
          <div className="flex gap-2 mb-4 overflow-x-auto">
            {['all', 'pending', 'confirmed', 'preparing', 'ready', 'completed'].map((status) => (
              <Button
                key={status}
                variant={filter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(status)}
                className={filter === status 
                  ? "bg-[#07595A] text-white" 
                  : "bg-white/10 text-white border-white/30 hover:bg-white/20"
                }
              >
                {status === 'all' ? 'Semua' : status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-white/50 mx-auto mb-4" />
              <p className="text-white/70 text-lg mb-2">Tidak ada pesanan</p>
              <p className="text-white/50 text-sm">
                {filter === 'all' ? 'Belum ada pesanan masuk' : `Tidak ada pesanan dengan status ${filter}`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div key={order.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(order.status)}
                        <span className="text-white font-semibold">#{order.id.slice(0, 8)}</span>
                      </div>
                      <p className="text-white/70 text-sm">{order.userName}</p>
                      <p className="text-white/50 text-xs">
                        {order.createdAt.toLocaleDateString('id-ID')} {order.createdAt.toLocaleTimeString('id-ID')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">Rp {order.totalAmount.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mb-3">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-white/80 text-sm">
                        <span>{item.quantity}x {item.name}</span>
                        <span>Rp {(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  {order.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => updateOrderStatus(order.id, 'confirmed')}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Terima
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateOrderStatus(order.id, 'cancelled')}
                      >
                        Tolak
                      </Button>
                    </div>
                  )}

                  {order.status === 'confirmed' && (
                    <Button
                      size="sm"
                      onClick={() => updateOrderStatus(order.id, 'preparing')}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Mulai Siapkan
                    </Button>
                  )}

                  {order.status === 'preparing' && (
                    <Button
                      size="sm"
                      onClick={() => updateOrderStatus(order.id, 'ready')}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      Siap Diambil
                    </Button>
                  )}

                  {order.status === 'ready' && (
                    <Button
                      size="sm"
                      onClick={() => updateOrderStatus(order.id, 'completed')}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Selesai
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SellerLayout>
  );
};

export default SellerOrders;
