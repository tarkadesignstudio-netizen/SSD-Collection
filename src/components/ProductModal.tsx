import React, { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product } from '../data/products';

interface ProductModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);

const dummyImages = [
  "https://via.placeholder.com/500x500?text=Image+1",
  "https://via.placeholder.com/500x500?text=Image+2",
  "https://via.placeholder.com/500x500?text=Image+3"
];

const ProductModal: React.FC<ProductModalProps> = ({ product, isOpen, onClose }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const images = React.useMemo(() => {
    if (product.images?.length) {
      const copy = [...product.images];
      copy.sort((a, b) => (a.isPrimary === b.isPrimary ? 0 : a.isPrimary ? -1 : 1));
      return copy.map(img => img.url);
    }
    return product.image ? [product.image] : dummyImages;
  }, [product]);

  // Prevent background scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      setTimeout(() => {
        document.body.style.overflow = 'unset';
      }, 300); // Wait for animation
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-[95%] max-w-6xl h-[80vh] overflow-hidden flex flex-col md:flex-row z-10 animate-in fade-in zoom-in duration-300">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-white/80 backdrop-blur-md rounded-full text-[#777777] hover:text-[#E75480] hover:bg-[#FFF5F7] transition-all shadow-sm focus:outline-none"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Images */}
        <div className="w-full md:w-1/2 flex flex-col p-6 gap-4 bg-[#FAFAFA]">
          {/* Main Large Image */}
          <div className="relative flex-1 rounded-2xl overflow-hidden bg-white shadow-sm min-h-[300px] md:min-h-[450px]">
             <img 
               src={images[activeImageIndex]} 
               alt={product.name} 
               className="w-full h-full object-contain animate-in fade-in duration-300"
             />

             {/* Navigation Arrows */}
             {images.length > 1 && (
               <>
                 <button 
                   onClick={() => setActiveImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)}
                   className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-md rounded-full text-[#777777] hover:text-[#E75480] hover:bg-[#FFF5F7] shadow-sm transition-all focus:outline-none"
                 >
                   <ChevronLeft className="w-6 h-6" />
                 </button>
                 <button 
                   onClick={() => setActiveImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)}
                   className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-md rounded-full text-[#777777] hover:text-[#E75480] hover:bg-[#FFF5F7] shadow-sm transition-all focus:outline-none"
                 >
                   <ChevronRight className="w-6 h-6" />
                 </button>
               </>
             )}
          </div>

          {/* Thumbnails (Horizontal) */}
          {images.length > 1 && (
            <div className="flex flex-row gap-3 overflow-x-auto scrollbar-hide py-2 flex-shrink-0">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 transition-all duration-200 focus:outline-none ${
                    activeImageIndex === idx 
                      ? 'border-2 border-[#E75480] scale-105 shadow-sm p-1' 
                      : 'border-2 border-transparent opacity-60 hover:opacity-100 hover:scale-105 p-1'
                  }`}
                >
                  <div className="w-full h-full rounded-lg overflow-hidden">
                    <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Product Details */}
        <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center overflow-y-auto bg-white">
          <span className="text-sm font-semibold uppercase tracking-widest text-[#F48CA8] mb-3">
            {product.category}
          </span>
          <h2 className="text-3xl font-bold text-[#2B2B2B] mb-4 leading-tight">
            {product.name}
          </h2>
          <div className="text-2xl font-semibold text-[#E75480] mb-6">
            {formatPrice(product.price)}
          </div>
          
          <div className="w-12 h-1 bg-[#F3D6DC] rounded-full mb-10"></div>

          {/* Action buttons */}
          <button className="w-full bg-gradient-to-r from-[#F48CA8] to-[#E75480] text-white font-medium py-4 px-8 rounded-xl shadow-md shadow-[#F48CA8]/30 hover:shadow-lg hover:-translate-y-0.5 hover:scale-[1.02] transition-all duration-300 text-lg flex items-center justify-center gap-2 focus:outline-none">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
