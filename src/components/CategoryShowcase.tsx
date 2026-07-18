import React from 'react';
import { useNavigate } from 'react-router-dom';

export interface ShowcaseItem {
  id: string;
  name: string;
  image: string;
  count: number;
}

interface CategoryShowcaseProps {
  items: ShowcaseItem[];
}

const CategoryShowcase: React.FC<CategoryShowcaseProps> = ({ items }) => {
  const navigate = useNavigate();

  if (items.length === 0) return null;

  return (
    <section className="w-full px-3 md:px-8 max-w-7xl mx-auto py-8 md:py-20">
      <div className="text-center mb-12">
        <h2 className="text-2xl md:text-4xl font-bold text-[#2B2B2B] mb-4">Shop by Category</h2>
        <p className="text-[#7A7A7A] max-w-2xl mx-auto">
          Explore our premium collections curated just for you. Find exactly what you're looking for.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6 auto-rows-[140px] md:auto-rows-[250px]">
        {items.map((item, index) => {
          // Make some cards span 2 columns or rows for an editorial look
          const isFeatured = index === 0 || index === 3; 
          const spanClass = isFeatured 
            ? "col-span-2 row-span-2" 
            : "col-span-1 row-span-1";

          return (
            <div
              key={item.id}
              onClick={() => navigate(`/category/${encodeURIComponent(item.name)}`)}
              className={`relative rounded-2xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-xl transition-all duration-500 bg-white ${spanClass}`}
            >
              {/* Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
                style={{ 
                  backgroundImage: `url(${item.image || 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=2071&auto=format&fit=crop'})` 
                }}
              />
              
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
              
              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-6">
                <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="text-lg md:text-3xl font-bold text-white mb-1 drop-shadow-md">
                    {item.name}
                  </h3>
                  <p className="text-white/80 text-xs md:text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                    {item.count} {item.count === 1 ? 'Product' : 'Products'}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default CategoryShowcase;
