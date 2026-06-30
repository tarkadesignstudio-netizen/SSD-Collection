import React, { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../database/firebase';
import { Edit, Trash2, Loader2, EyeOff, Eye, PackageX, PackageCheck } from 'lucide-react';
import type { Product } from '../data/products';
import EditProductModal from './EditProductModal';

const ManageProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, "products"));
      const p = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product));
      
      // Sort by creation date descending if available
      p.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      });
      
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
    if (window.confirm(`Are you sure you want to permanently delete '${name}'? This action cannot be undone.`)) {
      try {
        await deleteDoc(doc(db, "products", id));
        fetchProducts();
      } catch (error) {
        console.error("Error deleting", error);
        alert("Failed to delete product.");
      }
    }
  };

  const toggleHide = async (product: Product) => {
    try {
      await updateDoc(doc(db, "products", product.id), {
        hidden: !product.hidden
      });
      fetchProducts();
    } catch (error) {
      console.error("Error toggling hide", error);
      alert("Failed to update visibility.");
    }
  };

  const toggleOutOfStock = async (product: Product) => {
    try {
      await updateDoc(doc(db, "products", product.id), {
        outOfStock: !product.outOfStock
      });
      fetchProducts();
    } catch (error) {
      console.error("Error toggling stock", error);
      alert("Failed to update stock status.");
    }
  };

  const openEditModal = (prod: Product) => {
    setSelectedProduct(prod);
    setIsEditModalOpen(true);
  };

  return (
    <div className="flex-1 px-4 md:px-8 lg:px-12 py-8 min-h-[calc(100vh-80px)] overflow-y-auto w-full">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#2B2B2B] mb-2">Manage Products</h1>
          <p className="text-[#7A7A7A] text-sm">View, edit, hide, and manage all your products</p>
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
                      <th className="py-4 px-4">Domain / Category</th>
                      <th className="py-4 px-4">Selling Price</th>
                      <th className="py-4 px-4 text-center">Status</th>
                      <th className="py-4 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-[#7A7A7A]">No products found.</td>
                      </tr>
                    ) : (
                      products.map((product) => {
                        const primaryImage = product.images?.find(img => img.isPrimary)?.url || product.image || '';
                        
                        return (
                          <tr key={product.id} className={`border-b border-[#F3D6DC] transition-colors ${product.hidden ? 'bg-gray-50 opacity-70' : 'hover:bg-[#FFF6F8]'}`}>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-[#F3D6DC]/50">
                                  {primaryImage ? (
                                    <img src={primaryImage} alt={product.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex justify-center items-center text-xs text-gray-400">No Img</div>
                                  )}
                                </div>
                                <span className={`font-medium ${product.hidden ? 'text-gray-500' : 'text-[#2B2B2B]'}`}>{product.name}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex flex-col">
                                <span className="text-xs font-semibold text-[#E75480]">{product.domain || 'Unassigned'}</span>
                                <span className="text-sm text-[#7A7A7A]">{product.category}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4 font-semibold text-[#2B2B2B]">₹{product.sellingPrice || product.price || 0}</td>
                            <td className="py-4 px-4 text-center">
                              <div className="flex flex-col gap-1 items-center">
                                {product.hidden && (
                                  <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider bg-gray-200 px-2 py-0.5 rounded-full">Hidden</span>
                                )}
                                {product.outOfStock && (
                                  <span className="text-[10px] uppercase font-bold text-orange-500 tracking-wider bg-orange-100 px-2 py-0.5 rounded-full">Out of Stock</span>
                                )}
                                {!product.hidden && !product.outOfStock && (
                                  <span className="text-[10px] uppercase font-bold text-green-500 tracking-wider bg-green-100 px-2 py-0.5 rounded-full">Active</span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button 
                                  onClick={() => toggleHide(product)}
                                  className={`p-2 rounded-xl transition-all ${product.hidden ? 'text-gray-500 hover:bg-gray-200' : 'text-[#7A7A7A] hover:text-indigo-500 hover:bg-indigo-50'}`}
                                  title={product.hidden ? "Unhide Product" : "Hide Product"}
                                >
                                  {product.hidden ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                </button>
                                <button 
                                  onClick={() => toggleOutOfStock(product)}
                                  className={`p-2 rounded-xl transition-all ${product.outOfStock ? 'text-orange-500 hover:bg-orange-100' : 'text-[#7A7A7A] hover:text-orange-500 hover:bg-orange-50'}`}
                                  title={product.outOfStock ? "Mark In Stock" : "Mark Out of Stock"}
                                >
                                  {product.outOfStock ? <PackageCheck className="w-5 h-5" /> : <PackageX className="w-5 h-5" />}
                                </button>
                                <button 
                                  className="p-2 text-[#7A7A7A] hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                                  title="Edit Product"
                                  onClick={() => openEditModal(product)}
                                >
                                  <Edit className="w-5 h-5" />
                                </button>
                                <button 
                                  onClick={() => handleDelete(product.id, product.name)}
                                  className="p-2 text-[#7A7A7A] hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                  title="Permanently Delete"
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
            </>
          )}
        </div>
      </div>

      {isEditModalOpen && selectedProduct && (
        <EditProductModal 
          isOpen={isEditModalOpen} 
          product={selectedProduct} 
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedProduct(null);
          }}
          onUpdate={() => fetchProducts()}
        />
      )}
    </div>
  );
};

export default ManageProducts;
