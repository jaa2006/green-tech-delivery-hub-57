
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Check, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export const ConnectedAccounts = () => {
  const [connectedAccounts, setConnectedAccounts] = useState({
    google: true,
    facebook: false,
    apple: false,
  });
  const { toast } = useToast();

  const handleConnectAccount = (provider: string) => {
    setConnectedAccounts(prev => ({
      ...prev,
      [provider]: !prev[provider as keyof typeof prev]
    }));
    
    const isConnected = !connectedAccounts[provider as keyof typeof connectedAccounts];
    toast({
      title: isConnected ? "Akun Terhubung" : "Akun Terputus",
      description: `Akun ${provider} telah ${isConnected ? 'terhubung' : 'terputus'}.`,
    });
  };

  const handleManageDevices = () => {
    toast({
      title: "Kelola Perangkat",
      description: "Fitur kelola perangkat terhubung akan segera tersedia.",
    });
  };

  const accountProviders = [
    { id: 'google', name: 'Google', color: 'bg-red-500' },
    { id: 'facebook', name: 'Facebook', color: 'bg-blue-500' },
    { id: 'apple', name: 'Apple', color: 'bg-gray-800' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 mb-3">
      <h2 className="text-lg font-semibold mb-3">Akun Terhubung</h2>
      
      <div className="space-y-3">
        {accountProviders.map((provider) => (
          <div key={provider.id} className="flex items-center justify-between p-2 border rounded-lg">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 ${provider.color} rounded-full flex items-center justify-center`}>
                {connectedAccounts[provider.id as keyof typeof connectedAccounts] ? (
                  <Check className="h-3 w-3 text-white" />
                ) : (
                  <X className="h-3 w-3 text-white" />
                )}
              </div>
              <span className="font-medium text-sm">{provider.name}</span>
            </div>
            <div className="flex items-center gap-2">
              {connectedAccounts[provider.id as keyof typeof connectedAccounts] ? (
                <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs px-2 py-1">
                  Terhubung
                </Badge>
              ) : (
                <Badge variant="outline" className="text-gray-500 text-xs px-2 py-1">
                  Tidak Terhubung
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                className="text-xs px-2 py-1 h-auto"
                onClick={() => handleConnectAccount(provider.id)}
              >
                {connectedAccounts[provider.id as keyof typeof connectedAccounts] ? 'Putuskan' : 'Hubungkan'}
              </Button>
            </div>
          </div>
        ))}
        
        <Button 
          variant="outline" 
          className="w-full flex items-center gap-2 text-sm py-2"
          onClick={handleManageDevices}
        >
          <Settings className="h-3 w-3" />
          Kelola Perangkat Terhubung
        </Button>
      </div>
    </div>
  );
};
