export const uploadToCloudinary = async (file: File) => {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

  const res = await fetch(
    import.meta.env.VITE_CLOUDINARY_UPLOAD_URL,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await res.json();
  console.log("Cloudinary Response:", data);
  
  if (!res.ok) {
    throw new Error(data.error?.message || "Failed to upload image to Cloudinary");
  }

  return data.secure_url;
};
