
import { Link } from "react-router-dom";
import { User, Truck, Store } from "lucide-react";
import { IllustratedLoginButton } from "@/components/ui/illustrated-login-button";

const Auth = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#07595A] to-black">
      {/* Header */}
      <div className="bg-[#095155] px-6 py-6 flex justify-center items-center rounded-b-3xl">
        <h1 className="text-white text-3xl font-bold">habisin</h1>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="text-center mb-8 mt-8">
          <h2 className="text-2xl font-bold mb-2 text-white">Selamat Datang Kembali!</h2>
          <p className="text-gray-300 mb-6">Masuk ke akun Anda</p>
        </div>

        {/* Role Selection Buttons */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          <Link to="/login-user">
            <IllustratedLoginButton variant="user">
              <div className="flex items-center space-x-3">
                <User className="w-6 h-6" />
                <div className="text-left">
                  <div className="font-semibold">Masuk Sebagai User</div>
                  <div className="text-sm opacity-80">Pesan makanan dan transportasi</div>
                </div>
              </div>
            </IllustratedLoginButton>
          </Link>
          
          <Link to="/login-driver">
            <IllustratedLoginButton variant="driver">
              <div className="flex items-center space-x-3">
                <Truck className="w-6 h-6" />
                <div className="text-left">
                  <div className="font-semibold">Masuk Sebagai Driver</div>
                  <div className="text-sm opacity-80">Antar penumpang dan makanan</div>
                </div>
              </div>
            </IllustratedLoginButton>
          </Link>

          <Link to="/login-seller">
            <IllustratedLoginButton variant="user">
              <div className="flex items-center space-x-3">
                <Store className="w-6 h-6" />
                <div className="text-left">
                  <div className="font-semibold">Masuk Sebagai Seller</div>
                  <div className="text-sm opacity-80">Jual makanan dan produk</div>
                </div>
              </div>
            </IllustratedLoginButton>
          </Link>
        </div>

        {/* Info text */}
        <div className="text-center text-gray-400 text-sm">
          <p>Belum punya akun?</p>
          <Link to="/register" className="text-[#07595A] font-medium">
            Daftar sekarang
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Auth;
