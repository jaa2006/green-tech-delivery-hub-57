
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PromoSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const promos = [
    {
      id: 1,
      title: "Diskon 50% untuk Pengguna Baru!",
      description: "Dapatkan diskon hingga 50% untuk pesanan pertama Anda",
      background: "bg-gradient-to-r from-purple-500 to-pink-500",
      icon: "🎉"
    },
    {
      id: 2,
      title: "Gratis Ongkir untuk Semua Makanan",
      description: "Nikmati gratis ongkir tanpa minimum pembelian",
      background: "bg-gradient-to-r from-blue-500 to-teal-500",
      icon: "🚚"
    },
    {
      id: 3,
      title: "Cashback 20% dengan HabiPay",
      description: "Bayar dengan HabiPay dan dapatkan cashback 20%",
      background: "bg-gradient-to-r from-green-500 to-emerald-500",
      icon: "💰"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % promos.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [promos.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + promos.length) % promos.length);
  };

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % promos.length);
  };

  return (
    <div className="relative w-full max-w-sm mx-auto h-28 rounded-2xl overflow-hidden shadow-lg mb-4">
      <div 
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {promos.map((promo) => (
          <div
            key={promo.id}
            className={`min-w-full h-full ${promo.background} flex items-center justify-between p-3 text-white`}
          >
            <div className="flex-1 pr-2">
              <h3 className="font-bold text-sm mb-1 leading-tight">{promo.title}</h3>
              <p className="text-xs opacity-90 leading-tight">{promo.description}</p>
            </div>
            <div className="text-2xl ml-2">
              {promo.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={goToPrevSlide}
        className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-1 transition-colors"
      >
        <ChevronLeft className="w-3 h-3 text-white" />
      </button>
      
      <button
        onClick={goToNextSlide}
        className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-1 transition-colors"
      >
        <ChevronRight className="w-3 h-3 text-white" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-1">
        {promos.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              index === currentSlide ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default PromoSlider;
