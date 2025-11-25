import {
  compressImageToBase64,
  fileToBase64,
  isImageFile,
  calculateObjectSize,
} from "@/lib/utils/imageCompression";

/**
 * Upload file as base64 (compressed if image)
 * @param file - File to upload
 * @param path - Path (not used for base64, kept for compatibility)
 * @param existingData - Existing document data to calculate available space
 */
export const uploadFile = async (
  file: File,
  path: string,
  existingData?: any
): Promise<string> => {
  try {
    const MAX_DOCUMENT_SIZE = 1024 * 1024; // 1MB in bytes
    let availableSpaceKB: number | undefined;

    if (existingData) {
      // Calculate current document size
      const currentSize = calculateObjectSize(existingData);
      const availableSpace = MAX_DOCUMENT_SIZE - currentSize;
      availableSpaceKB = availableSpace / 1024;

      if (availableSpaceKB < 10) {
        throw new Error(
          "পর্যাপ্ত জায়গা নেই। কিছু ডেটা মুছে ফেলুন বা ছোট ছবি ব্যবহার করুন।"
        );
      }
    }

    if (isImageFile(file)) {
      // Compress image to base64 (fit within available space or max 1MB)
      const base64 = await compressImageToBase64(
        file,
        1000,
        availableSpaceKB
      );
      return base64;
    } else {
      // For non-image files, convert to base64
      const base64 = await fileToBase64(file);
      // Check size
      const sizeKB = base64.length / 1024;
      const maxSize = availableSpaceKB || 1000;
      if (sizeKB > maxSize) {
        throw new Error(
          `ফাইল সাইজ ${maxSize.toFixed(0)}KB-এর বেশি হতে পারবে না`
        );
      }
      return base64;
    }
  } catch (error: any) {
    throw new Error(error.message || "ফাইল আপলোড ব্যর্থ হয়েছে");
  }
};

/**
 * Delete file (no-op for base64, but kept for compatibility)
 */
export const deleteFile = async (url: string): Promise<void> => {
  // Base64 is stored in database, no need to delete from storage
  // This function is kept for compatibility
  return;
};

/**
 * Upload multiple files as base64
 * @param files - Files to upload
 * @param basePath - Path (not used for base64, kept for compatibility)
 * @param existingData - Existing document data to calculate available space
 */
export const uploadMultipleFiles = async (
  files: File[],
  basePath: string,
  existingData?: any
): Promise<string[]> => {
  try {
    const MAX_DOCUMENT_SIZE = 1024 * 1024; // 1MB in bytes
    let currentData = existingData ? { ...existingData } : {};
    const uploadedUrls: string[] = [];

    for (const file of files) {
      // Calculate available space for this file
      const currentSize = calculateObjectSize(currentData);
      const availableSpace = MAX_DOCUMENT_SIZE - currentSize;
      const availableSpaceKB = availableSpace / 1024;

      if (availableSpaceKB < 10) {
        throw new Error(
          "পর্যাপ্ত জায়গা নেই। কিছু ফাইল আপলোড করা যায়নি।"
        );
      }

      // Upload file with available space constraint
      const url = await uploadFile(file, basePath, currentData);
      uploadedUrls.push(url);

      // Update current data to include this file for next iteration
      if (isImageFile(file)) {
        currentData = {
          ...currentData,
          _tempImage: url, // Temporary key to track size
        };
      } else {
        currentData = {
          ...currentData,
          _tempFile: url, // Temporary key to track size
        };
      }
    }

    return uploadedUrls;
  } catch (error: any) {
    throw new Error(error.message || "ফাইল আপলোড ব্যর্থ হয়েছে");
  }
};

