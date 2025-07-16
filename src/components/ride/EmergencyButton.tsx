
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const EmergencyButton = () => {
  const handleEmergencyClick = () => {
    toast({
      title: "Darurat",
      description: "Fitur darurat telah diaktifkan. Tim keamanan akan segera menghubungi Anda.",
      variant: "destructive",
    });
  };

  return (
    <Button
      onClick={handleEmergencyClick}
      className="absolute top-4 right-4 z-10 bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg"
      size="sm"
    >
      <AlertTriangle className="h-5 w-5" />
    </Button>
  );
};

export default EmergencyButton;
