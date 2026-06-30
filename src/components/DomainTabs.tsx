import React, { useState, useRef, useEffect } from 'react';
import { LayoutGrid, ChevronLeft, ChevronRight, Store } from 'lucide-react';
import type { Domain } from '../data/categories';

interface DomainTabsProps {
  activeDomain: string | null;
  onSelectDomain: (domain: string | null) => void;
  domains: Domain[];
}

const DomainTabs: React.FC<DomainTabsProps> = ({ activeDomain, onSelectDomain, domains }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

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
  }, [domains]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="w-full py-6 px-6 flex flex-col gap-8">
      {/* Domain List */}
      <div className="relative w-full group">
        {/* Left Navigation Button */}
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="hidden md:flex absolute -left-6 top-[45%] -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-lg border border-[#F3D6DC] text-[#777777] items-center justify-center hover:text-[#E75480] hover:border-[#F7A8B8] hover:shadow-xl transition-all"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
        )}

        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="w-full overflow-x-auto scrollbar-hide pb-6 px-4 select-none"
        >
          <div className="flex space-x-10 items-center justify-start min-w-max">
            {/* All Domains Option */}
            <button
              onClick={() => onSelectDomain(null)}
              className="flex flex-col items-center gap-4 shrink-0 group focus:outline-none"
            >
              <div
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                  activeDomain === null
                    ? 'border-4 border-[#F7A8B8] shadow-lg scale-105 p-1 bg-gradient-to-br from-white to-[#FFF5F7]'
                    : 'border-2 border-transparent bg-white hover:border-[#F3D6DC] hover:shadow-md hover:scale-105 p-1'
                }`}
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-[#FFF5F7] flex items-center justify-center shadow-inner">
                  <LayoutGrid
                    strokeWidth={1.5}
                    className={`w-12 h-12 transition-colors ${
                      activeDomain === null ? 'text-[#E75480]' : 'text-[#777777] group-hover:text-[#E75480]'
                    }`}
                  />
                </div>
              </div>
              <span
                className={`text-base font-bold tracking-wide transition-colors duration-200 ${
                  activeDomain === null ? 'text-[#E75480]' : 'text-[#777777] group-hover:text-[#E75480]'
                }`}
              >
                All Domains
              </span>
            </button>

            {domains.map((domain) => {
              const isActive = activeDomain === domain.name;
              return (
                <button
                  key={domain.name}
                  onClick={() => onSelectDomain(domain.name)}
                  className="flex flex-col items-center gap-4 shrink-0 group focus:outline-none"
                >
                  <div
                    className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? 'border-4 border-[#F7A8B8] shadow-lg scale-105 p-1 bg-gradient-to-br from-white to-[#FFF5F7]'
                        : 'border-2 border-transparent bg-white hover:border-[#F3D6DC] hover:shadow-md hover:scale-105 p-1'
                    }`}
                  >
                    <div className="w-full h-full rounded-full overflow-hidden bg-[#FFF5F7] flex items-center justify-center shadow-inner">
                      {domain.image ? (
                        <img
                          src={domain.image}
                          alt={domain.name}
                          className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                          draggable={false}
                        />
                      ) : (
                        <Store
                          strokeWidth={1.5}
                          className={`w-12 h-12 transition-colors ${
                            isActive ? 'text-[#E75480]' : 'text-[#777777] group-hover:text-[#E75480]'
                          }`}
                        />
                      )}
                    </div>
                  </div>
                  <span
                    className={`text-base font-bold tracking-wide transition-colors duration-200 ${
                      isActive ? 'text-[#E75480]' : 'text-[#777777] group-hover:text-[#E75480]'
                    }`}
                  >
                    {domain.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Navigation Button */}
        {showRightArrow && domains.length > 0 && (
          <button
            onClick={() => scroll('right')}
            className="hidden md:flex absolute -right-6 top-[45%] -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-lg border border-[#F3D6DC] text-[#777777] items-center justify-center hover:text-[#E75480] hover:border-[#F7A8B8] hover:shadow-xl transition-all"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        )}
      </div>
      
      {domains.length === 0 && (
        <div className="w-full text-center py-4 text-[#777777] text-sm">
          No domains found.
        </div>
      )}
    </div>
  );
};

export default DomainTabs;
