import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import AdminDashboard from './admin/AdminDashboard';
import { AuthProvider } from './context/AuthContext';
import AuthModal from './components/AuthModal';
import AdminRoute from './admin/AdminRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="font-sans min-h-screen bg-[#FFF5F7] text-[#2B2B2B]">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } 
            />
          </Routes>
          <AuthModal />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
