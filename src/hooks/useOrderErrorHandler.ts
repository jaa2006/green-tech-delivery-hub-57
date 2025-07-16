
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const useOrderErrorHandler = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleOrderError = (error: any, context: string) => {
    console.error(`Order Error in ${context}:`, error);
    
    // Handle specific Firebase errors
    if (error?.code) {
      switch (error.code) {
        case 'permission-denied':
          toast({
            title: "Akses Ditolak",
            description: "Anda tidak memiliki izin untuk mengakses resource ini.",
            variant: "destructive",
          });
          // Redirect to appropriate dashboard
          navigate('/driver-dashboard');
          break;
          
        case 'not-found':
          toast({
            title: "Data Tidak Ditemukan",
            description: "Order yang diminta tidak ditemukan atau sudah dihapus.",
            variant: "destructive",
          });
          navigate('/driver-dashboard');
          break;
          
        case 'failed-precondition':
          toast({
            title: "Kondisi Tidak Terpenuhi",
            description: "Order tidak dalam status yang sesuai untuk operasi ini.",
            variant: "destructive",
          });
          break;
          
        case 'unavailable':
          toast({
            title: "Layanan Tidak Tersedia",
            description: "Koneksi ke server bermasalah. Silakan coba lagi.",
            variant: "destructive",
          });
          break;
          
        case 'unauthenticated':
          toast({
            title: "Sesi Berakhir",
            description: "Silakan login kembali.",
            variant: "destructive",
          });
          navigate('/auth');
          break;
          
        default:
          toast({
            title: "Terjadi Kesalahan",
            description: `Error: ${error.code}. Silakan coba lagi atau hubungi support.`,
            variant: "destructive",
          });
      }
    } else {
      // Handle generic errors
      toast({
        title: "Terjadi Kesalahan",
        description: "Terjadi kesalahan tidak terduga. Silakan coba lagi.",
        variant: "destructive",
      });
    }
  };

  const handleNavigationError = (orderId?: string) => {
    if (!orderId) {
      toast({
        title: "Error Navigasi",
        description: "Order ID tidak valid. Kembali ke dashboard.",
        variant: "destructive",
      });
      navigate('/driver-dashboard');
      return false;
    }
    return true;
  };

  return {
    handleOrderError,
    handleNavigationError
  };
};
