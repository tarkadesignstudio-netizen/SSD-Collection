import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2069&auto=format&fit=crop',
    title: 'Elevate Your Space',
    subtitle: 'Premium Home & Living Collection',
    ctaText: 'Explore Collection'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=2070&auto=format&fit=crop',
    title: 'Modern Kitchen Essentials',
    subtitle: 'Cook and Serve in Style',
    ctaText: 'Shop Kitchen'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=2070&auto=format&fit=crop',
    title: 'Joyful Moments',
    subtitle: 'Discover Our Kids & Toys Range',
    ctaText: 'Shop Toys'
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1594035910387-fea47714263f?q=80&w=1974&auto=format&fit=crop',
    title: 'Signature Scents',
    subtitle: 'Exclusive Perfumes & Beauty',
    ctaText: 'Discover Beauty'
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=2040&auto=format&fit=crop',
    title: 'Curated With Love',
    subtitle: 'Lifestyle & Premium Gifts',
    ctaText: 'Find Gifts'
  }
];

const HeroBanner: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isHovered]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleShopNow = () => {
    // Scrolls a little bit down or just navigates appropriately. 
    // Since the navbar and domains will be right below, scrolling by window height is an option, 
    // or just let the user explore.
    window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
  };

  return (
    <div 
      className="relative w-full h-[100vh] overflow-hidden bg-[#FFF5F7]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[10000ms] ease-linear"
            style={{ 
              backgroundImage: `url(${slide.image})`,
              transform: index === currentSlide ? 'scale(1.05)' : 'scale(1)'
            }}
          />
          {/* Gradient Overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
          
          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 lg:px-24 max-w-7xl mx-auto h-full pt-16">
            <h2 
              className={`text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 drop-shadow-md transform transition-all duration-1000 delay-300 ${
                index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}
            >
              {slide.title}
            </h2>
            <p 
              className={`text-xl md:text-2xl text-white/90 mb-8 max-w-xl font-light drop-shadow-sm transform transition-all duration-1000 delay-500 ${
                index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}
            >
              {slide.subtitle}
            </p>
            <div
              className={`transform transition-all duration-1000 delay-700 ${
                index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}
            >
              <button
                onClick={handleShopNow}
                className="px-8 py-3.5 bg-gradient-to-r from-[#F48CA8] to-[#E75480] text-white text-lg font-medium rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all w-fit"
              >
                {slide.ctaText}
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <div className="absolute inset-y-0 left-4 md:left-8 flex items-center z-20">
        <button
          onClick={prevSlide}
          className="p-2 md:p-3 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white transition-all transform hover:scale-110"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
        </button>
      </div>
      <div className="absolute inset-y-0 right-4 md:right-8 flex items-center z-20">
        <button
          onClick={nextSlide}
          className="p-2 md:p-3 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white transition-all transform hover:scale-110"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
        </button>
      </div>

      {/* Pagination Dots */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-white scale-125 shadow-md' 
                : 'bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroBanner;
