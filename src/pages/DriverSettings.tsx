
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, Shield, HelpCircle, LogOut, ChevronRight, Moon, Sun } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import { NavLink } from "react-router-dom";
import { User2, Settings, Home } from "lucide-react";

const DriverSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoAcceptOrders, setAutoAcceptOrders] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logout berhasil",
        description: "Sampai jumpa lagi!",
      });
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const settingsItems = [
    {
      title: "Notifikasi",
      description: "Kelola notifikasi order dan pesan",
      icon: <Bell className="h-5 w-5" />,
      action: (
        <Switch
          checked={notifications}
          onCheckedChange={setNotifications}
        />
      )
    },
    {
      title: "Berbagi Lokasi",
      description: "Izinkan aplikasi mengakses lokasi Anda",
      icon: <Shield className="h-5 w-5" />,
      action: (
        <Switch
          checked={locationSharing}
          onCheckedChange={setLocationSharing}
        />
      )
    },
    {
      title: "Mode Gelap",
      description: "Gunakan tema gelap untuk aplikasi",
      icon: darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />,
      action: (
        <Switch
          checked={darkMode}
          onCheckedChange={setDarkMode}
        />
      )
    },
    {
      title: "Terima Order Otomatis",
      description: "Terima order secara otomatis ketika aktif",
      icon: <Shield className="h-5 w-5" />,
      action: (
        <Switch
          checked={autoAcceptOrders}
          onCheckedChange={setAutoAcceptOrders}
        />
      )
    }
  ];

  const menuItems = [
    {
      title: "Bantuan & Dukungan",
      description: "FAQ, kontak support, panduan",
      icon: <HelpCircle className="h-5 w-5" />,
      onClick: () => {
        toast({
          title: "Bantuan & Dukungan",
          description: "Fitur bantuan akan segera tersedia",
        });
      }
    },
    {
      title: "Syarat & Ketentuan",
      description: "Baca syarat dan ketentuan aplikasi",
      icon: <Shield className="h-5 w-5" />,
      onClick: () => {
        toast({
          title: "Syarat & Ketentuan",
          description: "Halaman syarat & ketentuan akan segera tersedia",
        });
      }
    },
    {
      title: "Tentang Aplikasi",
      description: "Versi aplikasi dan informasi lainnya",
      icon: <HelpCircle className="h-5 w-5" />,
      onClick: () => {
        toast({
          title: "Tentang Aplikasi",
          description: "Habisin Driver v1.0.0",
        });
      }
    }
  ];

  const navItems = [
    { path: "/driver-dashboard", label: "Home", icon: <Home className="h-5 w-5" /> },
    { path: "/driver-profile", label: "Profile", icon: <User2 className="h-5 w-5" /> },
    { path: "/driver-settings", label: "Settings", icon: <Settings className="h-5 w-5" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#07595A] to-black pb-20">
      {/* Header */}
      <div className="bg-[#07595A] px-4 py-4 flex items-center rounded-b-3xl">
        <button onClick={() => navigate("/driver-dashboard")} className="mr-3">
          <ArrowLeft className="text-white w-6 h-6" />
        </button>
        <div className="flex-1">
          <h1 className="text-white text-xl font-semibold">Pengaturan</h1>
        </div>
      </div>

      {/* Settings Content */}
      <div className="p-4 space-y-4">
        {/* App Settings */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
          <h3 className="text-white text-lg font-semibold mb-4">Pengaturan Aplikasi</h3>
          <div className="space-y-4">
            {settingsItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="text-white/70">{item.icon}</div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{item.title}</p>
                    <p className="text-white/60 text-sm">{item.description}</p>
                  </div>
                </div>
                {item.action}
              </div>
            ))}
          </div>
        </div>

        {/* General Menu */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
          <h3 className="text-white text-lg font-semibold mb-4">Umum</h3>
          <div className="space-y-1">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={item.onClick}
                className="w-full flex items-center justify-between py-3 hover:bg-white/10 rounded-lg px-3 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-white/70">{item.icon}</div>
                  <div className="text-left">
                    <p className="text-white font-medium">{item.title}</p>
                    <p className="text-white/60 text-sm">{item.description}</p>
                  </div>
                </div>
                <ChevronRight className="text-white/60 h-5 w-5" />
              </button>
            ))}
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
          <h3 className="text-white text-lg font-semibold mb-4">Akun</h3>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between py-3 hover:bg-red-500/20 rounded-lg px-3 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <LogOut className="text-red-400 h-5 w-5" />
              <div className="text-left">
                <p className="text-red-400 font-medium">Keluar</p>
                <p className="text-white/60 text-sm">Logout dari aplikasi</p>
              </div>
            </div>
            <ChevronRight className="text-red-400 h-5 w-5" />
          </button>
        </div>

        {/* App Info */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
          <div className="text-center">
            <h3 className="text-white text-lg font-semibold mb-2">Habisin Driver</h3>
            <p className="text-white/60 text-sm">Versi 1.0.0</p>
            <p className="text-white/60 text-xs mt-2">© 2024 Habisin. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 px-6 z-50 rounded-t-3xl">
        <div className="max-w-md mx-auto flex items-center justify-between">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `flex flex-col items-center pt-1 ${isActive ? 'text-[#07595A] font-medium' : 'text-gray-400'}`
              }
            >
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default DriverSettings;
