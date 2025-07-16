import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, LogIn, ArrowRight, Loader2, ArrowLeft, Truck } from "lucide-react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AnimatedButton } from "@/components/ui/animated-button";
import { useToast } from "@/components/ui/use-toast";

const RegisterDriver = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signup } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [kendaraan, setKendaraan] = useState("");
  const [platNomor, setPlatNomor] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!name || !email || !password || !kendaraan || !platNomor) {
        toast({
          title: "Error",
          description: "Semua field harus diisi",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (!acceptTerms) {
        toast({
          title: "Error",
          description: "Anda harus menerima syarat dan ketentuan",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Use AuthContext signup method for drivers
      await signup(email, password, name, 'driver', {
        vehicle_type: kendaraan,
        plate_number: platNomor
      });

      toast({
        title: "Akun driver berhasil dibuat",
        description: "Selamat datang di Habisin, Driver!",
      });

      navigate("/driver-dashboard");
    } catch (error: any) {
      let errorMessage = "Pendaftaran gagal";
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Email sudah digunakan";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password terlalu lemah";
      }
      
      toast({
        title: "Pendaftaran Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    
    try {
      if (!kendaraan || !platNomor) {
        toast({
          title: "Error",
          description: "Mohon isi informasi kendaraan terlebih dahulu",
          variant: "destructive",
        });
        setIsGoogleLoading(false);
        return;
      }

      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Save driver data directly to drivers collection only
      const driverData = {
        uid: user.uid,
        name: user.displayName || "Driver",
        email: user.email || "",
        role: "driver",
        vehicle_type: kendaraan,
        plate_number: platNomor,
        location: {
          lat: -6.2088, // Default location (Jakarta)
          lng: 106.8456
        },
        createdAt: new Date(),
        registrationMethod: "google"
      };

      console.log('Saving Google driver data to drivers collection:', driverData);
      await setDoc(doc(db, "drivers", user.uid), driverData);

      toast({
        title: "Akun driver berhasil dibuat",
        description: "Selamat datang di Habisin, Driver!",
      });

      navigate("/driver-dashboard");
    } catch (error: any) {
      let errorMessage = "Pendaftaran dengan Google gagal";
      
      if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = "Email sudah terdaftar dengan metode lain";
      }
      
      toast({
        title: "Pendaftaran Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#07595A] to-black flex flex-col">
      {/* Header */}
      <div className="bg-[#07595A] rounded-b-3xl h-24 flex items-center justify-center relative mb-8">
        <Link to="/login-driver" className="absolute left-6 top-1/2 -translate-y-1/2">
          <ArrowLeft className="h-6 w-6 text-white" />
        </Link>
        <h1 className="text-white text-2xl font-bold">Daftar Driver</h1>
      </div>

      {/* Register container */}
      <div className="flex-1 flex items-start justify-center px-6 pb-6">
        <div className="max-w-md w-full">
          <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl shadow-lg p-6 border border-gray-700">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">Nama Lengkap</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Masukkan nama lengkap Anda"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    disabled={isLoading || isGoogleLoading}
                  />
                </div>
              </div>

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

              <div className="space-y-2">
                <Label htmlFor="kendaraan" className="text-white">Jenis Kendaraan</Label>
                <div className="relative">
                  <Truck className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="kendaraan"
                    type="text"
                    placeholder="Contoh: Honda Vario, Toyota Avanza"
                    value={kendaraan}
                    onChange={(e) => setKendaraan(e.target.value)}
                    className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    disabled={isLoading || isGoogleLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="platNomor" className="text-white">Plat Nomor</Label>
                <div className="relative">
                  <Truck className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="plat Nomor"
                    type="text"
                    placeholder="Contoh: D 1234 ZUL"
                    value={platNomor}
                    onChange={(e) => setPlatNomor(e.target.value)}
                    className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    disabled={isLoading || isGoogleLoading}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="w-4 h-4"
                  style={{ accentColor: '#07595A' }}
                  disabled={isLoading || isGoogleLoading}
                />
                <Label htmlFor="terms" className="text-sm cursor-pointer text-gray-300">
                  Saya menerima semua syarat & ketentuan
                </Label>
              </div>

              <AnimatedButton
                type="submit"
                className="w-full"
                disabled={isLoading || isGoogleLoading}
                icon={isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
              >
                {isLoading ? "Mendaftar..." : "Daftar"}
              </AnimatedButton>
            </form>

            {/* Google Signup Button */}
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
                onClick={handleGoogleSignup}
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
                {isGoogleLoading ? "Daftar dengan Google..." : "Daftar dengan Google"}
              </AnimatedButton>
            </div>

            <div className="mt-6 text-center text-sm text-gray-400">
              Sudah punya akun?{" "}
              <Link
                to="/login-driver"
                className="text-[#07595A] font-medium hover:underline"
              >
                Masuk
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterDriver;
