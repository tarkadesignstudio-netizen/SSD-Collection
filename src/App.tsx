import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import AdminDashboard from './admin/AdminDashboard';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import AuthModal from './components/AuthModal';
import CartSidebar from './components/CartSidebar';
import AdminRoute from './admin/AdminRoute';
import Footer from './components/Footer';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <CartProvider>
          <div className="font-sans min-h-screen bg-[#FFF5F7] text-[#2B2B2B]">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/category/:categoryId" element={<CategoryPage />} />
              <Route 
                path="/admin" 
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } 
              />
            </Routes>
            <Footer />
            <AuthModal />
            <CartSidebar />
          </div>
        </CartProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
