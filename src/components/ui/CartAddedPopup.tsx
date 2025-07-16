
import { useState, useEffect } from "react";
import { Check, ShoppingCart } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface CartAddedPopupProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
}

const CartAddedPopup = ({ isOpen, onClose, productName }: CartAddedPopupProps) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000); // Auto close after 2 seconds
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xs mx-auto p-4 bg-green-50 border border-green-200 shadow-lg">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-900">Produk Ditambahkan!</h3>
            {productName && (
              <p className="text-sm text-green-700 mt-1">{productName} telah ditambahkan ke keranjang</p>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-green-600">
            <ShoppingCart className="h-4 w-4" />
            <span>Lihat keranjang untuk checkout</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CartAddedPopup;
