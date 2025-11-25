/**
 * Calculate approximate size of an object in bytes (for Firestore)
 * Firestore counts strings by their UTF-8 encoded byte length
 */
export const calculateObjectSize = (obj: any): number => {
  if (obj === null || obj === undefined) {
    return 0;
  }

  if (typeof obj === "string") {
    // Firestore counts strings by UTF-8 byte length
    // Base64 strings are stored as strings, so count the string length
    return new TextEncoder().encode(obj).length;
  }

  if (typeof obj === "number") {
    return 8; // Numbers are 8 bytes
  }

  if (typeof obj === "boolean") {
    return 1; // Booleans are 1 byte
  }

  if (obj instanceof Date) {
    return 8; // Timestamps are 8 bytes
  }

  if (Array.isArray(obj)) {
    return obj.reduce((sum, item) => sum + calculateObjectSize(item), 0);
  }

  if (typeof obj === "object") {
    let size = 0;
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && !key.startsWith("_temp")) {
        // Key size (UTF-8 encoded)
        size += new TextEncoder().encode(key).length;
        // Value size
        size += calculateObjectSize(obj[key]);
      }
    }
    return size;
  }

  return 0;
};

/**
 * Compress image to base64 and ensure it fits within available space
 */
export const compressImageToBase64 = (
  file: File,
  maxSizeKB: number = 1000,
  availableSpaceKB?: number
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    // Use available space if provided, otherwise use maxSizeKB
    const targetSizeKB = availableSpaceKB
      ? Math.min(availableSpaceKB - 10, maxSizeKB) // Leave 10KB buffer
      : maxSizeKB;

    if (targetSizeKB <= 0) {
      reject(new Error("পর্যাপ্ত জায়গা নেই। কিছু ডেটা মুছে ফেলুন।"));
      return;
    }

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Start with reasonable dimensions
        const maxDimension = 1920;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          } else {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context not available"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Try different quality levels to fit within target size
        let quality = 0.9;
        let base64 = canvas.toDataURL("image/jpeg", quality);
        let sizeKB = base64.length / 1024; // Base64 string length in KB

        // Reduce quality if needed
        while (sizeKB > targetSizeKB && quality > 0.1) {
          quality -= 0.1;
          base64 = canvas.toDataURL("image/jpeg", quality);
          sizeKB = base64.length / 1024;
        }

        // If still too large, reduce dimensions progressively
        if (sizeKB > targetSizeKB) {
          let attempts = 0;
          while (sizeKB > targetSizeKB && attempts < 10) {
            width = Math.floor(width * 0.85);
            height = Math.floor(height * 0.85);
            
            if (width < 100 || height < 100) {
              // Too small, use minimum quality
              quality = 0.1;
              canvas.width = width;
              canvas.height = height;
              ctx.drawImage(img, 0, 0, width, height);
              base64 = canvas.toDataURL("image/jpeg", quality);
              sizeKB = base64.length / 1024;
              break;
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            quality = 0.7;
            base64 = canvas.toDataURL("image/jpeg", quality);
            sizeKB = base64.length / 1024;

            // Fine-tune quality
            while (sizeKB > targetSizeKB && quality > 0.1) {
              quality -= 0.05;
              base64 = canvas.toDataURL("image/jpeg", quality);
              sizeKB = base64.length / 1024;
            }

            attempts++;
          }
        }

        // Final check
        if (sizeKB > targetSizeKB) {
          reject(
            new Error(
              `ছবিটি ${targetSizeKB.toFixed(0)}KB-এর মধ্যে compress করা যায়নি। ছোট ছবি ব্যবহার করুন।`
            )
          );
          return;
        }

        resolve(base64);
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };

      if (typeof e.target?.result === "string") {
        img.src = e.target.result;
      } else {
        reject(new Error("Failed to read file"));
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Convert file to base64 (for non-image files)
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to convert file to base64"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
};

/**
 * Check if file is an image
 */
export const isImageFile = (file: File): boolean => {
  return file.type.startsWith("image/");
};

