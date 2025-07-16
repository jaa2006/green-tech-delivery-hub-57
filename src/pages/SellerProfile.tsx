
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useToast } from "@/components/ui/use-toast";
import { Store, MapPin, Phone, Mail, Camera, LogOut, Save } from "lucide-react";
import SellerLayout from "../components/layout/SellerLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface SellerProfile {
  name: string;
  email: string;
  storeName: string;
  storeDescription: string;
  phone: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
}

const SellerProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<SellerProfile>({
    name: "",
    email: "",
    storeName: "",
    storeDescription: "",
    phone: "",
    address: "",
    location: { lat: -6.2088, lng: 106.8456 }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Try to get seller data from sellers collection first
          const sellerDoc = await getDoc(doc(db, "sellers", user.uid));
          if (sellerDoc.exists()) {
            const sellerData = sellerDoc.data();
            setProfile({
              name: sellerData.name || "",
              email: sellerData.email || user.email || "",
              storeName: sellerData.storeName || "",
              storeDescription: sellerData.storeDescription || "",
              phone: sellerData.phone || "",
              address: sellerData.address || "",
              location: sellerData.location || { lat: -6.2088, lng: 106.8456 }
            });
          } else {
            // Fallback to users collection
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists() && userDoc.data().role === "seller") {
              const userData = userDoc.data();
              setProfile({
                name: userData.name || "",
                email: userData.email || user.email || "",
                storeName: userData.storeName || "",
                storeDescription: userData.storeDescription || "",
                phone: userData.phone || "",
                address: userData.address || "",
                location: userData.location || { lat: -6.2088, lng: 106.8456 }
              });
            } else {
              navigate("/auth");
            }
          }
        } catch (error) {
          console.error("Error fetching seller profile:", error);
        }
      } else {
        navigate("/auth");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleInputChange = (field: keyof SellerProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setSaving(true);
    try {
      // Update sellers collection
      await updateDoc(doc(db, "sellers", user.uid), {
        name: profile.name,
        storeName: profile.storeName,
        storeDescription: profile.storeDescription,
        phone: profile.phone,
        address: profile.address,
        location: profile.location,
        updatedAt: new Date()
      });

      // Also update users collection for compatibility
      await updateDoc(doc(db, "users", user.uid), {
        name: profile.name,
        storeName: profile.storeName,
        storeDescription: profile.storeDescription,
        phone: profile.phone,
        address: profile.address,
        updatedAt: new Date()
      });

      toast({
        title: "Profil berhasil diperbarui",
        description: "Informasi toko Anda telah disimpan",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Gagal memperbarui profil",
        variant: "destructive",
      });
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logout berhasil",
        description: "Sampai jumpa lagi!",
      });
      navigate("/auth");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (loading) {
    return (
      <SellerLayout>
        <div className="min-h-screen bg-gradient-to-b from-[#07595A] to-black flex items-center justify-center">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout>
      <div className="min-h-screen bg-gradient-to-b from-[#07595A] to-black">
        {/* Header */}
        <div className="bg-[#07595A] px-4 py-4 flex justify-between items-center rounded-b-3xl">
          <div>
            <h1 className="text-white text-2xl font-semibold">Profil Toko</h1>
            <p className="text-white/80 text-sm">Kelola informasi toko Anda</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="bg-white/20 border-white/30 text-white hover:bg-white/30"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <div className="p-4 space-y-6">
          {/* Profile Picture Section */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-[#07595A] rounded-full flex items-center justify-center mx-auto mb-4">
                <Store className="w-12 h-12 text-white" />
              </div>
              <button className="absolute bottom-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <Camera className="w-4 h-4 text-[#07595A]" />
              </button>
            </div>
            <h2 className="text-white text-xl font-semibold">{profile.storeName || "Nama Toko"}</h2>
            <p className="text-white/70 text-sm">{profile.name}</p>
          </div>

          {/* Store Information */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
              <Store className="w-5 h-5" />
              Informasi Toko
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-white/70 text-sm block mb-2">Nama Toko</label>
                <Input
                  type="text"
                  value={profile.storeName}
                  onChange={(e) => handleInputChange('storeName', e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder-white/50"
                  placeholder="Masukkan nama toko"
                />
              </div>
              <div>
                <label className="text-white/70 text-sm block mb-2">Deskripsi Toko</label>
                <Textarea
                  value={profile.storeDescription}
                  onChange={(e) => handleInputChange('storeDescription', e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder-white/50"
                  placeholder="Ceritakan tentang toko Anda..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Informasi Pribadi
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-white/70 text-sm block mb-2">Nama Pemilik</label>
                <Input
                  type="text"
                  value={profile.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder-white/50"
                  placeholder="Nama lengkap"
                />
              </div>
              <div>
                <label className="text-white/70 text-sm block mb-2">Email</label>
                <Input
                  type="email"
                  value={profile.email}
                  className="bg-white/20 border-white/30 text-white/50"
                  disabled
                />
              </div>
              <div>
                <label className="text-white/70 text-sm block mb-2">Nomor Telepon</label>
                <Input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder-white/50"
                  placeholder="08xxxxxxxxxx"
                />
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Lokasi Toko
            </h3>
            <div>
              <label className="text-white/70 text-sm block mb-2">Alamat</label>
              <Textarea
                value={profile.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="bg-white/20 border-white/30 text-white placeholder-white/50"
                placeholder="Alamat lengkap toko Anda..."
                rows={3}
              />
            </div>
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSaveProfile}
            disabled={saving}
            className="w-full bg-[#07595A] hover:bg-[#065658] text-white py-3"
          >
            <Save className="w-5 h-5 mr-2" />
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      </div>
    </SellerLayout>
  );
};

export default SellerProfile;
