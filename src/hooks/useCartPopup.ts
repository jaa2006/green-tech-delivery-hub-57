
import { useState } from 'react';

interface CartPopupState {
  isOpen: boolean;
  productName?: string;
}

export const useCartPopup = () => {
  const [popupState, setPopupState] = useState<CartPopupState>({ isOpen: false });

  const showCartPopup = (productName?: string) => {
    setPopupState({ isOpen: true, productName });
  };

  const hideCartPopup = () => {
    setPopupState({ isOpen: false });
  };

  return {
    ...popupState,
    showCartPopup,
    hideCartPopup,
  };
};
