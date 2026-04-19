import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AddProductForm from './AddProductForm';
import AddCategoryForm from './AddCategoryForm';
import ManageProducts from './ManageProducts';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../database/firebase';
import { Menu } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('add-product');
  const [isMigrating, setIsMigrating] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleMigration = async () => {
    const confirmMessage = window.confirm("This will find any products with old categories (Belts, Wallets, etc) and move them to 'Personalized Gifts'. Proceed?");
    if (!confirmMessage) return;
    setIsMigrating(true);
    try {
      const snapshot = await getDocs(collection(db, "products"));
      let count = 0;
      for (const productDoc of snapshot.docs) {
        const data = productDoc.data();
        const oldCategories = ['Belts', 'Wallets', 'Bags', 'Travel', 'Accessories'];
        if (oldCategories.includes(data.category)) {
          await updateDoc(doc(db, "products", productDoc.id), {
            category: 'Personalized Gifts'
          });
          count++;
        }
      }
      alert(`Migrated ${count} previous dummy products to 'Personalized Gifts'.`);
    } catch (err) {
      console.error(err);
      alert("Error migrating products");
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row w-full bg-[#FFF6F8] min-h-[calc(100vh-80px)] relative">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between bg-white p-4 shadow-sm border-b border-[#F3D6DC] z-30">
        <h2 className="font-bold text-[#2B2B2B] flex items-center">
          <span className="text-[#E75480] mr-2">Admin</span> Panel
        </h2>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
          className="p-2 text-[#2B2B2B] hover:bg-[#FDE2E8] rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-[#F48CA8]"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/40 z-30" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <AdminSidebar activeTab={activeTab} onTabChange={(tab) => {
        setActiveTab(tab);
        setIsSidebarOpen(false);
      }} isOpen={isSidebarOpen} />
      
      <div className="flex-1 w-full max-w-full overflow-x-hidden relative">
        {activeTab === 'add-product' && <AddProductForm />}
        {activeTab === 'add-category' && <AddCategoryForm />}
        {activeTab === 'manage-products' && <ManageProducts />}

        <button 
          onClick={handleMigration} 
          disabled={isMigrating}
          className="absolute bottom-4 right-4 md:left-4 md:right-auto text-[10px] text-gray-400 hover:text-[#E75480] transition-colors"
        >
          {isMigrating ? "Migrating..." : "Run Category Migration"}
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
