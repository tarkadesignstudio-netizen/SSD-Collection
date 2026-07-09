import React, { useState, useEffect } from 'react';
import { Upload, X, Loader2, Plus } from 'lucide-react';
import type { Category } from '../data/categories';
import type { ProductVariant } from '../data/products';
import { useAuth } from '../context/AuthContext';
import { isAdmin } from '../constants/auth';
import { uploadToCloudinary } from '../utils/cloudinary';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../database/firebase';

interface SelectedFile {
  file: File;
  preview: string;
}

const AddProductForm: React.FC = () => {
  const { user } = useAuth();
  const [productName, setProductName] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [mrp, setMrp] = useState('');
  const [description, setDescription] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState<Omit<ProductVariant, 'id'>[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const snapshot = await getDocs(collection(db, "categories"));
        const loaded = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Category[];
        setCategories(loaded);
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };

    loadCategories();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const newFiles = selectedFiles.map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (indexToRemove: number) => {
    setFiles(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[indexToRemove].preview);
      updated.splice(indexToRemove, 1);
      return updated;
    });
  };

  const addVariant = () => {
    setVariants([...variants, { name: '', quantity: 1, unit: 'ml', sellingPrice: 0, mrp: 0, outOfStock: false }]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: keyof Omit<ProductVariant, 'id'>, value: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (files.length === 0) {
        alert("Please select at least one image");
        return;
      }

      if (!isAdmin(user)) {
        alert("Unauthorized access");
        return;
      }

      if (!productName || !productCategory || !description) {
        alert("Please fill all required fields");
        return;
      }

      if (hasVariants && variants.length === 0) {
        alert("Please add at least one variant");
        return;
      }

      if (!hasVariants && !sellingPrice) {
        alert("Please enter a selling price");
        return;
      }

      setIsUploading(true);

      // 1. Upload all images concurrently
      console.log(`Uploading ${files.length} images...`);
      const uploadPromises = files.map(f => uploadToCloudinary(f.file));
      const imageUrls = await Promise.all(uploadPromises);

      const productImages = imageUrls.map((url, idx) => ({
        url,
        isPrimary: idx === 0 // First image is automatically primary
      }));

      // 2. Determine Domain automatically
      const selectedCategoryObj = categories.find(c => c.name === productCategory);
      const domainName = selectedCategoryObj?.domain || '';

      const finalSellingPrice = hasVariants ? Number(variants[0].sellingPrice) : Number(sellingPrice);
      const finalMrp = hasVariants ? (variants[0].mrp ? Number(variants[0].mrp) : undefined) : (mrp ? Number(mrp) : undefined);
      
      const finalVariants = variants.map(v => ({
        ...v,
        id: crypto.randomUUID(),
        sellingPrice: Number(v.sellingPrice),
        mrp: v.mrp ? Number(v.mrp) : undefined
      }));

      console.log("Saving product to Firestore...");
      try {
        const productData: any = {
          name: productName,
          sellingPrice: finalSellingPrice,
          category: productCategory,
          domain: domainName, // Automatically assigned domain
          description: description,
          image: imageUrls[0], // Legacy support for single image components
          images: productImages,
          hidden: false,
          outOfStock: false,
          createdAt: new Date()
        };
        
        if (finalMrp) {
          productData.mrp = finalMrp;
        }

        if (hasVariants) {
          productData.hasVariants = true;
          productData.variants = finalVariants;
        }

        await addDoc(collection(db, "products"), productData);
        console.log("Product saved successfully to Firestore");
      } catch (firestoreError) {
        console.error("Firestore error:", firestoreError);
        throw firestoreError; 
      }

      alert("Product uploaded successfully!");
      // Reset form
      setProductName('');
      setSellingPrice('');
      setMrp('');
      setDescription('');
      setProductCategory('');
      setHasVariants(false);
      setVariants([]);
      files.forEach(f => URL.revokeObjectURL(f.preview));
      setFiles([]);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload product:\n" + (error instanceof Error ? error.message : JSON.stringify(error)));
    } finally {
      setIsUploading(false);
    }
  };

  // Group categories by domain for better UI organization (optional but good for UX)
  const groupedCategories = categories.reduce((acc, cat) => {
    const d = cat.domain || 'Uncategorized';
    if (!acc[d]) acc[d] = [];
    acc[d].push(cat);
    return acc;
  }, {} as Record<string, Category[]>);

  return (
    <div className="flex-1 px-4 md:px-8 lg:px-12 py-8 min-h-[calc(100vh-80px)] overflow-y-auto w-full">
      <div className="max-w-4xl mx-auto w-full">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#2B2B2B] mb-2">Add Product</h1>
          <p className="text-[#7A7A7A] text-sm">Upload a new product with multiple images</p>
        </div>

        {/* Center Card */}
        <div 
          className="bg-white rounded-2xl p-6 md:p-8 w-full mx-auto"
          style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.05)' }}
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Image Upload Area */}
            <div>
              <h3 className="text-sm font-semibold text-[#2B2B2B] mb-3 uppercase tracking-wide">Product Images</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {files.map((file, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-[#F3D6DC] group">
                    <img src={file.preview} alt={`preview ${idx}`} className="w-full h-full object-cover" />
                    {idx === 0 && (
                      <div className="absolute top-2 left-2 bg-[#E75480] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                        Primary
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      disabled={isUploading}
                      className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-red-50 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {/* Upload Button */}
                <div className="relative aspect-square">
                  <input 
                    type="file" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed" 
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    disabled={isUploading}
                  />
                  <div className="w-full h-full border-2 border-dashed border-[#F3D6DC] rounded-xl flex flex-col items-center justify-center text-center transition-colors hover:bg-[#FFF6F8] bg-gray-50/50">
                    <div className="bg-white p-2 rounded-full mb-2 shadow-sm">
                      <Upload className="h-5 w-5 text-[#E75480]" />
                    </div>
                    <p className="text-[#2B2B2B] font-medium text-xs">Add Images</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Input Fields */}
            <div>
              <h3 className="text-sm font-semibold text-[#2B2B2B] mb-3 uppercase tracking-wide">Product Details</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Product Name"
                    className="w-full px-4 py-3 rounded-xl border border-[#F3D6DC] bg-white text-[#2B2B2B] placeholder-[#7A7A7A] focus:outline-none focus:ring-2 focus:ring-[#F48CA8]/50 focus:border-[#F48CA8] transition-all text-sm"
                    required
                    disabled={isUploading}
                  />
                  <select
                    value={productCategory}
                    onChange={(e) => setProductCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#F3D6DC] bg-white text-[#2B2B2B] placeholder-[#7A7A7A] focus:outline-none focus:ring-2 focus:ring-[#F48CA8]/50 focus:border-[#F48CA8] transition-all text-sm"
                    required
                    disabled={isUploading}
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
                </div>
                
                <div className="flex items-center gap-3 py-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={hasVariants}
                      onChange={(e) => setHasVariants(e.target.checked)}
                      disabled={isUploading}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#F48CA8]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E75480]"></div>
                  </label>
                  <span className="text-sm font-medium text-[#2B2B2B]">Enable Product Variants</span>
                </div>

                {!hasVariants ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="number"
                      value={mrp}
                      onChange={(e) => setMrp(e.target.value)}
                      placeholder="MRP (₹) - Optional"
                      className="w-full px-4 py-3 rounded-xl border border-[#F3D6DC] bg-white text-[#2B2B2B] placeholder-[#7A7A7A] focus:outline-none focus:ring-2 focus:ring-[#F48CA8]/50 focus:border-[#F48CA8] transition-all text-sm"
                      disabled={isUploading}
                    />
                    <input
                      type="number"
                      value={sellingPrice}
                      onChange={(e) => setSellingPrice(e.target.value)}
                      placeholder="Selling Price (₹)"
                      className="w-full px-4 py-3 rounded-xl border border-[#F3D6DC] bg-white text-[#2B2B2B] placeholder-[#7A7A7A] focus:outline-none focus:ring-2 focus:ring-[#F48CA8]/50 focus:border-[#F48CA8] transition-all text-sm"
                      required={!hasVariants}
                      disabled={isUploading}
                    />
                  </div>
                ) : (
                  <div className="space-y-4 border border-[#F3D6DC] rounded-xl p-4 bg-gray-50/30">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-[#2B2B2B]">Variant Management</h4>
                      <button
                        type="button"
                        onClick={addVariant}
                        disabled={isUploading}
                        className="flex items-center gap-1 text-xs font-bold text-[#E75480] bg-[#FFF5F7] px-3 py-1.5 rounded-lg hover:bg-[#F3D6DC] transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Variant
                      </button>
                    </div>
                    {variants.length === 0 ? (
                      <p className="text-xs text-gray-500 text-center py-4">No variants added. Click "Add Variant" to create one.</p>
                    ) : (
                      <div className="space-y-3">
                        {variants.map((v, idx) => (
                          <div key={idx} className="flex flex-wrap gap-2 items-start bg-white p-3 rounded-lg border border-gray-100 shadow-sm relative pt-4 md:pt-3">
                            <button
                              type="button"
                              onClick={() => removeVariant(idx)}
                              disabled={isUploading}
                              className="absolute -top-2 -right-2 bg-white border border-gray-200 text-red-500 rounded-full p-1 hover:bg-red-50 transition-colors shadow-sm"
                            >
                              <X className="w-3 h-3" />
                            </button>
                            <input
                              type="text"
                              value={v.name || ''}
                              onChange={(e) => updateVariant(idx, 'name', e.target.value)}
                              placeholder="Name (e.g. Small)"
                              className="w-full md:w-auto flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#F48CA8]"
                              disabled={isUploading}
                            />
                            <div className="flex w-full md:w-auto gap-2">
                              <input
                                type="number"
                                value={v.quantity || ''}
                                onChange={(e) => updateVariant(idx, 'quantity', Number(e.target.value))}
                                placeholder="Qty"
                                className="w-20 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#F48CA8]"
                                disabled={isUploading}
                                required
                              />
                              <input
                                type="text"
                                value={v.unit || ''}
                                onChange={(e) => updateVariant(idx, 'unit', e.target.value)}
                                placeholder="Unit"
                                className="w-20 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#F48CA8]"
                                disabled={isUploading}
                                required
                              />
                            </div>
                            <div className="flex w-full md:w-auto gap-2">
                              <input
                                type="number"
                                value={v.mrp || ''}
                                onChange={(e) => updateVariant(idx, 'mrp', Number(e.target.value))}
                                placeholder="MRP"
                                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#F48CA8]"
                                disabled={isUploading}
                              />
                              <input
                                type="number"
                                value={v.sellingPrice || ''}
                                onChange={(e) => updateVariant(idx, 'sellingPrice', Number(e.target.value))}
                                placeholder="Selling Price"
                                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#F48CA8]"
                                disabled={isUploading}
                                required
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description"
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-[#F3D6DC] bg-white text-[#2B2B2B] placeholder-[#7A7A7A] focus:outline-none focus:ring-2 focus:ring-[#F48CA8]/50 focus:border-[#F48CA8] transition-all text-sm resize-none"
                  required
                  disabled={isUploading}
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isUploading || files.length === 0}
                className="w-full bg-gradient-to-r from-[#F48CA8] to-[#E75480] text-white font-semibold py-4 px-6 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200 text-sm disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Upload Product"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProductForm;
