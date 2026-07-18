import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';
import ProductCard from './ProductCard';
import type { Product } from '../data/products';
import type { Category, Domain } from '../data/categories';

interface CuratedForYouProps {
  products: Product[];
  categories: Category[];
  domains: Domain[];
  onProductClick: (product: Product) => void;
}

const CuratedForYou: React.FC<CuratedForYouProps> = ({ products, categories, domains, onProductClick }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('All');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Build the unified array of showcase items for the carousel
  const carouselItems = useMemo(() => {
    const dynamicItems = domains.length > 0 ? domains : categories;
    
    // Add the "All" item at the beginning
    return [
      { id: 'all', name: 'All', image: '' },
      ...dynamicItems
    ];
  }, [categories, domains]);

  // Filter products based on active tab
  const featuredProducts = useMemo(() => {
    let filtered = products.filter(p => !p.hidden);
    
    if (activeTab !== 'All') {
      filtered = filtered.filter(p => p.category === activeTab || p.domain === activeTab);
    }
    
    // Return only top 4 products or up to 4 for the specific category
    return filtered.slice(0, 4);
  }, [products, activeTab]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  // If no products and it's not the 'All' tab, show a gentle fallback or just empty
  if (featuredProducts.length === 0 && activeTab !== 'All') {
    // Optionally return a message, but we'll render empty grid instead.
  }

  return (
    <section className="w-full px-4 md:px-8 max-w-7xl mx-auto py-12 md:py-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-[#2B2B2B] mb-8 font-serif">Curated For You</h2>
        
        {/* Horizontal Category Carousel */}
        <div className="relative group/carousel max-w-[100vw] sm:max-w-none">
          {/* Left Navigation Arrow */}
          <button 
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-md border border-[#F5F5F5] flex items-center justify-center text-[#7A7A7A] hover:text-[#E75480] hover:border-[#F48CA8] transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 hidden sm:flex"
            aria-label="Scroll Left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Scrollable Container */}
          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto gap-4 sm:gap-8 snap-x hide-scrollbar px-4 sm:px-8 py-4 sm:py-6"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {carouselItems.map((item) => {
              const isActive = activeTab === item.name;
              const isAll = item.name === 'All';

              return (
                <div 
                  key={item.id}
                  onClick={() => setActiveTab(item.name)}
                  className="flex flex-col items-center gap-3 snap-start cursor-pointer group flex-shrink-0"
                >
                  <div 
                    className={`w-16 h-16 sm:w-20 sm:h-20 md:w-[110px] md:h-[110px] rounded-full flex items-center justify-center overflow-hidden border-[2px] md:border-[3px] bg-[#FFF5F7] transition-all duration-300 ${
                      isActive 
                        ? 'border-[#E75480] shadow-[0_4px_16px_rgba(231,84,128,0.3)] -translate-y-1' 
                        : 'border-white shadow-sm group-hover:border-[#F48CA8] group-hover:shadow-[0_8px_20px_rgba(244,140,168,0.25)] group-hover:-translate-y-1 md:group-hover:-translate-y-2'
                    }`}
                  >
                    {isAll ? (
                      <LayoutGrid className={`w-6 h-6 md:w-8 md:h-8 ${isActive ? 'text-[#E75480]' : 'text-[#A0A0A0] group-hover:text-[#F48CA8]'} transition-colors duration-300`} strokeWidth={1.5} />
                    ) : (
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className={`w-full h-full object-cover transition-transform duration-300 ${isActive ? 'scale-105' : 'group-hover:scale-105'}`}
                        loading="lazy"
                      />
                    )}
                  </div>
                  <span 
                    className={`text-sm md:text-base font-medium transition-colors duration-300 ${
                      isActive 
                        ? 'text-[#E75480]' 
                        : 'text-[#7A7A7A] group-hover:text-[#4A4A4A]'
                    }`}
                  >
                    {item.name}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Right Navigation Arrow */}
          <button 
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-md border border-[#F5F5F5] flex items-center justify-center text-[#7A7A7A] hover:text-[#E75480] hover:border-[#F48CA8] transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 hidden sm:flex"
            aria-label="Scroll Right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Featured Products Grid */}
      {featuredProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
          {featuredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => onProductClick(product)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 mb-12">
          <p className="text-[#7A7A7A]">No products found in this category.</p>
        </div>
      )}

      {/* View All Products Button */}
      <div className="text-center">
        <button
          onClick={() => navigate(activeTab !== 'All' ? `/?view=all&category=${encodeURIComponent(activeTab)}` : '/?view=all')}
          className="px-8 py-3 bg-white border border-[#EAEAEA] text-[#2B2B2B] font-medium rounded-full hover:border-[#E75480] hover:text-[#E75480] transition-all duration-300 shadow-sm hover:shadow-md"
        >
          View All Products
        </button>
      </div>
    </section>
  );
};

export default CuratedForYou;
