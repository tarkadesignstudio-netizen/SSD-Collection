import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { signInWithGoogle, loginUser, signupUser } from '../database/auth';

const AuthModal: React.FC = () => {
  const { isModalOpen, modalType, closeModal, openModal } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset form when modal state changes
  useEffect(() => {
    setEmail('');
    setPassword('');
    setName('');
    setError('');
  }, [modalType, isModalOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, closeModal]);

  if (!isModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (modalType === 'signup' && !name) {
      setError('Please provide your name.');
      return;
    }

    setIsLoading(true);

    // Execute authentic Firebase authentication logic
    try {
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters.');
      }
      
      if (modalType === 'login') {
        await loginUser(email, password);
      } else {
        await signupUser(email, password, name);
      }
      
      closeModal();
    } catch (error) {
      const err = error as Error;
      console.error("Auth error:", err);
      // Simplify Firebase error messages into UI friendly text
      let errorMessage = err.message || "Authentication failed.";
      if (errorMessage.includes("auth/invalid-credential")) {
        errorMessage = "Invalid email or password.";
      } else if (errorMessage.includes("auth/email-already-in-use")) {
        errorMessage = "An account with this email already exists.";
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError('');
      setIsLoading(true);
      await signInWithGoogle();
      closeModal();
    } catch (error) {
      const err = error as Error;
      console.error("Login error:", err);
      setError(err.message || "Failed to sign in with Google. Please ensure popups are enabled.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
      onClick={handleOutsideClick}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl scale-100 opacity-100 transition-all duration-300 animate-in fade-in zoom-in-95"
        style={{ animationDuration: '300ms' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F3D6DC]/50">
          <h2 className="text-xl font-bold text-[#2B2B2B]">
            {modalType === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <button 
            onClick={closeModal}
            className="p-1 rounded-full text-[#7A7A7A] hover:bg-[#F3D6DC]/50 hover:text-[#2B2B2B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium border border-red-100">
                {error}
              </div>
            )}
            
            {modalType === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-[#2B2B2B] mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#F3D6DC] bg-white text-[#2B2B2B] placeholder-[#7A7A7A] focus:outline-none focus:ring-2 focus:ring-[#F48CA8]/50 focus:border-[#F48CA8] transition-all text-sm block"
                  disabled={isLoading}
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-[#2B2B2B] mb-1">Email or Mobile</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email or mobile"
                className="w-full px-4 py-2.5 rounded-xl border border-[#F3D6DC] bg-white text-[#2B2B2B] placeholder-[#7A7A7A] focus:outline-none focus:ring-2 focus:ring-[#F48CA8]/50 focus:border-[#F48CA8] transition-all text-sm block"
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#2B2B2B] mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-2.5 rounded-xl border border-[#F3D6DC] bg-white text-[#2B2B2B] placeholder-[#7A7A7A] focus:outline-none focus:ring-2 focus:ring-[#F48CA8]/50 focus:border-[#F48CA8] transition-all text-sm block"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#F48CA8] to-[#E75480] text-white font-medium py-3 px-4 rounded-xl shadow-sm hover:scale-[1.02] transition-transform duration-200 text-sm mt-2 flex items-center justify-center disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/60 border-t-white rounded-full animate-spin"></div>
              ) : (
                modalType === 'login' ? 'Login' : 'Sign Up'
              )}
            </button>
          </form>

          {/* Social Auth optionally */}
          <div className="mt-6 flex items-center">
            <div className="flex-1 border-t border-[#F3D6DC]"></div>
            <span className="px-3 text-xs text-[#7A7A7A] bg-white">OR</span>
            <div className="flex-1 border-t border-[#F3D6DC]"></div>
          </div>
          
          <button 
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-white border border-[#F3D6DC] text-[#2B2B2B] font-medium py-2.5 px-4 rounded-xl hover:bg-[#FFF6F8] transition-colors duration-200 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          {/* Footer toggle */}
          <div className="mt-6 text-center text-sm text-[#7A7A7A]">
            {modalType === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button 
                  onClick={() => openModal('signup')}
                  className="font-semibold text-[#E75480] hover:underline focus:outline-none"
                >
                  Create New Account
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button 
                  onClick={() => openModal('login')}
                  className="font-semibold text-[#E75480] hover:underline focus:outline-none"
                >
                  Login
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
