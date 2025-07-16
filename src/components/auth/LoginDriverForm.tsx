
import { useState } from "react";
import { User, LogIn, ArrowRight, Loader2 } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AnimatedButton } from "@/components/ui/animated-button";
import { useNotification } from "@/contexts/NotificationContext";
import { useNavigate } from "react-router-dom";

const LoginDriverForm = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

      // Check driver role in drivers collection
      const driverDoc = await getDoc(doc(db, "drivers", user.uid));
      const driverData = driverDoc.data();

      if (!driverData || driverData.role !== "driver") {
        showError("Akun ini bukan akun driver");
        setIsLoading(false);
        return;
      }

      showSuccess("Login berhasil! Selamat datang kembali, Driver!");
      
      // Navigate immediately to driver dashboard
      navigate("/driver-dashboard", { replace: true });
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

  return (
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
            disabled={isLoading}
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
            disabled={isLoading}
          />
        </div>
      </div>

      <AnimatedButton
        type="submit"
        className="w-full"
        disabled={isLoading}
        icon={isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
      >
        {isLoading ? "Masuk..." : "Masuk"}
      </AnimatedButton>
    </form>
  );
};

export default LoginDriverForm;
