
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Minus, Trash2 } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { useCart } from "@/contexts/CartContext";

const Cart = () => {
  const { items, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (items.length === 0) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-b from-[#07595A] to-black">
          <div className="bg-[#07595A] px-6 py-6 flex items-center rounded-b-3xl">
            <Link to="/" className="mr-4">
              <ArrowLeft className="h-6 w-6 text-white" />
            </Link>
            <h1 className="text-white text-2xl font-semibold">Keranjang</h1>
          </div>
          
          <div className="flex flex-col items-center justify-center py-20 px-6">
            <div className="text-gray-400 text-6xl mb-4">🛒</div>
            <h2 className="text-xl font-semibold text-white mb-2">Keranjang Kosong</h2>
            <p className="text-gray-300 text-center mb-6">Belum ada produk yang ditambahkan ke keranjang</p>
            <Link to="/habifood" className="habisin-button">
              Mulai Belanja
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-[#07595A] to-black">
        <div className="bg-[#07595A] px-6 py-6 flex items-center justify-between rounded-b-3xl">
          <div className="flex items-center">
            <Link to="/" className="mr-4">
              <ArrowLeft className="h-6 w-6 text-white" />
            </Link>
            <h1 className="text-white text-2xl font-semibold">Keranjang</h1>
          </div>
          <button 
            onClick={clearCart}
            className="text-white text-sm hover:text-gray-200 transition-colors"
          >
            Hapus Semua
          </button>
        </div>

        <div className="p-4 pb-32">
          {items.map((item) => (
            <div key={item.id} className="habisin-card mb-4">
              <div className="flex gap-3">
                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-cover" 
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold mb-1 text-sm">{item.name}</h3>
                  <p className="text-xs text-gray-500 mb-2">{item.restaurant}</p>
                  <p className="font-bold text-[#07595A] text-sm">{formatPrice(item.price)}</p>
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 p-1 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                  
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-6 text-center font-medium text-xs">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-6 h-6 rounded-full bg-[#07595A] text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="habisin-card mt-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-xl font-bold text-[#07595A]">
                {formatPrice(getTotalPrice())}
              </span>
            </div>
            <Link 
              to="/checkout" 
              className="habisin-button block"
            >
              Lanjut ke Pembayaran
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Cart;
