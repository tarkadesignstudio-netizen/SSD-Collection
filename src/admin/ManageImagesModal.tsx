import React, { useState } from 'react';
import { X, Upload, Trash2, Star, Loader2 } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../database/firebase';
import { uploadToCloudinary } from '../utils/cloudinary';
import type { Product, ProductImage } from '../data/products';

interface ManageImagesModalProps {
  isOpen: boolean;
  product: Product;
  onClose: () => void;
  onUpdate: () => void;
}

const ManageImagesModal: React.FC<ManageImagesModalProps> = ({ isOpen, product, onClose, onUpdate }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize images from product, fallback to single legacy image if needed
  const initialImages: ProductImage[] = product.images 
    ? [...product.images] 
    : product.image 
      ? [{ url: product.image, isPrimary: true }] 
      : [];

  const [images, setImages] = useState<ProductImage[]>(initialImages);

  if (!isOpen) return null;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    try {
      setIsUploading(true);
      const url = await uploadToCloudinary(file);
      
      const newImages = [...images];
      // If it's the first image, make it primary automatically
      if (newImages.length === 0) {
        newImages.push({ url, isPrimary: true });
      } else {
        newImages.push({ url, isPrimary: false });
      }
      
      setImages(newImages);
      await saveToFirestore(newImages);
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSetPrimary = async (urlToSet: string) => {
    setIsSaving(true);
    const updatedImages = images.map(img => ({
      ...img,
      isPrimary: img.url === urlToSet
    }));
    
    // Ensure at least one primary exists
    if (!updatedImages.find(i => i.isPrimary) && updatedImages.length > 0) {
      updatedImages[0].isPrimary = true;
    }

    setImages(updatedImages);
    await saveToFirestore(updatedImages);
    setIsSaving(false);
  };

  const handleDelete = async (urlToDelete: string) => {
    if (!window.confirm("Delete this image?")) return;
    
    setIsSaving(true);
    const updatedImages = images.filter(img => img.url !== urlToDelete);
    
    // Re-assign primary if we deleted the primary
    const hadPrimary = updatedImages.find(img => img.isPrimary);
    if (!hadPrimary && updatedImages.length > 0) {
      updatedImages[0].isPrimary = true;
    }

    setImages(updatedImages);
    await saveToFirestore(updatedImages);
    setIsSaving(false);
  };

  const saveToFirestore = async (updatedImages: ProductImage[]) => {
    try {
      const productRef = doc(db, "products", product.id);
      await updateDoc(productRef, {
        images: updatedImages
      });
      onUpdate(); // Refresh parent view
    } catch (error) {
      console.error("Failed to update product images", error);
      alert("Failed to save changes.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-[#FFF6F8] rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-[#F3D6DC] bg-white">
          <div>
            <h2 className="text-xl font-bold text-[#2B2B2B]">Manage Images</h2>
            <p className="text-sm text-[#7A7A7A] mt-1">{product.name}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#FFF6F8] text-[#7A7A7A] hover:text-[#E75480] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 md:px-8 overflow-y-auto flex-1">
          {images.length === 0 && !isUploading && (
            <div className="text-center py-12 text-[#7A7A7A]">
              No images uploaded yet. Upload your first product image!
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {images.map((img, idx) => (
              <div 
                key={idx} 
                className={`relative group bg-white rounded-2xl overflow-hidden border-2 transition-all ${
                  img.isPrimary ? 'border-[#E75480] shadow-md shadow-[#F48CA8]/30' : 'border-[#F3D6DC]'
                }`}
              >
                <div className="aspect-square bg-gray-100 relative">
                  <img src={img.url} alt={`Product ${idx}`} className="w-full h-full object-cover" />
                  
                  {/* Primary Badge */}
                  {img.isPrimary && (
                    <div className="absolute top-2 left-2 bg-[#E75480] text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                      <Star className="w-3 h-3 fill-white" /> Primary
                    </div>
                  )}

                  {/* Hover Actions */}
                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleSetPrimary(img.url)}
                      disabled={img.isPrimary || isSaving}
                      className="text-white hover:text-[#F48CA8] disabled:opacity-50 transition-colors"
                      title="Set as Primary"
                    >
                      <Star className={`w-5 h-5 ${img.isPrimary ? 'fill-[#E75480] text-[#E75480]' : ''}`} />
                    </button>
                    <button 
                      onClick={() => handleDelete(img.url)}
                      disabled={isSaving}
                      className="text-white hover:text-red-400 disabled:opacity-50 transition-colors"
                      title="Delete Image"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Upload Button */}
            <div className="relative group aspect-square">
              <input 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed" 
                accept="image/*"
                onChange={handleUpload}
                disabled={isUploading || isSaving || images.length >= 10}
              />
              <div className={`w-full h-full border-2 border-dashed border-[#F3D6DC] rounded-xl flex flex-col items-center justify-center text-center transition-colors group-hover:bg-white bg-[#FDE2E8]/30 ${images.length >= 10 ? 'opacity-50' : ''}`}>
                {isUploading ? (
                  <Loader2 className="w-8 h-8 text-[#E75480] animate-spin" />
                ) : (
                  <>
                    <div className="bg-white p-3 rounded-full mb-3 shadow-sm border border-[#F3D6DC]">
                      <Upload className="h-6 w-6 text-[#E75480]" />
                    </div>
                    <p className="text-[#2B2B2B] font-medium text-sm">Upload Image</p>
                    <p className="text-[#7A7A7A] text-[10px] mt-1 max-w-[80%]">Up to 10 images</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ManageImagesModal;
