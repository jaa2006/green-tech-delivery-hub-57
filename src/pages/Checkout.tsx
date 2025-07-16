
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, CreditCard } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { useCart } from "@/contexts/CartContext";
import { useOrder } from "@/contexts/OrderContext";
import { useToast } from "@/components/ui/use-toast";

const Checkout = () => {
  const { items, getTotalPrice, clearCart } = useCart();
  const { addOrder } = useOrder();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedPayment, setSelectedPayment] = useState("");
  const [address, setAddress] = useState("");

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const paymentMethods = [
    { id: "cod", name: "Cash on Delivery (COD)", icon: "💵" },
    { id: "dana", name: "DANA", icon: "💙" },
    { id: "gopay", name: "GoPay", icon: "💚" },
    { id: "qris", name: "QRIS", icon: "📱" },
  ];

  const getPaymentMethodName = (id: string) => {
    const method = paymentMethods.find(m => m.id === id);
    return method ? method.name : "";
  };

  const handleOrder = () => {
    if (!address.trim()) {
      toast({
        title: "Alamat diperlukan",
        description: "Silakan masukkan alamat pengiriman",
        variant: "destructive",
      });
      return;
    }

    if (!selectedPayment) {
      toast({
        title: "Metode pembayaran diperlukan",
        description: "Silakan pilih metode pembayaran",
        variant: "destructive",
      });
      return;
    }

    // Ambil restaurant dari item pertama (asumsi semua item dari restaurant yang sama)
    const restaurant = items[0]?.restaurant || "Restaurant";
    const orderImage = items[0]?.image || "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&fit=crop&w=300&h=200";

    // Simpan pesanan
    addOrder({
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        restaurant: item.restaurant,
        image: item.image,
        quantity: item.quantity
      })),
      restaurant,
      total: getTotalPrice(),
      address,
      paymentMethod: getPaymentMethodName(selectedPayment),
      image: orderImage
    });

    toast({
      title: "Pesanan berhasil!",
      description: "Pesanan Anda sedang diproses",
    });

    clearCart();
    navigate("/orders");
  };

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-[#07595A] to-black">
        <div className="bg-[#07595A] px-6 py-6 flex items-center rounded-b-3xl">
          <Link to="/cart" className="mr-4">
            <ArrowLeft className="h-6 w-6 text-white" />
          </Link>
          <h1 className="text-white text-2xl font-semibold">Checkout</h1>
        </div>

        <div className="p-6 pb-32">
          {/* Ringkasan Pesanan */}
          <div className="habisin-card mb-4">
            <h2 className="text-lg font-semibold mb-3">Ringkasan Pesanan</h2>
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">{item.name}</h3>
                    <p className="text-xs text-gray-500">{item.restaurant}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                </div>
                <p className="font-semibold text-[#07595A]">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))}
            <div className="flex justify-between items-center pt-3 mt-3 border-t border-gray-200">
              <span className="font-semibold">Total</span>
              <span className="text-lg font-bold text-[#07595A]">
                {formatPrice(getTotalPrice())}
              </span>
            </div>
          </div>

          {/* Alamat Pengiriman */}
          <div className="habisin-card mb-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-5 w-5 text-[#07595A]" />
              <h2 className="text-lg font-semibold">Alamat Pengiriman</h2>
            </div>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Masukkan alamat lengkap pengiriman..."
              className="w-full p-3 border border-gray-200 rounded-lg resize-none"
              rows={3}
            />
          </div>

          {/* Metode Pembayaran */}
          <div className="habisin-card mb-6">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="h-5 w-5 text-[#07595A]" />
              <h2 className="text-lg font-semibold">Metode Pembayaran</h2>
            </div>
            <div className="space-y-2">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedPayment(method.id)}
                  className={`w-full p-3 rounded-lg border-2 transition-colors flex items-center gap-3 ${
                    selectedPayment === method.id
                      ? "border-[#07595A] bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className="text-2xl">{method.icon}</span>
                  <span className="font-medium">{method.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tombol Pesan */}
          <button 
            onClick={handleOrder}
            className="habisin-button w-full"
          >
            Pesan Sekarang - {formatPrice(getTotalPrice())}
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default Checkout;
