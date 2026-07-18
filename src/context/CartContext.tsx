import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Product, ProductVariant } from '../data/products';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: ProductVariant;
}

interface CartContextType {
  items: CartItem[];
  isCartOpen: boolean;
  totalItems: number;
  subtotal: number;
  addToCart: (product: Product, variant?: ProductVariant, quantity?: number) => void;
  removeFromCart: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, variantId: string | undefined, quantity: number) => void;
  clearCart: () => void;
  setIsCartOpen: (isOpen: boolean) => void;
  toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('shopping_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('shopping_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product, variant?: ProductVariant, quantity: number = 1) => {
    setItems(prev => {
      const existing = prev.find(item => 
        item.product.id === product.id && item.selectedVariant?.id === variant?.id
      );
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id && item.selectedVariant?.id === variant?.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity, selectedVariant: variant }];
    });
    
    // Show toast instead of opening the cart
    const variantText = variant ? ` (${variant.quantity} ${variant.unit})` : '';
    setToastMessage(`✓ ${quantity}x ${product.name}${variantText} added to cart successfully.`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const removeFromCart = (productId: string, variantId?: string) => {
    setItems(prev => prev.filter(item => 
      !(item.product.id === productId && item.selectedVariant?.id === variantId)
    ));
  };

  const updateQuantity = (productId: string, variantId: string | undefined, quantity: number) => {
    if (quantity < 1) return;
    setItems(prev => 
      prev.map(item => 
        (item.product.id === productId && item.selectedVariant?.id === variantId)
          ? { ...item, quantity } 
          : item
      )
    );
  };

  const clearCart = () => setItems([]);

  const toggleCart = () => setIsCartOpen(prev => !prev);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => {
    const price = item.selectedVariant?.sellingPrice || item.product.sellingPrice || item.product.price || 0;
    return sum + (price * item.quantity);
  }, 0);

  return (
    <CartContext.Provider value={{
      items,
      isCartOpen,
      totalItems,
      subtotal,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      setIsCartOpen,
      toggleCart
    }}>
      {children}

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] bg-[#2B2B2B] text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <span className="font-medium text-sm">{toastMessage}</span>
        </div>
      )}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
