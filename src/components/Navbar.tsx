import React, { useState, useRef, useEffect } from 'react';
import { Search, ShoppingBag, User, Menu, Settings, LogOut, X } from 'lucide-react';
import logo from '../assets/Artboard 1 copy 3.png';
import { useAuth } from '../context/AuthContext';

import { useNavigate } from 'react-router-dom';
import { isAdmin } from '../constants/auth';

const Navbar: React.FC = () => {
  const { user, openModal, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsMobileSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isMobileSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isMobileSearchOpen]);

  return (
    <nav className="bg-gradient-to-r from-[#FFD1DC]/80 via-[#FFF5F7] to-[#F7A8B8]/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="flex justify-between items-center px-4 sm:px-6 py-4 max-w-7xl mx-auto w-full relative">

        {/* Mobile Search Expanded Overlay */}
        {isMobileSearchOpen && (
          <div 
            ref={searchContainerRef}
            className="absolute inset-0 bg-white/95 backdrop-blur-md z-50 flex items-center px-4 sm:px-6 sm:hidden w-full h-full animate-in fade-in slide-in-from-top-1 duration-200"
          >
            <Search className="h-5 w-5 text-gray-400 mr-2" />
            <input
              ref={searchInputRef}
              type="text"
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 text-[#2B2B2B] outline-none placeholder-gray-500"
              placeholder="Search..."
            />
            <button 
              onClick={() => setIsMobileSearchOpen(false)}
              className="p-2 -mr-2 text-gray-500 hover:text-[#E75480] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Left: Menu & Search Bar */}
        <div className="flex-1 flex items-center space-x-2 sm:space-x-4 z-10">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-[#2B2B2B] hover:text-[#E75480] transition-colors lg:hidden p-1 -ml-1 sm:p-0 sm:ml-0"
          >
            <Menu className="h-6 w-6 sm:h-7 sm:w-7" />
          </button>

          {/* Desktop/Tablet Search Bar */}
          <div className="hidden sm:block relative w-full max-w-[130px] sm:max-w-[180px] md:max-w-[240px]">
            <div className="absolute inset-y-0 left-0 pl-2.5 sm:pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400 hover:text-[#E75480] transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-8 sm:pl-10 pr-3 py-1.5 sm:py-2 border-transparent rounded-full bg-white/70 text-xs sm:text-sm placeholder-gray-500 focus:border-[#F3D6DC] focus:bg-white focus:ring-0 transition-colors duration-200 text-[#2B2B2B]"
              placeholder="Search..."
            />
          </div>

          {/* Mobile Search Icon */}
          <button 
            className="sm:hidden text-[#2B2B2B] hover:text-[#E75480] transition-colors p-1"
            onClick={() => setIsMobileSearchOpen(true)}
          >
            <Search className="h-5 w-5" />
          </button>
        </div>

        {/* Center: Logo */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex justify-center items-center z-10 w-fit">
          <img src={logo} alt="PISTU Logo" className="h-18 object-contain" />
        </div>

        {/* Right: Nav Links & Icons */}
        <div className="flex items-center justify-end flex-1 space-x-4 sm:space-x-6 z-10">
          <div className="hidden lg:flex items-center space-x-6">
            <a href="#" className="text-sm font-medium text-[#2B2B2B] hover:text-[#E75480] transition-colors">
              New Arrivals
            </a>
            <a href="#" className="text-sm font-medium text-[#2B2B2B] hover:text-[#E75480] transition-colors">
              Collections
            </a>
            <a href="#" className="text-sm font-medium text-[#2B2B2B] hover:text-[#E75480] transition-colors">
              Journal
            </a>
          </div>
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button className="relative text-[#2B2B2B] hover:text-[#E75480] transition-colors">
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-[#F7A8B8] text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                0
              </span>
            </button>
            
            {/* Dynamic Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-center text-[#2B2B2B] hover:text-[#E75480] transition-colors focus:outline-none"
              >
                {user ? (
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full overflow-hidden border border-[#F3D6DC] shadow-sm">
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <User className="h-5 w-5" />
                )}
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-lg border border-[#F3D6DC]/50 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                  {!user ? (
                    <button 
                      onClick={() => {
                        setIsDropdownOpen(false);
                        openModal('login');
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#2B2B2B] hover:bg-[#FFF6F8] hover:text-[#E75480] transition-colors"
                    >
                      Login / Sign Up
                    </button>
                  ) : (
                    <>
                      <div className="px-4 py-2 border-b border-[#F3D6DC]/50 mb-1">
                        <p className="text-xs text-[#7A7A7A]">Signed in as</p>
                        <p className="text-sm font-semibold text-[#2B2B2B] truncate">{user.name}</p>
                      </div>
                      {isAdmin(user) && (
                        <button 
                          onClick={() => {
                            setIsDropdownOpen(false);
                            navigate('/admin');
                          }}
                          className="w-full flex items-center px-4 py-2 cursor-pointer text-sm font-medium text-[#2B2B2B] hover:bg-[#FFF6F8] hover:text-[#E75480] transition-colors"
                        >
                          <User className="w-4 h-4 mr-2" /> Admin Panel
                        </button>
                      )}
                      <button 
                        onClick={() => setIsDropdownOpen(false)}
                        className="w-full flex items-center px-4 py-2 cursor-pointer text-sm font-medium text-[#2B2B2B] hover:bg-[#FFF6F8] hover:text-[#E75480] transition-colors"
                      >
                        <Settings className="w-4 h-4 mr-2" /> Settings
                      </button>
                      <button 
                        onClick={() => {
                          setIsDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center px-4 py-2 cursor-pointer text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-2" /> Logout
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-[#FFF5F7] animate-in slide-in-from-left z-40 border-t border-[#F3D6DC] shadow-xl pb-10">
          <div className="flex flex-col px-6 py-6 space-y-5 bg-white">
            <a href="#" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-[#2B2B2B] hover:text-[#E75480] transition-colors border-b border-gray-100 pb-3">
              New Arrivals
            </a>
            <a href="#" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-[#2B2B2B] hover:text-[#E75480] transition-colors border-b border-gray-100 pb-3">
              Collections
            </a>
            <a href="#" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-[#2B2B2B] hover:text-[#E75480] transition-colors border-b border-gray-100 pb-3">
              Journal
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
