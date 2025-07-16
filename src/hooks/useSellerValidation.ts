
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

export const useSellerValidation = () => {
  const [isValidating, setIsValidating] = useState(false);
  const { validateSellerAuth, getSellerData, currentUser } = useAuth();
  const { toast } = useToast();

  const validateSeller = useCallback(async (): Promise<boolean> => {
    if (!currentUser) {
      console.error("❌ No authenticated user");
      toast({
        title: "Error",
        description: "Anda harus login terlebih dahulu",
        variant: "destructive",
      });
      return false;
    }

    setIsValidating(true);
    
    try {
      console.log("🔍 Starting seller validation process...");
      
      // Validate seller authentication
      const isValidSeller = await validateSellerAuth();
      
      if (!isValidSeller) {
        console.error("❌ Seller validation failed");
        toast({
          title: "Error",
          description: "Akun Anda tidak terdaftar sebagai seller yang valid",
          variant: "destructive",
        });
        return false;
      }

      // Get seller data to ensure it exists
      const sellerData = await getSellerData();
      
      if (!sellerData) {
        console.error("❌ Seller data not found");
        toast({
          title: "Error",
          description: "Data seller tidak ditemukan. Silakan hubungi support.",
          variant: "destructive",
        });
        return false;
      }

      console.log("✅ Seller validation successful:", {
        uid: sellerData.uid,
        role: sellerData.role,
        storeName: sellerData.storeName
      });

      return true;
    } catch (error) {
      console.error("❌ Error during seller validation:", error);
      
      let errorMessage = "Terjadi kesalahan saat validasi seller";
      
      if (error instanceof Error) {
        if (error.message.includes('permission-denied')) {
          errorMessage = "Tidak memiliki izin sebagai seller. Pastikan akun Anda sudah diverifikasi.";
        } else if (error.message.includes('unauthenticated')) {
          errorMessage = "Sesi login telah berakhir. Silakan login kembali.";
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsValidating(false);
    }
  }, [currentUser, validateSellerAuth, getSellerData, toast]);

  return {
    validateSeller,
    isValidating
  };
};
