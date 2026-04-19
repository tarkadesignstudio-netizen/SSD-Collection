import React, { useState, useRef, useEffect } from 'react';
import { Search, LayoutGrid, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Category } from '../data/categories';

interface CategoryTabsProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  categories: Category[];
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({ activeCategory, onSelectCategory, categories }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(Math.ceil(scrollLeft) < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    handleScroll();
    window.addEventListener('resize', handleScroll);
    return () => window.removeEventListener('resize', handleScroll);
  }, [filteredCategories]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 240;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="w-full py-6 px-6 flex flex-col gap-8">
      {/* Search Input */}
      <div className="relative max-w-md mx-auto w-full">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-[#a1a1a1]" />
        </div>
        <input
          type="text"
          placeholder="Search categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-[#F3D6DC] rounded-full focus:outline-none focus:ring-2 focus:ring-[#F7A8B8] focus:border-transparent transition-all text-[#777777] placeholder-[#a1a1a1] shadow-sm bg-white"
        />
      </div>

      {/* Category List */}
      {filteredCategories.length > 0 ? (
        <div className="relative w-full group">
          {/* Left Navigation Button */}
          {showLeftArrow && (
            <button
              onClick={() => scroll('left')}
              className="hidden md:flex absolute -left-4 top-[40%] -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-md border border-[#F3D6DC] text-[#777777] items-center justify-center hover:text-[#E75480] hover:border-[#F7A8B8] hover:shadow-lg transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="w-full overflow-x-auto scrollbar-hide pb-4 px-2 select-none"
          >
            <div className="flex space-x-8 items-center justify-start min-w-max">
              {filteredCategories.map((category) => {
                const isActive = activeCategory === category.name;
                return (
                  <button
                    key={category.name}
                    onClick={() => onSelectCategory(category.name)}
                    className="flex flex-col items-center gap-3 shrink-0 group focus:outline-none"
                  >
                    <div
                      className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isActive
                          ? 'border-[3px] border-[#F7A8B8] shadow-md scale-105 p-1'
                          : 'border-2 border-transparent hover:border-[#F3D6DC] hover:shadow-sm hover:scale-105 p-1'
                      }`}
                    >
                      <div className="w-full h-full rounded-full overflow-hidden bg-[#FFF5F7] flex items-center justify-center">
                        {category.isAll ? (
                          <LayoutGrid
                            strokeWidth={1.5}
                            className={`w-8 h-8 transition-colors ${
                              isActive ? 'text-[#E75480]' : 'text-[#777777] group-hover:text-[#E75480]'
                            }`}
                          />
                        ) : category.image ? (
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                            draggable={false}
                          />
                        ) : (
                          <LayoutGrid
                            strokeWidth={1.5}
                            className={`w-8 h-8 transition-colors ${
                              isActive ? 'text-[#E75480]' : 'text-[#777777] group-hover:text-[#E75480]'
                            }`}
                          />
                        )}
                      </div>
                    </div>
                    <span
                      className={`text-sm font-medium transition-colors duration-200 ${
                        isActive ? 'text-[#E75480]' : 'text-[#777777] group-hover:text-[#E75480]'
                      }`}
                    >
                      {category.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Navigation Button */}
          {showRightArrow && (
            <button
              onClick={() => scroll('right')}
              className="hidden md:flex absolute -right-4 top-[40%] -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-md border border-[#F3D6DC] text-[#777777] items-center justify-center hover:text-[#E75480] hover:border-[#F7A8B8] hover:shadow-lg transition-all"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>
      ) : (
        <div className="w-full text-center py-8 text-[#777777] text-sm">
          No categories found.
        </div>
      )}
    </div>
  );
};

export default CategoryTabs;
