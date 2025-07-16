
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Edit, Save, X } from "lucide-react";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { NavLink } from "react-router-dom";
import { User2, Settings, Home } from "lucide-react";

const DriverProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [driverData, setDriverData] = useState({
    name: "",
    email: "",
    phone: "",
    photoURL: "",
    vehicleType: "",
    vehicleNumber: "",
    licenseNumber: ""
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(driverData);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          const userData = userDoc.data();
          if (userData && userData.role === "driver") {
            const data = {
              name: userData.name || "",
              email: user.email || "",
              phone: userData.phone || "",
              photoURL: userData.photoURL || "",
              vehicleType: userData.vehicleType || "",
              vehicleNumber: userData.vehicleNumber || "",
              licenseNumber: userData.licenseNumber || ""
            };
            setDriverData(data);
            setEditData(data);
          } else {
            navigate("/");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setEditData(prev => ({
            ...prev,
            photoURL: e.target.result as string
          }));
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      await updateDoc(doc(db, "users", user.uid), {
        name: editData.name,
        phone: editData.phone,
        photoURL: editData.photoURL,
        vehicleType: editData.vehicleType,
        vehicleNumber: editData.vehicleNumber,
        licenseNumber: editData.licenseNumber
      });

      if (editData.photoURL !== driverData.photoURL) {
        await updateProfile(user, {
          photoURL: editData.photoURL
        });
      }

      setDriverData(editData);
      setIsEditing(false);
      
      toast({
        title: "Profil berhasil diperbarui",
        description: "Data profil Anda telah disimpan",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Gagal memperbarui profil",
        variant: "destructive",
      });
    }
  };

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
          <h1 className="text-white text-xl font-semibold">Profil Driver</h1>
        </div>
        <button
          onClick={() => {
            if (isEditing) {
              setEditData(driverData);
              setIsEditing(false);
            } else {
              setIsEditing(true);
            }
          }}
          className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors"
        >
          {isEditing ? <X className="text-white w-5 h-5" /> : <Edit className="text-white w-5 h-5" />}
        </button>
      </div>

      {/* Profile Content */}
      <div className="p-4 space-y-4">
        {/* Profile Photo Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
          <div className="flex flex-col items-center">
            <div className="relative">
              <Avatar className="h-24 w-24">
                {editData.photoURL ? (
                  <AvatarImage src={editData.photoURL} alt={editData.name} />
                ) : (
                  <AvatarFallback className="bg-[#fdbc40] text-[#07595A] text-2xl">
                    {editData.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              {isEditing && (
                <div className="absolute -bottom-2 -right-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    disabled={uploading}
                  />
                  <div className="bg-[#fdbc40] p-2 rounded-full">
                    <Camera className="h-4 w-4 text-[#07595A]" />
                  </div>
                </div>
              )}
            </div>
            <h2 className="text-white text-xl font-semibold mt-4">{driverData.name}</h2>
            <p className="text-white/70 text-sm">{driverData.email}</p>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
          <h3 className="text-white text-lg font-semibold mb-4">Informasi Pribadi</h3>
          <div className="space-y-4">
            <div>
              <Label className="text-white/80 text-sm">Nama Lengkap</Label>
              {isEditing ? (
                <Input
                  value={editData.name}
                  onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 bg-white/20 text-white border-white/30"
                />
              ) : (
                <p className="text-white mt-1">{driverData.name}</p>
              )}
            </div>
            <div>
              <Label className="text-white/80 text-sm">Nomor Telepon</Label>
              {isEditing ? (
                <Input
                  value={editData.phone}
                  onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                  className="mt-1 bg-white/20 text-white border-white/30"
                />
              ) : (
                <p className="text-white mt-1">{driverData.phone || "Belum diisi"}</p>
              )}
            </div>
          </div>
        </div>

        {/* Vehicle Information */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
          <h3 className="text-white text-lg font-semibold mb-4">Informasi Kendaraan</h3>
          <div className="space-y-4">
            <div>
              <Label className="text-white/80 text-sm">Jenis Kendaraan</Label>
              {isEditing ? (
                <Input
                  value={editData.vehicleType}
                  onChange={(e) => setEditData(prev => ({ ...prev, vehicleType: e.target.value }))}
                  placeholder="Motor, Mobil, dll"
                  className="mt-1 bg-white/20 text-white border-white/30"
                />
              ) : (
                <p className="text-white mt-1">{driverData.vehicleType || "Belum diisi"}</p>
              )}
            </div>
            <div>
              <Label className="text-white/80 text-sm">Nomor Plat</Label>
              {isEditing ? (
                <Input
                  value={editData.vehicleNumber}
                  onChange={(e) => setEditData(prev => ({ ...prev, vehicleNumber: e.target.value }))}
                  placeholder="B 1234 ABC"
                  className="mt-1 bg-white/20 text-white border-white/30"
                />
              ) : (
                <p className="text-white mt-1">{driverData.vehicleNumber || "Belum diisi"}</p>
              )}
            </div>
            <div>
              <Label className="text-white/80 text-sm">Nomor SIM</Label>
              {isEditing ? (
                <Input
                  value={editData.licenseNumber}
                  onChange={(e) => setEditData(prev => ({ ...prev, licenseNumber: e.target.value }))}
                  placeholder="Nomor SIM"
                  className="mt-1 bg-white/20 text-white border-white/30"
                />
              ) : (
                <p className="text-white mt-1">{driverData.licenseNumber || "Belum diisi"}</p>
              )}
            </div>
          </div>
        </div>

        {/* Save Button */}
        {isEditing && (
          <Button
            onClick={handleSave}
            className="w-full bg-[#fdbc40] hover:bg-[#fdbc40]/90 text-[#07595A] font-semibold py-3"
            disabled={uploading}
          >
            <Save className="w-4 h-4 mr-2" />
            Simpan Perubahan
          </Button>
        )}
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

export default DriverProfile;
