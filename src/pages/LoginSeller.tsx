
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, LogIn, ArrowRight, Loader2, ArrowLeft } from "lucide-react";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AnimatedButton } from "@/components/ui/animated-button";
import { useNotification } from "@/contexts/NotificationContext";

const LoginSeller = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!email || !password) {
        showError("Email dan password harus diisi");
        setIsLoading(false);
        return;
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check user role in sellers collection
      console.log('Checking sellers collection for UID:', user.uid);
      const sellerDoc = await getDoc(doc(db, "sellers", user.uid));
      
      if (!sellerDoc.exists()) {
        showError("Akun seller tidak ditemukan");
        setIsLoading(false);
        return;
      }

      const sellerData = sellerDoc.data();
      if (sellerData.role !== "seller") {
        showError("Akun ini bukan akun seller");
        setIsLoading(false);
        return;
      }

      showSuccess("Login berhasil! Selamat datang kembali!");
      
      setTimeout(() => {
        navigate("/seller-dashboard");
      }, 1500);
    } catch (error: any) {
      let errorMessage = "Login gagal";
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = "Email atau password salah";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Format email tidak valid";
      }
      
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user exists in sellers collection
      const sellerDoc = await getDoc(doc(db, "sellers", user.uid));
      
      if (!sellerDoc.exists()) {
        // Create seller profile if doesn't exist
        const sellerData = {
          uid: user.uid,
          name: user.displayName || "Seller",
          email: user.email || "",
          role: "seller",
          storeName: `${user.displayName || "Seller"}'s Store`,
          storeDescription: "",
          location: {
            lat: -6.2088,
            lng: 106.8456
          },
          createdAt: new Date(),
          ...(user.photoURL && { photoURL: user.photoURL })
        };
        
        console.log('Creating new seller in sellers collection:', sellerData);
        await setDoc(doc(db, "sellers", user.uid), sellerData);
      } else {
        // Check if existing user has correct role
        const sellerData = sellerDoc.data();
        if (sellerData.role !== "seller") {
          showError("Akun ini bukan akun seller");
          setIsGoogleLoading(false);
          return;
        }
      }

      showSuccess("Login berhasil! Selamat datang kembali!");
      
      setTimeout(() => {
        navigate("/seller-dashboard");
      }, 1500);
    } catch (error: any) {
      showError("Login dengan Google gagal");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#07595A] to-black flex flex-col">
      {/* Header */}
      <div className="bg-[#07595A] rounded-b-3xl h-24 flex items-center justify-center relative mb-8">
        <Link to="/auth" className="absolute left-6 top-1/2 -translate-y-1/2">
          <ArrowLeft className="h-6 w-6 text-white" />
        </Link>
        <h1 className="text-white text-2xl font-bold">Login Seller</h1>
      </div>

      {/* Login container */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-md w-full">
          <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl shadow-lg p-6 border border-gray-700">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Masukkan email Anda"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    disabled={isLoading || isGoogleLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Password</Label>
                <div className="relative">
                  <LogIn className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Masukkan password Anda"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    disabled={isLoading || isGoogleLoading}
                  />
                </div>
              </div>

              <AnimatedButton
                type="submit"
                className="w-full"
                disabled={isLoading || isGoogleLoading}
                icon={isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
              >
                {isLoading ? "Masuk..." : "Masuk"}
              </AnimatedButton>
            </form>

            {/* Google Login Button */}
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
                disabled={isLoading || isGoogleLoading}
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

            <div className="mt-6 text-center text-sm text-gray-400">
              Belum punya akun?{" "}
              <Link
                to="/register-seller"
                className="text-[#07595A] font-medium hover:underline"
              >
                Daftar sebagai Seller
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSeller;
