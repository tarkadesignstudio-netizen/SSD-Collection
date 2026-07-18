import React from 'react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    rating: 5,
    text: "Shopping from SSD Collection was a wonderful experience. The product quality exceeded my expectations, the packaging was premium, and the delivery was smooth. I will definitely shop again.",
    name: "Prasad Banage",
    role: "Verified Customer",
    initial: "P"
  },
  {
    id: 2,
    rating: 5,
    text: "The website is beautifully designed and very easy to navigate. I found exactly what I was looking for, and the entire shopping experience felt professional and trustworthy.",
    name: "Harshal Galati",
    role: "Verified Customer",
    initial: "H"
  },
  {
    id: 3,
    rating: 5,
    text: "Excellent product quality and fast delivery. Everything arrived in perfect condition, and the customer support was extremely helpful. Highly recommended.",
    name: "Pranamya Yelikar",
    role: "Verified Customer",
    initial: "P"
  }
];

const TestimonialSection: React.FC = () => {
  return (
    <section className="w-full px-4 md:px-8 max-w-7xl mx-auto py-12 md:py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-[#2B2B2B] mb-4 font-serif">
          Words From Our Customers
        </h2>
        <p className="text-[#7A7A7A] max-w-2xl mx-auto">
          Discover what our community has to say about their premium shopping experience.
        </p>
      </div>

      <div 
        className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 overflow-x-auto snap-x hide-scrollbar pb-6 md:pb-0 px-4 md:px-0 -mx-4 md:mx-0"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {testimonials.map((testimonial) => (
          <div 
            key={testimonial.id}
            className="bg-white rounded-[20px] p-6 sm:p-8 shadow-sm border border-[#FFF5F7] flex flex-col h-full hover:-translate-y-1 md:hover:-translate-y-2 hover:shadow-lg hover:shadow-[#F7A8B8]/30 transition-all duration-300 ease-in-out cursor-default snap-center flex-shrink-0 w-[85vw] sm:w-[400px] md:w-auto"
          >
            {/* Rating */}
            <div className="flex gap-1 mb-6">
              {[...Array(testimonial.rating)].map((_, i) => (
                <Star key={i} className="w-4 h-4 md:w-5 md:h-5 fill-[#E75480] text-[#E75480]" />
              ))}
            </div>

            {/* Review Text */}
            <p className="text-[#4A4A4A] text-[15px] leading-[1.8] flex-1 mb-8">
              "{testimonial.text}"
            </p>

            {/* Customer Profile */}
            <div className="flex items-center gap-4 mt-auto border-t border-[#F5F5F5] pt-5">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#F48CA8] to-[#E75480] flex items-center justify-center text-white font-bold text-lg shadow-sm">
                {testimonial.initial}
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-[#2B2B2B] text-[15px]">
                  {testimonial.name}
                </span>
                <span className="text-xs text-[#7A7A7A] font-medium flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  {testimonial.role}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TestimonialSection;
