import React, { useState } from 'react';
import ProductCard from './ProductCard';
import ProductModal from './ProductModal';
import type { Product } from '../data/products';

interface ProductGridProps {
  products: Product[];
}

const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="w-full px-3 sm:px-6 py-4 sm:py-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
        {products.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onClick={() => handleProductClick(product)}
          />
        ))}
      </div>
      
      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal 
          key={selectedProduct.id}
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default ProductGrid;
