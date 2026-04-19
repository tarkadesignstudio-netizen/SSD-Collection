import React, { useState } from 'react';
import { Upload, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isAdmin } from '../constants/auth';
import { uploadToCloudinary } from '../utils/cloudinary';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../database/firebase';

const AddCategoryForm: React.FC = () => {
  const { user } = useAuth();
  const [categoryName, setCategoryName] = useState('');
  const [categoryImage, setCategoryImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCategoryImage(file);
      // Create a local URL for the preview (mocking upload)
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
    }
  };

  const handleReset = () => {
    setCategoryName('');
    setCategoryImage(null);
    setImagePreview('');
    setShowSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin(user)) {
      throw new Error("Unauthorized access");
    }
    if (!categoryName) return;
    
    setIsUploading(true);
    
    try {
      let imageUrl = undefined;
      if (categoryImage) {
        imageUrl = await uploadToCloudinary(categoryImage);
      }

      await addDoc(collection(db, "categories"), {
        name: categoryName,
        image: imageUrl || null,
        createdAt: new Date()
      });

      setShowSuccess(true);
      setTimeout(() => {
        handleReset();
      }, 2000);
    } catch (error) {
      console.error("Error adding category:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex-1 px-4 md:px-8 lg:px-12 py-8 min-h-[calc(100vh-80px)] overflow-y-auto w-full">
      <div className="max-w-3xl mx-auto w-full">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#2B2B2B] mb-2">Add Category</h1>
          <p className="text-[#7A7A7A] text-sm">Create a new category for your products</p>
        </div>

        {/* Center Card */}
        <div 
          className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-xl mx-auto"
          style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.05)' }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[#2B2B2B]">Add Category Form</h2>
            {showSuccess && (
              <span className="flex items-center text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                <CheckCircle2 className="w-4 h-4 mr-1" /> Added successfully
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload Box */}
            <div className="relative group">
              <input 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                accept="image/*"
                onChange={handleImageChange}
                disabled={isUploading}
              />
              <div 
                className={`border-2 border-dashed ${imagePreview ? 'border-[#F48CA8]' : 'border-[#F3D6DC]'} rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors group-hover:bg-[#FFF6F8] overflow-hidden relative`}
                style={{ minHeight: '200px' }}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity" />
                ) : (
                  <>
                    <div className="bg-[#FDE2E8]/50 p-3 rounded-full mb-4">
                      <Upload className="h-8 w-8 text-[#E75480]" />
                    </div>
                    <p className="text-[#2B2B2B] font-medium text-sm mb-1">Drag & Drop Category Image Here</p>
                    <p className="text-[#7A7A7A] text-xs">or Click to Browse</p>
                  </>
                )}
                {imagePreview && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 text-white font-medium drop-shadow-md">
                    <Upload className="h-8 w-8 mb-2" />
                    <span>Change Image</span>
                  </div>
                )}
              </div>
            </div>

            {/* Input Fields */}
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Category Name"
                  className="w-full px-4 py-3 rounded-xl border border-[#F3D6DC] bg-white text-[#2B2B2B] placeholder-[#7A7A7A] focus:outline-none focus:ring-2 focus:ring-[#F48CA8]/50 focus:border-[#F48CA8] transition-all text-sm"
                  required
                  disabled={isUploading}
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-4 pt-2">
              <button
                type="submit"
                disabled={isUploading}
                className="flex-1 bg-gradient-to-r from-[#F48CA8] to-[#E75480] text-white font-medium py-3 px-6 rounded-xl shadow-sm hover:scale-[1.02] transition-transform duration-200 text-sm disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed"
              >
                {isUploading ? 'Uploading...' : 'Save Category'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCategoryForm;
