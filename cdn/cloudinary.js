import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

export const uploadonCloudinary = async (fileBuffer, mimeType) => {
   if (!fileBuffer) return null;
  // Configuration
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
  });
  try {
    // Upload an image
    const base64Data = Buffer.from(fileBuffer).toString('base64');
    const dataURI = `data:${mimeType};base64,${base64Data}`;
    
    // Upload to Cloudinary using buffer
    const uploadResult = await cloudinary.uploader.upload(dataURI, {
      resource_type: "image", // Specify "image" to apply image-specific transformations
      transformation: [
        { quality: "auto" },         // Compress intelligently
        { fetch_format: "auto" },    // Convert to best format
      ],
    });
    
    return uploadResult;
  } catch (error) {
    console.error("Error Uploading File", error);
    return null;
  }
};
export const deleteFromCloudinary = async (fileID) => {
    if(!fileID) return;
  // Configuration
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
  });
  try {
    // Upload an image
    const result = await cloudinary.uploader.destroy(fileID)

    return result;
  } catch (error) {
    console.error("Error Deleting File", error);
    return null;
  }
};
