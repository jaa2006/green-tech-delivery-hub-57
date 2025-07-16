
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { AnimatedButton } from "@/components/ui/animated-button";
import { useNotification } from "@/contexts/NotificationContext";
import { useNavigate } from "react-router-dom";

const GoogleLoginSection = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user exists in drivers collection
      const driverDoc = await getDoc(doc(db, "drivers", user.uid));
      
      if (!driverDoc.exists()) {
        showError("Akun driver tidak ditemukan. Silakan daftar terlebih dahulu.");
        setIsGoogleLoading(false);
        return;
      } else {
        // Check if existing user has correct role
        const driverData = driverDoc.data();
        if (driverData.role !== "driver") {
          showError("Akun ini bukan akun driver");
          setIsGoogleLoading(false);
          return;
        }
      }

      showSuccess("Login berhasil! Selamat datang kembali, Driver!");
      
      // Navigate immediately to driver dashboard
      navigate("/driver-dashboard", { replace: true });
    } catch (error: any) {
      showError("Login dengan Google gagal");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-600" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-gray-800 text-gray-400">atau</span>
        </div>
      </div>
      
      <AnimatedButton
        type="button"
        onClick={handleGoogleLogin}
        disabled={isGoogleLoading}
        variant="secondary"
        className="w-full mt-4 bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
        icon={isGoogleLoading ? 
          <Loader2 className="h-4 w-4 animate-spin" /> : 
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        }
      >
        {isGoogleLoading ? "Masuk dengan Google..." : "Masuk dengan Google"}
      </AnimatedButton>
    </div>
  );
};

export default GoogleLoginSection;
