import React, { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../database/firebase';
import { Image, Edit, Trash2, Loader2 } from 'lucide-react';
import type { Product } from '../data/products';
import ManageImagesModal from './ManageImagesModal';

const ManageProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isImagesModalOpen, setIsImagesModalOpen] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, "products"));
      const p = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product));
      // Sort by creation or just leave as is
      setProducts(p);
    } catch (error) {
      console.error("Error fetching products", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await deleteDoc(doc(db, "products", id));
        fetchProducts();
      } catch (error) {
        console.error("Error deleting", error);
        alert("Failed to delete product.");
      }
    }
  };

  const openManageImages = (prod: Product) => {
    setSelectedProduct(prod);
    setIsImagesModalOpen(true);
  };

  return (
    <div className="flex-1 px-4 md:px-8 lg:px-12 py-8 min-h-[calc(100vh-80px)] overflow-y-auto w-full">
      <div className="max-w-6xl mx-auto w-full">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#2B2B2B] mb-2">Manage Products</h1>
          <p className="text-[#7A7A7A] text-sm">View, edit, and manage all your products</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl p-6 md:p-8 w-full shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.05)' }}>
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#E75480]" />
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#F3D6DC] text-[#7A7A7A] text-sm font-medium uppercase tracking-wider">
                      <th className="py-4 px-4">Product</th>
                      <th className="py-4 px-4">Category</th>
                      <th className="py-4 px-4">Price</th>
                      <th className="py-4 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-[#7A7A7A]">No products found.</td>
                      </tr>
                    ) : (
                      products.map((product) => {
                        const primaryImage = product.images?.find(img => img.isPrimary)?.url || product.image || '';
                        
                        return (
                          <tr key={product.id} className="border-b border-[#F3D6DC] hover:bg-[#FFF6F8] transition-colors">
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                  {primaryImage ? (
                                    <img src={primaryImage} alt={product.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex justify-center items-center text-xs text-gray-400">No Img</div>
                                  )}
                                </div>
                                <span className="font-medium text-[#2B2B2B]">{product.name}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-[#7A7A7A]">{product.category}</td>
                            <td className="py-4 px-4 font-semibold text-[#E75480]">₹{product.price}</td>
                            <td className="py-4 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {/* Edit - optional for now, placeholder */}
                                <button 
                                  className="p-2 text-[#7A7A7A] hover:text-[#E75480] hover:bg-[#FDE2E8] rounded-xl transition-all"
                                  title="Edit Product"
                                  onClick={() => alert("Edit product coming soon!")}
                                >
                                  <Edit className="w-5 h-5" />
                                </button>
                                <button 
                                  onClick={() => openManageImages(product)}
                                  className="p-2 text-[#7A7A7A] hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                                  title="Manage Images"
                                >
                                  <Image className="w-5 h-5" />
                                </button>
                                <button 
                                  onClick={() => handleDelete(product.id, product.name)}
                                  className="p-2 text-[#7A7A7A] hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                  title="Delete Product"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden flex flex-col space-y-4">
                {products.length === 0 ? (
                  <div className="py-8 text-center text-[#7A7A7A]">No products found.</div>
                ) : (
                  products.map((product) => {
                    const primaryImage = product.images?.find(img => img.isPrimary)?.url || product.image || '';
                    return (
                      <div key={product.id} className="bg-white border border-[#F3D6DC] rounded-xl p-4 flex flex-col gap-3 shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {primaryImage ? (
                              <img src={primaryImage} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex justify-center items-center text-xs text-gray-400">No Img</div>
                            )}
                          </div>
                          <div className="flex flex-col flex-1 h-16 justify-between py-0.5">
                            <span className="font-medium text-[#2B2B2B] text-[13px] leading-tight line-clamp-2">{product.name}</span>
                            <div className="flex justify-between items-center w-full">
                              <span className="text-[10px] uppercase text-[#7A7A7A]">{product.category}</span>
                              <span className="text-sm font-semibold text-[#E75480]">₹{product.price}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F3D6DC]/50">
                          <button 
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#7A7A7A] hover:text-[#E75480] hover:bg-[#FDE2E8] rounded-lg transition-all"
                            onClick={() => alert("Edit product coming soon!")}
                          >
                            <Edit className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button 
                            onClick={() => openManageImages(product)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#7A7A7A] hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                          >
                            <Image className="w-3.5 h-3.5" /> Images
                          </button>
                          <button 
                            onClick={() => handleDelete(product.id, product.name)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#7A7A7A] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {isImagesModalOpen && selectedProduct && (
        <ManageImagesModal 
          isOpen={isImagesModalOpen} 
          product={selectedProduct} 
          onClose={() => {
            setIsImagesModalOpen(false);
            setSelectedProduct(null);
          }}
          onUpdate={() => fetchProducts()}
        />
      )}
    </div>
  );
};

export default ManageProducts;
