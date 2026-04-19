import React from 'react';
import type { Product } from '../data/products';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const primaryImage = product.images?.find(img => img.isPrimary)?.url || product.image || '';

  return (
    <div 
      className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-[#FFF5F7] hover:-translate-y-1 hover:shadow-md hover:shadow-[#F7A8B8]/20 transition-all duration-300 ease-in-out cursor-pointer flex flex-col h-full"
      onClick={onClick}
    >
      <div className="relative w-full aspect-square mb-4 overflow-hidden rounded-xl bg-neutral-100">
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          loading="lazy"
        />
      </div>
      <div className="flex flex-col flex-1">
        <span className="text-[10px] sm:text-xs uppercase tracking-wider text-[#777777] font-medium mb-1 truncate">
          {product.category}
        </span>
        <h3 className="text-xs sm:text-sm font-medium text-[#2B2B2B] mb-1 sm:mb-2 line-clamp-2 sm:truncate leading-snug">
          {product.name}
        </h3>
        <div className="mt-auto">
          <span className="text-xs sm:text-sm font-semibold text-[#E75480]">
            {formatPrice(product.price)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
