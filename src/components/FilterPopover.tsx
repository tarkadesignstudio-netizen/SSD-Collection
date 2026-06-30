import React, { useState, useEffect, useRef } from 'react';
import { Filter, X, SlidersHorizontal } from 'lucide-react';

interface FilterPopoverProps {
  minPrice: string;
  setMaxPrice: (val: string) => void;
  maxPrice: string;
  setMinPrice: (val: string) => void;
  availability: string;
  setAvailability: (val: string) => void;
  sortBy: string;
  setSortBy: (val: string) => void;
  onClear: () => void;
  showClearButton: boolean;
}

const MAX_SLIDER_PRICE = 50000;

const FilterPopover: React.FC<FilterPopoverProps> = ({
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  availability,
  setAvailability,
  sortBy,
  setSortBy,
  onClear,
  showClearButton
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Parse current values for the slider
  const currentMin = minPrice ? parseInt(minPrice) : 0;
  const currentMax = maxPrice ? parseInt(maxPrice) : MAX_SLIDER_PRICE;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(e.target.value), currentMax - 100);
    setMinPrice(value.toString());
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), currentMin + 100);
    setMaxPrice(value.toString());
  };

  // Calculate percentage for styling the track
  const minPos = (currentMin / MAX_SLIDER_PRICE) * 100;
  const maxPos = (currentMax / MAX_SLIDER_PRICE) * 100;

  return (
    <div className="relative inline-block" ref={popoverRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white border border-[#F3D6DC] px-5 py-2.5 rounded-full text-[#2B2B2B] font-semibold hover:border-[#F7A8B8] hover:shadow-md transition-all focus:outline-none"
      >
        <SlidersHorizontal className="w-4 h-4 text-[#E75480]" />
        Filters
        {showClearButton && (
          <span className="w-2 h-2 rounded-full bg-[#E75480] absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3"></span>
        )}
      </button>

      {/* Popover Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-[#F3D6DC] z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-5 flex flex-col gap-6">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#2B2B2B] flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#E75480]" />
                Filter & Sort
              </h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-[#E75480] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Price Range Slider */}
            <div className="flex flex-col gap-4">
              <label className="text-sm font-semibold text-[#2B2B2B]">Price Range</label>
              <div className="relative h-2 bg-gray-100 rounded-full w-full">
                {/* Active Track */}
                <div 
                  className="absolute h-full bg-[#E75480] rounded-full opacity-70"
                  style={{ left: `${minPos}%`, right: `${100 - maxPos}%` }}
                ></div>

                {/* Range Inputs */}
                <input 
                  type="range"
                  min="0"
                  max={MAX_SLIDER_PRICE}
                  step="100"
                  value={currentMin}
                  onChange={handleMinChange}
                  className="absolute w-full h-2 appearance-none bg-transparent pointer-events-auto cursor-pointer custom-range"
                  style={{ zIndex: currentMin > MAX_SLIDER_PRICE - 100 ? 5 : 3 }}
                />
                <input 
                  type="range"
                  min="0"
                  max={MAX_SLIDER_PRICE}
                  step="100"
                  value={currentMax}
                  onChange={handleMaxChange}
                  className="absolute w-full h-2 appearance-none bg-transparent pointer-events-auto cursor-pointer custom-range"
                  style={{ zIndex: 4 }}
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg text-sm text-[#2B2B2B] font-medium w-[45%] text-center">
                  ₹ {currentMin.toLocaleString('en-IN')}
                </div>
                <span className="text-gray-400">-</span>
                <div className="bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg text-sm text-[#2B2B2B] font-medium w-[45%] text-center">
                  {currentMax === MAX_SLIDER_PRICE ? `₹ ${currentMax.toLocaleString('en-IN')}+` : `₹ ${currentMax.toLocaleString('en-IN')}`}
                </div>
              </div>
            </div>

            {/* Sort By */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-[#2B2B2B]">Sort By</label>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-50 rounded-xl px-3 py-2.5 text-sm border border-gray-100 focus:outline-none focus:border-[#F7A8B8] text-[#2B2B2B] cursor-pointer w-full transition-colors"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="alpha_asc">Alphabetical: A-Z</option>
                <option value="alpha_desc">Alphabetical: Z-A</option>
              </select>
            </div>

            {/* Availability */}
            <div className="flex flex-col gap-2 mb-2">
              <label className="text-sm font-semibold text-[#2B2B2B]">Availability</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAvailability('all')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${availability === 'all' ? 'bg-[#E75480] text-white shadow-sm' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setAvailability('in_stock')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${availability === 'in_stock' ? 'bg-[#E75480] text-white shadow-sm' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                >
                  In Stock
                </button>
                <button
                  onClick={() => setAvailability('out_of_stock')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${availability === 'out_of_stock' ? 'bg-[#E75480] text-white shadow-sm' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                >
                  Out of Stock
                </button>
              </div>
            </div>

            {/* Clear Filters */}
            {showClearButton && (
              <button 
                onClick={() => {
                  onClear();
                  setIsOpen(false);
                }}
                className="w-full mt-2 py-3 bg-red-50 text-red-500 font-semibold rounded-xl hover:bg-red-100 transition-colors text-sm"
              >
                Clear All Filters
              </button>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPopover;
