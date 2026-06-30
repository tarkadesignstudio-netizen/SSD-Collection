import React, { useState, useEffect, useRef } from 'react';
import { Upload, CheckCircle2, Edit, Trash2, Loader2, X, Save, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isAdmin } from '../constants/auth';
import { uploadToCloudinary } from '../utils/cloudinary';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../database/firebase';
import type { Domain, Category } from '../data/categories';

const DomainManagement: React.FC = () => {
  const { user } = useAuth();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add Domain State
  const [newDomainName, setNewDomainName] = useState('');
  const [newDomainImage, setNewDomainImage] = useState<File | null>(null);
  const [domainImagePreview, setDomainImagePreview] = useState<string>('');
  const [isAddingDomain, setIsAddingDomain] = useState(false);

  // Add Category State
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedDomainForCategory, setSelectedDomainForCategory] = useState('');
  const [newCategoryImage, setNewCategoryImage] = useState<File | null>(null);
  const [categoryImagePreview, setCategoryImagePreview] = useState<string>('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  // Edit States
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null);
  const [editDomainName, setEditDomainName] = useState('');
  const [editDomainImage, setEditDomainImage] = useState<File | null>(null);
  const [isUpdatingDomain, setIsUpdatingDomain] = useState(false);

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editCategoryDomain, setEditCategoryDomain] = useState('');
  const [editCategoryImage, setEditCategoryImage] = useState<File | null>(null);
  const [isUpdatingCategory, setIsUpdatingCategory] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [domainsSnap, categoriesSnap] = await Promise.all([
        getDocs(collection(db, "domains")),
        getDocs(collection(db, "categories"))
      ]);

      const loadedDomains = domainsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Domain));
      const loadedCategories = categoriesSnap.docs.map(c => ({ id: c.id, ...c.data() } as Category));

      setDomains(loadedDomains);
      setCategories(loadedCategories);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to load domains and categories.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- DOMAIN HANDLERS ---

  const handleDomainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewDomainImage(file);
      setDomainImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin(user)) return alert("Unauthorized access");
    if (!newDomainName) return;

    setIsAddingDomain(true);
    try {
      let imageUrl = undefined;
      if (newDomainImage) {
        imageUrl = await uploadToCloudinary(newDomainImage);
      }
      await addDoc(collection(db, "domains"), {
        name: newDomainName,
        image: imageUrl || null,
        createdAt: new Date()
      });
      setNewDomainName('');
      setNewDomainImage(null);
      setDomainImagePreview('');
      await fetchData();
    } catch (error) {
      console.error("Error adding domain:", error);
      alert("Failed to add domain.");
    } finally {
      setIsAddingDomain(false);
    }
  };

  const handleDeleteDomain = async (domain: Domain) => {
    if (!isAdmin(user)) return alert("Unauthorized access");
    
    // Safe Deletion Check
    const hasCategories = categories.some(c => c.domain === domain.name);
    if (hasCategories) {
      alert(`Cannot delete '${domain.name}' because it contains categories. Please delete or move the categories first.`);
      return;
    }

    if (!window.confirm(`Are you sure you want to delete the domain '${domain.name}'?`)) return;

    try {
      if (domain.id) {
        await deleteDoc(doc(db, "domains", domain.id));
        await fetchData();
      }
    } catch (error) {
      console.error("Error deleting domain:", error);
      alert("Failed to delete domain.");
    }
  };

  const handleUpdateDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin(user) || !editingDomain?.id) return;
    
    setIsUpdatingDomain(true);
    try {
      let imageUrl = editingDomain.image;
      if (editDomainImage) {
        imageUrl = await uploadToCloudinary(editDomainImage);
      }

      await updateDoc(doc(db, "domains", editingDomain.id), {
        name: editDomainName,
        image: imageUrl || null
      });

      // Cascade Update: Update categories linked to this domain
      if (editingDomain.name !== editDomainName) {
        const categoriesToUpdate = categories.filter(c => c.domain === editingDomain.name);
        for (const cat of categoriesToUpdate) {
          if (cat.id) {
            await updateDoc(doc(db, "categories", cat.id), {
              domain: editDomainName
            });
          }
        }
      }

      setEditingDomain(null);
      setEditDomainImage(null);
      await fetchData();
    } catch (error) {
      console.error("Error updating domain:", error);
      alert("Failed to update domain.");
    } finally {
      setIsUpdatingDomain(false);
    }
  };

  // --- CATEGORY HANDLERS ---

  const handleCategoryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewCategoryImage(file);
      setCategoryImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin(user)) return alert("Unauthorized access");
    if (!newCategoryName || !selectedDomainForCategory) return;

    setIsAddingCategory(true);
    try {
      let imageUrl = undefined;
      if (newCategoryImage) {
        imageUrl = await uploadToCloudinary(newCategoryImage);
      }
      await addDoc(collection(db, "categories"), {
        name: newCategoryName,
        domain: selectedDomainForCategory,
        image: imageUrl || null,
        createdAt: new Date()
      });
      setNewCategoryName('');
      setSelectedDomainForCategory('');
      setNewCategoryImage(null);
      setCategoryImagePreview('');
      await fetchData();
    } catch (error) {
      console.error("Error adding category:", error);
      alert("Failed to add category.");
    } finally {
      setIsAddingCategory(false);
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    if (!isAdmin(user)) return alert("Unauthorized access");
    
    // Safe Deletion Check: Query products collection
    try {
      const productsQuery = query(collection(db, "products"), where("category", "==", category.name));
      const productsSnapshot = await getDocs(productsQuery);
      
      if (!productsSnapshot.empty) {
        alert(`Cannot delete '${category.name}' because products are assigned to it. Please reassign the products first.`);
        return;
      }
    } catch (error) {
      console.error("Error checking products:", error);
      alert("Failed to check for linked products.");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete the category '${category.name}'?`)) return;

    try {
      if (category.id) {
        await deleteDoc(doc(db, "categories", category.id));
        await fetchData();
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Failed to delete category.");
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin(user) || !editingCategory?.id) return;
    
    setIsUpdatingCategory(true);
    try {
      let imageUrl = editingCategory.image;
      if (editCategoryImage) {
        imageUrl = await uploadToCloudinary(editCategoryImage);
      }

      await updateDoc(doc(db, "categories", editingCategory.id), {
        name: editCategoryName,
        domain: editCategoryDomain,
        image: imageUrl || null
      });

      // Cascade Update: Update products linked to this category
      if (editingCategory.name !== editCategoryName) {
        const productsQuery = query(collection(db, "products"), where("category", "==", editingCategory.name));
        const productsSnapshot = await getDocs(productsQuery);
        for (const pDoc of productsSnapshot.docs) {
          await updateDoc(doc(db, "products", pDoc.id), {
            category: editCategoryName
          });
        }
      }

      setEditingCategory(null);
      setEditCategoryImage(null);
      await fetchData();
    } catch (error) {
      console.error("Error updating category:", error);
      alert("Failed to update category.");
    } finally {
      setIsUpdatingCategory(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center min-h-[calc(100vh-80px)]">
        <Loader2 className="w-8 h-8 animate-spin text-[#E75480]" />
      </div>
    );
  }

  return (
    <div className="flex-1 px-4 md:px-8 lg:px-12 py-8 min-h-[calc(100vh-80px)] overflow-y-auto w-full">
      <div className="max-w-5xl mx-auto w-full space-y-12">
        {/* Header Section */}
        <div>
          <h1 className="text-3xl font-bold text-[#2B2B2B] mb-2">Domain Management</h1>
          <p className="text-[#7A7A7A]">Manage your main domains and sub-categories</p>
        </div>

        {/* ----------------- DOMAINS SECTION ----------------- */}
        <div className="bg-white rounded-2xl p-6 md:p-8 w-full shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.03)' }}>
          <h2 className="text-xl font-semibold text-[#2B2B2B] mb-6 pb-4 border-b border-[#F3D6DC]/50">Main Domains</h2>
          
          {/* Add Domain Form */}
          <form onSubmit={handleAddDomain} className="bg-[#FFF6F8] rounded-xl p-6 mb-8 border border-[#F3D6DC]">
            <h3 className="text-sm font-medium text-[#7A7A7A] uppercase tracking-wider mb-4">Add New Domain</h3>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="relative group w-full md:w-48 shrink-0">
                <input 
                  type="file" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                  accept="image/*"
                  onChange={handleDomainImageChange}
                  disabled={isAddingDomain}
                />
                <div className={`border-2 border-dashed ${domainImagePreview ? 'border-[#F48CA8]' : 'border-[#F3D6DC] bg-white'} rounded-xl h-32 flex flex-col items-center justify-center text-center transition-colors group-hover:bg-[#FDE2E8]/50 overflow-hidden relative`}>
                  {domainImagePreview ? (
                    <img src={domainImagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <>
                      <ImageIcon className="h-6 w-6 text-[#E75480] mb-2" />
                      <span className="text-xs text-[#7A7A7A]">Upload Image</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex-1 w-full space-y-4">
                <input
                  type="text"
                  value={newDomainName}
                  onChange={(e) => setNewDomainName(e.target.value)}
                  placeholder="Domain Name (e.g., Electronics)"
                  className="w-full px-4 py-3 rounded-xl border border-[#F3D6DC] bg-white text-[#2B2B2B] placeholder-[#7A7A7A] focus:outline-none focus:ring-2 focus:ring-[#F48CA8]/50 transition-all text-sm"
                  required
                  disabled={isAddingDomain}
                />
                <button
                  type="submit"
                  disabled={isAddingDomain}
                  className="w-full bg-[#E75480] hover:bg-[#d8406c] text-white font-medium py-3 px-6 rounded-xl shadow-sm transition-all text-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isAddingDomain ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Add Domain'}
                </button>
              </div>
            </div>
          </form>

          {/* Uploaded Domains List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {domains.map(domain => (
              <div key={domain.id} className="bg-white border border-[#F3D6DC] rounded-xl p-4 flex flex-col hover:shadow-md transition-shadow">
                {editingDomain?.id === domain.id ? (
                  <form onSubmit={handleUpdateDomain} className="flex flex-col h-full gap-3">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => setEditDomainImage(e.target.files?.[0] || null)}
                      className="text-xs text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:bg-[#FDE2E8] file:text-[#E75480] hover:file:bg-[#F3D6DC]"
                    />
                    <input
                      type="text"
                      value={editDomainName}
                      onChange={(e) => setEditDomainName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#F3D6DC] text-sm focus:outline-none focus:ring-1 focus:ring-[#E75480]"
                      required
                    />
                    <div className="flex gap-2 mt-auto pt-2">
                      <button type="submit" disabled={isUpdatingDomain} className="flex-1 bg-[#E75480] text-white py-1.5 rounded-lg text-xs flex items-center justify-center gap-1 hover:bg-[#d8406c]">
                        {isUpdatingDomain ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Save className="w-3 h-3"/> Save</>}
                      </button>
                      <button type="button" onClick={() => { setEditingDomain(null); setEditDomainImage(null); }} className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs hover:bg-gray-200">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-lg bg-gray-50 flex-shrink-0 overflow-hidden border border-[#F3D6DC]/50">
                        {domain.image ? (
                          <img src={domain.image} alt={domain.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-6 h-6 text-gray-300" /></div>
                        )}
                      </div>
                      <h4 className="font-semibold text-[#2B2B2B] text-lg break-words">{domain.name}</h4>
                    </div>
                    <div className="flex justify-end gap-2 mt-auto pt-4 border-t border-[#F3D6DC]/50">
                      <button 
                        onClick={() => {
                          setEditingDomain(domain);
                          setEditDomainName(domain.name);
                        }}
                        className="p-2 text-[#7A7A7A] hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteDomain(domain)}
                        className="p-2 text-[#7A7A7A] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {domains.length === 0 && (
              <p className="text-sm text-[#7A7A7A] col-span-full">No domains added yet.</p>
            )}
          </div>
        </div>

        {/* ----------------- CATEGORIES SECTION ----------------- */}
        <div className="bg-white rounded-2xl p-6 md:p-8 w-full shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.03)' }}>
          <h2 className="text-xl font-semibold text-[#2B2B2B] mb-6 pb-4 border-b border-[#F3D6DC]/50">Categories</h2>
          
          {/* Add Category Form */}
          <form onSubmit={handleAddCategory} className="bg-[#FFF6F8] rounded-xl p-6 mb-8 border border-[#F3D6DC]">
            <h3 className="text-sm font-medium text-[#7A7A7A] uppercase tracking-wider mb-4">Add New Category</h3>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="relative group w-full md:w-48 shrink-0">
                <input 
                  type="file" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                  accept="image/*"
                  onChange={handleCategoryImageChange}
                  disabled={isAddingCategory}
                />
                <div className={`border-2 border-dashed ${categoryImagePreview ? 'border-[#F48CA8]' : 'border-[#F3D6DC] bg-white'} rounded-xl h-32 flex flex-col items-center justify-center text-center transition-colors group-hover:bg-[#FDE2E8]/50 overflow-hidden relative`}>
                  {categoryImagePreview ? (
                    <img src={categoryImagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <>
                      <ImageIcon className="h-6 w-6 text-[#E75480] mb-2" />
                      <span className="text-xs text-[#7A7A7A]">Upload Image</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex-1 w-full space-y-4">
                <select
                  value={selectedDomainForCategory}
                  onChange={(e) => setSelectedDomainForCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#F3D6DC] bg-white text-[#2B2B2B] placeholder-[#7A7A7A] focus:outline-none focus:ring-2 focus:ring-[#F48CA8]/50 transition-all text-sm"
                  required
                  disabled={isAddingCategory}
                >
                  <option value="" disabled>Select Domain</option>
                  {domains.map((d, i) => <option key={i} value={d.name}>{d.name}</option>)}
                </select>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Category Name (e.g., Earphones)"
                  className="w-full px-4 py-3 rounded-xl border border-[#F3D6DC] bg-white text-[#2B2B2B] placeholder-[#7A7A7A] focus:outline-none focus:ring-2 focus:ring-[#F48CA8]/50 transition-all text-sm"
                  required
                  disabled={isAddingCategory}
                />
                <button
                  type="submit"
                  disabled={isAddingCategory || domains.length === 0}
                  className="w-full bg-gray-900 hover:bg-black text-white font-medium py-3 px-6 rounded-xl shadow-sm transition-all text-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isAddingCategory ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Add Category'}
                </button>
              </div>
            </div>
          </form>

          {/* Uploaded Categories List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(category => (
              <div key={category.id} className="bg-white border border-[#F3D6DC] rounded-xl p-4 flex flex-col hover:shadow-md transition-shadow">
                {editingCategory?.id === category.id ? (
                  <form onSubmit={handleUpdateCategory} className="flex flex-col h-full gap-3">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => setEditCategoryImage(e.target.files?.[0] || null)}
                      className="text-xs text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:bg-[#FDE2E8] file:text-[#E75480] hover:file:bg-[#F3D6DC]"
                    />
                    <select
                      value={editCategoryDomain}
                      onChange={(e) => setEditCategoryDomain(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#F3D6DC] text-sm focus:outline-none focus:ring-1 focus:ring-[#E75480]"
                      required
                    >
                      {domains.map((d, i) => <option key={i} value={d.name}>{d.name}</option>)}
                    </select>
                    <input
                      type="text"
                      value={editCategoryName}
                      onChange={(e) => setEditCategoryName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#F3D6DC] text-sm focus:outline-none focus:ring-1 focus:ring-[#E75480]"
                      required
                    />
                    <div className="flex gap-2 mt-auto pt-2">
                      <button type="submit" disabled={isUpdatingCategory} className="flex-1 bg-gray-900 text-white py-1.5 rounded-lg text-xs flex items-center justify-center gap-1 hover:bg-black">
                        {isUpdatingCategory ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Save className="w-3 h-3"/> Save</>}
                      </button>
                      <button type="button" onClick={() => { setEditingCategory(null); setEditCategoryImage(null); }} className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs hover:bg-gray-200">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-lg bg-gray-50 flex-shrink-0 overflow-hidden border border-[#F3D6DC]/50">
                        {category.image ? (
                          <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-5 h-5 text-gray-300" /></div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-[#E75480] tracking-wider bg-[#FDE2E8] px-2 py-0.5 rounded-full w-fit mb-1">
                          {category.domain || 'Uncategorized'}
                        </span>
                        <h4 className="font-semibold text-[#2B2B2B] text-base leading-tight break-words">{category.name}</h4>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-auto pt-3 border-t border-[#F3D6DC]/50">
                      <button 
                        onClick={() => {
                          setEditingCategory(category);
                          setEditCategoryName(category.name);
                          setEditCategoryDomain(category.domain || domains[0]?.name || '');
                        }}
                        className="p-1.5 text-[#7A7A7A] hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteCategory(category)}
                        className="p-1.5 text-[#7A7A7A] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {categories.length === 0 && (
              <p className="text-sm text-[#7A7A7A] col-span-full">No categories added yet.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DomainManagement;
