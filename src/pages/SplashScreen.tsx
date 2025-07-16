
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bike } from "lucide-react";

const SplashScreen = () => {
  const navigate = useNavigate();
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    setTimeout(() => {
      setAnimate(true);
    }, 100);

    // Redirect to auth page after animation completes
    const timer = setTimeout(() => {
      navigate("/auth");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#07595A] to-black flex flex-col items-center justify-center">
      <div className={`flex flex-col items-center ${animate ? 'animate-bounce' : ''}`}>
        <div className="bg-white p-4 rounded-full mb-4">
          <Bike className="text-[#07595A] w-12 h-12" />
        </div>
        <h1 className="text-white text-4xl font-bold">habisin</h1>
        <p className="text-white/80 mt-2">Deliver with care</p>
      </div>
    </div>
  );
};

export default SplashScreen;
