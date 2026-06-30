import React, { useState, useEffect } from 'react';
import { X, Upload, Trash2, Star, Loader2, Save } from 'lucide-react';
import { doc, updateDoc, getDocs, collection } from 'firebase/firestore';
import { db } from '../database/firebase';
import { uploadToCloudinary } from '../utils/cloudinary';
import type { Product, ProductImage } from '../data/products';
import type { Category } from '../data/categories';

interface EditProductModalProps {
  isOpen: boolean;
  product: Product;
  onClose: () => void;
  onUpdate: () => void;
}

const EditProductModal: React.FC<EditProductModalProps> = ({ isOpen, product, onClose, onUpdate }) => {
  const [productName, setProductName] = useState(product.name);
  const [sellingPrice, setSellingPrice] = useState(product.sellingPrice?.toString() || product.price?.toString() || '');
  const [mrp, setMrp] = useState(product.mrp?.toString() || '');
  const [description, setDescription] = useState(product.description || '');
  const [productCategory, setProductCategory] = useState(product.category || '');
  const [hidden, setHidden] = useState(product.hidden || false);
  const [outOfStock, setOutOfStock] = useState(product.outOfStock || false);
  
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize images from product, fallback to single legacy image if needed
  const initialImages: ProductImage[] = product.images 
    ? [...product.images] 
    : product.image 
      ? [{ url: product.image, isPrimary: true }] 
      : [];

  const [images, setImages] = useState<ProductImage[]>(initialImages);

  useEffect(() => {
    if (isOpen) {
      const loadCategories = async () => {
        try {
          const snapshot = await getDocs(collection(db, "categories"));
          const loaded = snapshot.docs.map(d => d.data() as Category);
          setCategories(loaded);
        } catch (error) {
          console.error("Error loading categories:", error);
        }
      };
      loadCategories();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // --- IMAGE MANAGEMENT ---

  const handleUploadNewImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    // Support multiple file uploads
    const files = Array.from(e.target.files);
    
    try {
      setIsUploading(true);
      const uploadPromises = files.map(f => uploadToCloudinary(f));
      const urls = await Promise.all(uploadPromises);
      
      const newImages = [...images];
      urls.forEach(url => {
        // If it's the first image, make it primary automatically
        if (newImages.length === 0) {
          newImages.push({ url, isPrimary: true });
        } else {
          newImages.push({ url, isPrimary: false });
        }
      });
      
      setImages(newImages);
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSetPrimary = (urlToSet: string) => {
    const updatedImages = images.map(img => ({
      ...img,
      isPrimary: img.url === urlToSet
    }));
    
    if (!updatedImages.find(i => i.isPrimary) && updatedImages.length > 0) {
      updatedImages[0].isPrimary = true;
    }
    setImages(updatedImages);
  };

  const handleDeleteImage = (urlToDelete: string) => {
    if (!window.confirm("Delete this image? Note: Changes are saved only when you click Save Changes.")) return;
    
    const updatedImages = images.filter(img => img.url !== urlToDelete);
    
    const hadPrimary = updatedImages.find(img => img.isPrimary);
    if (!hadPrimary && updatedImages.length > 0) {
      updatedImages[0].isPrimary = true;
    }
    setImages(updatedImages);
  };

  // --- SAVE PRODUCT ---

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Find the domain automatically from the chosen category
      const selectedCategoryObj = categories.find(c => c.name === productCategory);
      const updatedDomain = selectedCategoryObj?.domain || product.domain || '';

      const updatedData: Partial<Product> = {
        name: productName,
        sellingPrice: Number(sellingPrice),
        category: productCategory,
        domain: updatedDomain, // Automatically updated
        description: description,
        images: images,
        hidden: hidden,
        outOfStock: outOfStock
      };

      if (mrp) updatedData.mrp = Number(mrp);

      // Legacy fallback
      if (images.length > 0) {
        const primary = images.find(img => img.isPrimary);
        updatedData.image = primary ? primary.url : images[0].url;
      }

      const productRef = doc(db, "products", product.id);
      await updateDoc(productRef, updatedData);
      
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Failed to save product", error);
      alert("Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const groupedCategories = categories.reduce((acc, cat) => {
    const d = cat.domain || 'Uncategorized';
    if (!acc[d]) acc[d] = [];
    acc[d].push(cat);
    return acc;
  }, {} as Record<string, Category[]>);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal Container */}
      <div className="relative bg-[#FFF6F8] rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#F3D6DC] bg-white sticky top-0 z-20">
          <div>
            <h2 className="text-xl font-bold text-[#2B2B2B]">Edit Product</h2>
            <p className="text-sm text-[#7A7A7A] mt-1">{product.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleSave}
              disabled={isSaving || isUploading}
              className="bg-[#E75480] hover:bg-[#d8406c] text-white px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
            <button 
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-[#FDE2E8] text-[#7A7A7A] hover:text-[#E75480] transition-colors bg-white border border-[#F3D6DC]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1">
          <form id="edit-product-form" onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Column: Details & Status */}
            <div className="space-y-8">
              
              {/* Status Badges */}
              <div className="bg-white p-6 rounded-2xl border border-[#F3D6DC] shadow-sm">
                <h3 className="text-sm font-semibold text-[#2B2B2B] mb-4 uppercase tracking-wide">Product Status</h3>
                <div className="flex flex-col gap-4">
                  <label className="flex items-center justify-between cursor-pointer group">
                    <div className="flex flex-col">
                      <span className="text-[#2B2B2B] font-medium">Hide Product</span>
                      <span className="text-xs text-[#7A7A7A]">Product will not appear on the website</span>
                    </div>
                    <div className={`w-12 h-6 rounded-full transition-colors relative ${hidden ? 'bg-[#E75480]' : 'bg-gray-200'}`}>
                      <div className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-transform ${hidden ? 'left-7' : 'left-1'}`} />
                    </div>
                    <input type="checkbox" className="hidden" checked={hidden} onChange={(e) => setHidden(e.target.checked)} />
                  </label>

                  <div className="w-full h-px bg-[#F3D6DC]/50" />

                  <label className="flex items-center justify-between cursor-pointer group">
                    <div className="flex flex-col">
                      <span className="text-[#2B2B2B] font-medium">Out of Stock</span>
                      <span className="text-xs text-[#7A7A7A]">Show out of stock badge, disable purchases</span>
                    </div>
                    <div className={`w-12 h-6 rounded-full transition-colors relative ${outOfStock ? 'bg-orange-500' : 'bg-gray-200'}`}>
                      <div className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-transform ${outOfStock ? 'left-7' : 'left-1'}`} />
                    </div>
                    <input type="checkbox" className="hidden" checked={outOfStock} onChange={(e) => setOutOfStock(e.target.checked)} />
                  </label>
                </div>
              </div>

              {/* Details Form */}
              <div className="bg-white p-6 rounded-2xl border border-[#F3D6DC] shadow-sm space-y-4">
                <h3 className="text-sm font-semibold text-[#2B2B2B] mb-4 uppercase tracking-wide">Product Details</h3>
                
                <div>
                  <label className="block text-xs font-medium text-[#7A7A7A] mb-1">Product Name</label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#F3D6DC] focus:outline-none focus:ring-2 focus:ring-[#F48CA8]/50 focus:border-[#F48CA8] transition-all text-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#7A7A7A] mb-1">Selling Price (₹)</label>
                    <input
                      type="number"
                      value={sellingPrice}
                      onChange={(e) => setSellingPrice(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#F3D6DC] focus:outline-none focus:ring-2 focus:ring-[#F48CA8]/50 focus:border-[#F48CA8] transition-all text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#7A7A7A] mb-1">MRP (₹)</label>
                    <input
                      type="number"
                      value={mrp}
                      onChange={(e) => setMrp(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#F3D6DC] focus:outline-none focus:ring-2 focus:ring-[#F48CA8]/50 focus:border-[#F48CA8] transition-all text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#7A7A7A] mb-1">Category</label>
                  <select
                    value={productCategory}
                    onChange={(e) => setProductCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#F3D6DC] focus:outline-none focus:ring-2 focus:ring-[#F48CA8]/50 focus:border-[#F48CA8] transition-all text-sm"
                    required
                  >
                    <option value="" disabled>Select Category</option>
                    {Object.entries(groupedCategories).map(([domain, cats]) => (
                      <optgroup key={domain} label={`Domain: ${domain}`}>
                        {cats.map((category, index) => (
                          <option key={index} value={category.name}>{category.name}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <p className="text-[10px] text-[#7A7A7A] mt-1 italic">Domain will be automatically linked to this category.</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#7A7A7A] mb-1">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#F3D6DC] focus:outline-none focus:ring-2 focus:ring-[#F48CA8]/50 focus:border-[#F48CA8] transition-all text-sm resize-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Images */}
            <div className="bg-white p-6 rounded-2xl border border-[#F3D6DC] shadow-sm">
              <h3 className="text-sm font-semibold text-[#2B2B2B] mb-4 uppercase tracking-wide">Manage Images</h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {images.map((img, idx) => (
                  <div 
                    key={idx} 
                    className={`relative group bg-gray-50 rounded-xl overflow-hidden border-2 transition-all aspect-square ${
                      img.isPrimary ? 'border-[#E75480] shadow-md shadow-[#F48CA8]/30' : 'border-[#F3D6DC]'
                    }`}
                  >
                    <img src={img.url} alt={`Product ${idx}`} className="w-full h-full object-cover" />
                    
                    {img.isPrimary && (
                      <div className="absolute top-2 left-2 bg-[#E75480] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                        <Star className="w-3 h-3 fill-white" /> Primary
                      </div>
                    )}

                    <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        type="button"
                        onClick={() => handleSetPrimary(img.url)}
                        disabled={img.isPrimary}
                        className="text-white hover:text-[#F48CA8] disabled:opacity-50 transition-colors p-1"
                        title="Set as Primary"
                      >
                        <Star className={`w-4 h-4 ${img.isPrimary ? 'fill-[#E75480] text-[#E75480]' : ''}`} />
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleDeleteImage(img.url)}
                        className="text-white hover:text-red-400 transition-colors p-1"
                        title="Delete Image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Upload Button */}
                <div className="relative group aspect-square">
                  <input 
                    type="file" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed" 
                    accept="image/*"
                    multiple
                    onChange={handleUploadNewImage}
                    disabled={isUploading || images.length >= 10}
                  />
                  <div className={`w-full h-full border-2 border-dashed border-[#F3D6DC] rounded-xl flex flex-col items-center justify-center text-center transition-colors group-hover:bg-[#FFF6F8] bg-gray-50/50 ${images.length >= 10 ? 'opacity-50' : ''}`}>
                    {isUploading ? (
                      <Loader2 className="w-6 h-6 text-[#E75480] animate-spin" />
                    ) : (
                      <>
                        <div className="bg-white p-2 rounded-full mb-2 shadow-sm border border-[#F3D6DC]">
                          <Upload className="h-5 w-5 text-[#E75480]" />
                        </div>
                        <p className="text-[#2B2B2B] font-medium text-xs">Add Images</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {images.length === 0 && !isUploading && (
                <div className="mt-4 p-4 bg-orange-50 border border-orange-200 text-orange-600 text-sm rounded-xl text-center">
                  Warning: No images attached. Please upload at least one image.
                </div>
              )}
            </div>
            
          </form>
        </div>

      </div>
    </div>
  );
};

export default EditProductModal;
