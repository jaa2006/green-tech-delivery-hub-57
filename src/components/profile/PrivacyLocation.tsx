
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Trash2, Home, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import TrackingEnabledPopup from "@/components/ui/TrackingEnabledPopup";

export const PrivacyLocation = () => {
  const [locationAccess, setLocationAccess] = useState(true);
  const [realtimeTracking, setRealtimeTracking] = useState(false);
  const [favoriteLocation, setFavoriteLocation] = useState("");
  const [showTrackingPopup, setShowTrackingPopup] = useState(false);
  const { toast } = useToast();

  const handleToggleLocation = (checked: boolean) => {
    setLocationAccess(checked);
    toast({
      title: checked ? "Akses Lokasi Diaktifkan" : "Akses Lokasi Dinonaktifkan",
      description: "Pengaturan lokasi GPS telah diperbarui.",
    });
  };

  const handleToggleRealtime = (checked: boolean) => {
    setRealtimeTracking(checked);
    if (checked) {
      setShowTrackingPopup(true);
    }
    toast({
      title: checked ? "Pelacakan Real-time Aktif" : "Pelacakan Real-time Nonaktif",
      description: "Pengaturan pelacakan lokasi real-time telah diperbarui.",
    });
  };

  const handleDeleteLocationHistory = () => {
    toast({
      title: "Riwayat Lokasi Dihapus",
      description: "Semua riwayat lokasi Anda telah dihapus.",
    });
  };

  return (
    <>
      <TrackingEnabledPopup 
        isOpen={showTrackingPopup}
        onClose={() => setShowTrackingPopup(false)}
      />
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 mb-3">
        <h2 className="text-lg font-semibold mb-3">Privasi & Lokasi</h2>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">Akses Lokasi GPS</span>
            </div>
            <Switch checked={locationAccess} onCheckedChange={handleToggleLocation} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm">Pelacakan Real-time</span>
              <p className="text-xs text-gray-500">Bagikan lokasi secara real-time dengan driver</p>
            </div>
            <Switch checked={realtimeTracking} onCheckedChange={handleToggleRealtime} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Lokasi Favorit</label>
            <Select value={favoriteLocation} onValueChange={setFavoriteLocation}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Pilih lokasi favorit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="home">
                  <div className="flex items-center gap-2">
                    <Home className="h-3 w-3" />
                    <span className="text-sm">Rumah</span>
                  </div>
                </SelectItem>
                <SelectItem value="office">
                  <div className="flex items-center gap-2">
                    <Building className="h-3 w-3" />
                    <span className="text-sm">Kantor</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            variant="outline" 
            className="w-full flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50 text-sm py-2"
            onClick={handleDeleteLocationHistory}
          >
            <Trash2 className="h-3 w-3" />
            Hapus Riwayat Lokasi
          </Button>
        </div>
      </div>
    </>
  );
};
