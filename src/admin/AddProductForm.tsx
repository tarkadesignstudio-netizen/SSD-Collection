import React, { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';
import type { Category } from '../data/categories';
import { useAuth } from '../context/AuthContext';
import { isAdmin } from '../constants/auth';
import { uploadToCloudinary } from '../utils/cloudinary';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../database/firebase';

const AddProductForm: React.FC = () => {
  const { user } = useAuth();
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [file, setFile] = useState<File | null>(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!file) {
        alert("No file selected");
        return;
      }

      console.log("Logged user:", user);
      if (!isAdmin(user)) {
        alert("Unauthorized access");
        return;
      }

      if (!productName || !productPrice || !productCategory) {
        alert("Please fill all fields");
        return;
      }

      setIsUploading(true);

      console.log("Uploading image...");
      const imageUrl = await uploadToCloudinary(file);
      console.log("Cloudinary URL:", imageUrl);

      console.log("Saving product to Firestore...");
      try {
        await addDoc(collection(db, "products"), {
          name: productName,
          price: Number(productPrice),
          category: productCategory,
          image: imageUrl, // Legacy support
          images: [{ url: imageUrl, isPrimary: true }],
          createdAt: new Date()
        });
        console.log("Product saved successfully to Firestore");
      } catch (firestoreError) {
        console.error("Firestore error:", firestoreError);
        throw firestoreError; // rethrow to be caught by main catch block
      }

      alert("Product uploaded successfully!");
      setProductName('');
      setProductPrice('');
      setProductCategory('');
      setFile(null);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload product:\n" + (error instanceof Error ? error.message : JSON.stringify(error)));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex-1 px-4 md:px-8 lg:px-12 py-8 min-h-[calc(100vh-80px)] overflow-y-auto w-full">
      <div className="max-w-3xl mx-auto w-full">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#2B2B2B] mb-2">Add Product</h1>
          <p className="text-[#7A7A7A] text-sm">Upload and manage your products easily</p>
        </div>

        {/* Center Card */}
        <div 
          className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-xl mx-auto"
          style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.05)' }}
        >
          <h2 className="text-lg font-semibold text-[#2B2B2B] mb-6">Add Product Form</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload Box */}
            <div className="relative group">
              <input 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                disabled={isUploading}
              />
              <div className="border-2 border-dashed border-[#F3D6DC] rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors group-hover:bg-[#FFF6F8]">
                <div className="bg-[#FDE2E8]/50 p-3 rounded-full mb-4">
                  <Upload className="h-8 w-8 text-[#E75480]" />
                </div>
                <p className="text-[#2B2B2B] font-medium text-sm mb-1">{file ? file.name : "Drag & Drop Product Image Here"}</p>
                <p className="text-[#7A7A7A] text-xs">{file ? "Click to change" : "or Click to Browse"}</p>
              </div>
            </div>

            {/* Input Fields */}
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Product Name"
                  className="w-full px-4 py-3 rounded-xl border border-[#F3D6DC] bg-white text-[#2B2B2B] placeholder-[#7A7A7A] focus:outline-none focus:ring-2 focus:ring-[#F48CA8]/50 focus:border-[#F48CA8] transition-all text-sm"
                  required
                  disabled={isUploading}
                />
              </div>
              <div>
                <input
                  type="number"
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                  placeholder="Product Price (₹)"
                  className="w-full px-4 py-3 rounded-xl border border-[#F3D6DC] bg-white text-[#2B2B2B] placeholder-[#7A7A7A] focus:outline-none focus:ring-2 focus:ring-[#F48CA8]/50 focus:border-[#F48CA8] transition-all text-sm"
                  required
                  disabled={isUploading}
                />
              </div>
              <div>
                <select
                  value={productCategory}
                  onChange={(e) => setProductCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#F3D6DC] bg-white text-[#2B2B2B] placeholder-[#7A7A7A] focus:outline-none focus:ring-2 focus:ring-[#F48CA8]/50 focus:border-[#F48CA8] transition-all text-sm"
                  required
                  disabled={isUploading}
                >
                  <option value="" disabled>Select Category</option>
                  {categories.map((category, index) => (
                    <option key={index} value={category.name}>{category.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-4 pt-2">
              <button
                type="submit"
                disabled={isUploading}
                className="w-full bg-gradient-to-r from-[#F48CA8] to-[#E75480] text-white font-medium py-3 px-6 rounded-xl shadow-sm hover:scale-[1.02] transition-transform duration-200 text-sm disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed"
              >
                {isUploading ? "Uploading..." : "Upload Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProductForm;
