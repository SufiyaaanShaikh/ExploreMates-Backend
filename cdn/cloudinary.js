import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

export const uploadonCloudinary = async (file) => {
    if(!file) return;
  // Configuration
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
  });
  try {
    // Upload an image
    const uploadResult = await cloudinary.uploader.upload(file, {
      resource_type: "auto",
    });
    // console.log("File Uploaded", uploadResult);
    fs.unlinkSync(file);
    return uploadResult;
  } catch (error) {
    fs.unlinkSync(file);
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
