// File upload using PHP API (direct file upload, not base64)
import { uploadFile as apiUploadFile, uploadMultipleFiles as apiUploadMultipleFiles, deleteFile as apiDeleteFile } from "@/lib/api/client";

/**
 * Upload file directly to server (not base64)
 * @param file - File to upload
 * @param path - Path (kept for compatibility, not used)
 * @param existingData - Not used anymore (kept for compatibility)
 */
export const uploadFile = async (
  file: File,
  path: string,
  existingData?: any
): Promise<string> => {
  try {
    // Direct file upload to PHP API
    const url = await apiUploadFile(file);
    return url;
  } catch (error: any) {
    throw new Error(error.message || "ফাইল আপলোড ব্যর্থ হয়েছে");
  }
};

/**
 * Delete file from server
 */
export const deleteFile = async (url: string): Promise<void> => {
  try {
    await apiDeleteFile(url);
  } catch (error: any) {
    // Log error but don't throw (file might already be deleted)
    console.warn("File deletion warning:", error.message);
  }
};

/**
 * Upload multiple files directly to server
 * @param files - Files to upload
 * @param basePath - Path (kept for compatibility, not used)
 * @param existingData - Not used anymore (kept for compatibility)
 */
export const uploadMultipleFiles = async (
  files: File[],
  basePath: string,
  existingData?: any
): Promise<string[]> => {
  try {
    const uploadedUrls = await apiUploadMultipleFiles(files);
    return uploadedUrls;
  } catch (error: any) {
    throw new Error(error.message || "ফাইল আপলোড ব্যর্থ হয়েছে");
  }
};

