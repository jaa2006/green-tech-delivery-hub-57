
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, CheckCircle, MapPin } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { useOrder } from "@/contexts/OrderContext";

const Orders = () => {
  const { orders } = useOrder();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "text-green-600 bg-green-100";
      case "preparing":
        return "text-yellow-600 bg-yellow-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      case "preparing":
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-[#07595A] to-black">
        <div className="bg-[#07595A] px-6 py-6 flex items-center rounded-b-3xl">
          <Link to="/" className="mr-4">
            <ArrowLeft className="h-6 w-6 text-white" />
          </Link>
          <h1 className="text-white text-2xl font-semibold">My Orders</h1>
        </div>

        <div className="p-6 pb-24">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h2 className="text-xl font-semibold text-white mb-2">No Orders Yet</h2>
              <p className="text-gray-300 text-center mb-6">You haven't placed any orders yet</p>
              <Link to="/habifood" className="habisin-button">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 text-gray-900">
                  {/* Order Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start gap-3">
                      <img 
                        src={order.image} 
                        alt="Order"
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{order.id}</h3>
                        <p className="text-gray-600 text-sm">{order.restaurant}</p>
                        <p className="text-gray-500 text-xs">{order.date} • {order.time}</p>
                        <p className="text-gray-500 text-xs">Pembayaran: {order.paymentMethod}</p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="capitalize">{order.status}</span>
                    </div>
                  </div>
                  
                  {/* Delivery Address */}
                  <div className="mb-3 flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                    <p className="text-gray-600 text-sm">{order.address}</p>
                  </div>
                  
                  {/* Order Items */}
                  <div className="mb-4">
                    <p className="text-gray-700 text-sm font-medium mb-2">Items Ordered:</p>
                    <div className="space-y-1">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="text-gray-700">{item.quantity}x {item.name}</span>
                          <span className="text-gray-600">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Total */}
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <span className="text-gray-700 font-medium">Total</span>
                    <span className="font-bold text-gray-900 text-lg">{formatPrice(order.total)}</span>
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

export default Orders;
