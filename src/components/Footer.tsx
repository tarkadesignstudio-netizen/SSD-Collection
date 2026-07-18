import React from 'react';
import { MessageCircle } from 'lucide-react';

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-white border-t border-[#F5F5F5] py-12 md:py-16 mt-auto">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8">
          
          {/* Column 1: Brand */}
          <div className="flex flex-col text-center md:text-left">
            <h3 className="text-xl font-bold text-[#2B2B2B] font-serif mb-4">
              SSD Collection
            </h3>
            <p className="text-[#7A7A7A] text-[15px] leading-relaxed mb-6 italic">
              "Curated gifts and everyday essentials crafted with care."
            </p>
            <p className="text-[#A0A0A0] text-xs">
              &copy; 2024 SSD Collection<br />
              All Rights Reserved.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col text-center md:text-left">
            <h4 className="text-[#2B2B2B] font-semibold mb-6 tracking-wider text-xs uppercase">
              Quick Links
            </h4>
            <ul className="flex flex-col gap-3">
              {['About', 'Collections', 'Journal'].map((link) => (
                <li key={link}>
                  <a 
                    href="#" 
                    className="text-[#7A7A7A] hover:text-[#E75480] text-sm transition-colors duration-300 inline-block hover:-translate-y-0.5"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Customer Support */}
          <div className="flex flex-col text-center md:text-left">
            <h4 className="text-[#2B2B2B] font-semibold mb-6 tracking-wider text-xs uppercase">
              Customer Support
            </h4>
            <ul className="flex flex-col gap-3">
              {['Shipping', 'Returns', 'Privacy Policy'].map((link) => (
                <li key={link}>
                  <a 
                    href="#" 
                    className="text-[#7A7A7A] hover:text-[#E75480] text-sm transition-colors duration-300 inline-block hover:-translate-y-0.5"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Connect */}
          <div className="flex flex-col items-center md:items-start">
            <h4 className="text-[#2B2B2B] font-semibold mb-6 tracking-wider text-xs uppercase">
              Connect
            </h4>
            <div className="flex gap-4">
              <a 
                href="#" 
                className="w-10 h-10 rounded-full border border-[#F5F5F5] flex items-center justify-center text-[#7A7A7A] hover:text-[#E75480] hover:border-[#F48CA8] hover:-translate-y-1 transition-all duration-300"
                aria-label="Instagram"
              >
                <InstagramIcon />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full border border-[#F5F5F5] flex items-center justify-center text-[#7A7A7A] hover:text-[#E75480] hover:border-[#F48CA8] hover:-translate-y-1 transition-all duration-300"
                aria-label="Facebook"
              >
                <FacebookIcon />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full border border-[#F5F5F5] flex items-center justify-center text-[#7A7A7A] hover:text-[#E75480] hover:border-[#F48CA8] hover:-translate-y-1 transition-all duration-300"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-[18px] h-[18px]" strokeWidth={1.5} />
              </a>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
