import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Users, MapPin, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

const OnboardingSlide1 = ({ onNext }: { onNext: () => void }) => (
  <div className="flex flex-col h-screen px-4 sm:px-6 text-center relative">
    <div className="flex-1 flex flex-col items-center justify-center pt-16 pb-20">
      <div className="w-48 h-48 sm:w-64 sm:h-64 mx-auto mb-6 flex items-center justify-center">
        <img 
          src="/lovable-uploads/2c2d5db7-a250-4918-942c-dc46267cd61f.png" 
          alt="Marketing illustration"
          className="w-full h-full object-contain"
        />
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Habisin</h1>
      <p className="text-lg sm:text-xl text-white leading-relaxed mb-8 max-w-sm">
        Transportasi Mudah, Cepat, dan Aman
      </p>
      
      <Button 
        onClick={onNext}
        className="w-full max-w-sm bg-[#07595A] hover:bg-[#065658] text-white py-4 text-lg rounded-full"
      >
        Get Started
        <ChevronRight className="ml-2 h-5 w-5" />
      </Button>
    </div>
  </div>
);

const OnboardingSlide2 = ({ onNext }: { onNext: () => void }) => (
  <div className="flex flex-col h-screen px-4 sm:px-6 text-center relative">
    <div className="flex-1 flex flex-col items-center justify-center pt-16 pb-20">
      <div className="w-48 h-48 sm:w-64 sm:h-64 mx-auto mb-6 flex items-center justify-center">
        <img 
          src="/lovable-uploads/7a606a41-2a80-43b9-9985-0337f4997784.png" 
          alt="Customer support illustration"
          className="w-full h-full object-contain"
        />
      </div>
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">Mudah & Efisien</h2>
      <p className="text-base sm:text-lg text-white leading-relaxed max-w-md mb-8 px-4">
        Habisin memudahkan kamu bepergian dengan cepat, aman, dan efisien lewat layanan transportasi digital.
      </p>
      
      <Button 
        onClick={onNext}
        className="w-full max-w-sm bg-[#07595A] hover:bg-[#065658] text-white py-4 text-lg rounded-full"
      >
        Next
        <ChevronRight className="ml-2 h-5 w-5" />
      </Button>
    </div>
  </div>
);

const OnboardingSlide3 = ({ onFinish }: { onFinish: () => void }) => (
  <div className="flex flex-col h-screen px-4 sm:px-6 text-center relative">
    <div className="flex-1 flex flex-col items-center justify-center pt-16 pb-20">
      <div className="w-48 h-48 sm:w-64 sm:h-64 mx-auto mb-6 flex items-center justify-center">
        <img 
          src="/lovable-uploads/904f363d-66ee-49d0-be2f-b18c81228c93.png" 
          alt="Delivery success illustration"
          className="w-full h-full object-contain"
        />
      </div>
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8">Cara Menggunakan</h2>
      
      <div className="space-y-4 sm:space-y-6 max-w-sm mb-8">
        <div className="flex items-center space-x-4 text-left">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#07595A] rounded-full flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm sm:text-base">1. Daftar & Login</h3>
            <p className="text-xs sm:text-sm text-white/80">Buat akun atau masuk ke aplikasi</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 text-left">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#07595A] rounded-full flex items-center justify-center flex-shrink-0">
            <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm sm:text-base">2. Pilih Lokasi</h3>
            <p className="text-xs sm:text-sm text-white/80">Tentukan lokasi jemput dan tujuan</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 text-left">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#07595A] rounded-full flex items-center justify-center flex-shrink-0">
            <Car className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm sm:text-base">3. Driver Menjemput</h3>
            <p className="text-xs sm:text-sm text-white/80">Driver datang dan antar ke tujuan</p>
          </div>
        </div>
      </div>
      
      <Button 
        onClick={onFinish}
        className="w-full max-w-sm bg-[#07595A] hover:bg-[#065658] text-white py-4 text-lg rounded-full"
      >
        Mulai Sekarang
        <ChevronRight className="ml-2 h-5 w-5" />
      </Button>
    </div>
  </div>
);

const Onboarding = () => {
  const navigate = useNavigate();

  const handleFinishOnboarding = () => {
    localStorage.setItem("has_seen_onboarding", "true");
    console.log('Onboarding completed, navigating to register page');
    navigate("/register");
  };

  const handleSkipToRegister = () => {
    localStorage.setItem("has_seen_onboarding", "true");
    console.log('Skipping to register page');
    navigate("/register");
  };

  const slides = [
    <OnboardingSlide1 onNext={handleFinishOnboarding} />,
    <OnboardingSlide2 onNext={handleFinishOnboarding} />,
    <OnboardingSlide3 onFinish={handleFinishOnboarding} />,
  ];

  const [api, setApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrentSlide(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrentSlide(api.selectedScrollSnap());
    });
  }, [api]);

  const handleNext = () => {
    api?.scrollNext();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#07595A] to-black">
      {/* Skip Button - Fixed at top right */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={handleSkipToRegister}
          className="text-white/60 hover:text-white transition-colors text-sm sm:text-base px-3 py-2"
        >
          Skip
        </button>
      </div>

      <div className="w-full h-screen">
        <Carousel setApi={setApi} className="w-full h-full">
          <CarouselContent className="h-full">
            {slides.map((slide, index) => (
              <CarouselItem key={index} className="h-full">{slide}</CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Bottom Navigation */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center justify-center">
          <div className="flex space-x-2">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-[#fdbc40]' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Next Button - Only show if not on last slide */}
        {currentSlide < slides.length - 1 && (
          <div className="absolute bottom-8 right-6">
            <button
              onClick={() => api?.scrollNext()}
              className="bg-[#fdbc40] text-[#07595A] px-4 sm:px-6 py-2 rounded-full font-medium hover:bg-[#e6a835] transition-colors text-sm sm:text-base"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
