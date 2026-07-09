import React, { useEffect } from 'react';
import { X, Trash2, ShoppingBag, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);

const CartSidebar: React.FC = () => {
  const { isCartOpen, setIsCartOpen, items, updateQuantity, removeFromCart, subtotal, totalItems } = useCart();

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsCartOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsCartOpen]);

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />
      
      {/* Sidebar Drawer */}
      <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#F3D6DC]/50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#E75480]" />
            <h2 className="text-xl font-bold text-[#2B2B2B]">Your Cart</h2>
            <span className="bg-[#FFF5F7] text-[#E75480] text-xs font-bold px-2 py-0.5 rounded-full ml-1">
              {totalItems}
            </span>
          </div>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="p-2 bg-gray-50 rounded-full text-gray-500 hover:text-[#E75480] hover:bg-[#FFF5F7] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-80">
              <div className="w-24 h-24 bg-[#FFF5F7] rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-10 h-10 text-[#F7A8B8]" />
              </div>
              <h3 className="text-lg font-bold text-[#2B2B2B] mb-2">Your cart is empty</h3>
              <p className="text-[#777777] text-sm max-w-[250px]">
                Looks like you haven't added anything to your cart yet.
              </p>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="mt-6 px-6 py-2 bg-gray-100 text-[#2B2B2B] font-medium rounded-full hover:bg-gray-200 transition-colors text-sm"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {items.map((item) => {
                const primaryImage = item.product.images?.find(img => img.isPrimary)?.url || item.product.image || '';
                const price = item.selectedVariant?.sellingPrice || item.product.sellingPrice || item.product.price || 0;
                
                return (
                  <div key={`${item.product.id}-${item.selectedVariant?.id || 'base'}`} className="flex gap-4 p-3 bg-white border border-[#F3D6DC]/50 rounded-2xl shadow-sm">
                    {/* Item Image */}
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                      <img 
                        src={primaryImage} 
                        alt={item.product.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Item Details */}
                    <div className="flex flex-col flex-1 py-1">
                      <h4 className="text-sm font-semibold text-[#2B2B2B] line-clamp-1 mb-1">
                        {item.product.name}
                        {item.selectedVariant && (
                          <span className="text-gray-500 font-normal ml-1">
                            - {item.selectedVariant.name || `${item.selectedVariant.quantity} ${item.selectedVariant.unit}`}
                          </span>
                        )}
                      </h4>
                      <div className="text-sm font-bold text-[#E75480] mb-3">
                        {formatPrice(price)}
                      </div>
                      
                      {/* Controls Area */}
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-3 bg-gray-50 rounded-full px-2 py-1 border border-gray-100">
                          <button 
                            onClick={() => updateQuantity(item.product.id, item.selectedVariant?.id, item.quantity - 1)}
                            className="p-1 hover:text-[#E75480] text-gray-500 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-semibold w-4 text-center">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => updateQuantity(item.product.id, item.selectedVariant?.id, item.quantity + 1)}
                            className="p-1 hover:text-[#E75480] text-gray-500 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        
                        <button 
                          onClick={() => removeFromCart(item.product.id, item.selectedVariant?.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer / Subtotal */}
        {items.length > 0 && (
          <div className="p-6 bg-white border-t border-[#F3D6DC]/50 shadow-[0_-4px_15px_-5px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-500 font-medium">Subtotal ({totalItems} items)</span>
              <span className="text-xl font-bold text-[#2B2B2B]">{formatPrice(subtotal)}</span>
            </div>
            <button className="w-full bg-gradient-to-r from-[#F48CA8] to-[#E75480] text-white font-medium py-4 px-8 rounded-xl shadow-md shadow-[#F48CA8]/30 hover:shadow-lg hover:-translate-y-0.5 transition-all text-lg">
              Proceed to Checkout
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default CartSidebar;
