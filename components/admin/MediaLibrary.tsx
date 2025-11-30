"use client";

import { useState, useRef, useEffect } from "react";
import { uploadFile } from "@/lib/firebase/storage";
import {
  getDocument,
  setDocument,
  subscribeToCollection,
} from "@/lib/firebase/firestore";
import { X, Upload, Image as ImageIcon, File, FileText } from "lucide-react";

interface MediaLibraryProps {
  onSelect?: (url: string) => void;
  multiple?: boolean;
}

export default function MediaLibrary({ onSelect, multiple = false }: MediaLibraryProps) {
  const [files, setFiles] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [brokenThumbs, setBrokenThumbs] = useState<Record<string, boolean>>({});
  const isUploadingRef = useRef(false);

  const isImageUrl = (url: string) =>
    url.startsWith("data:image/") ||
    url.match(/\.(jpg|jpeg|png|gif|webp)$/i);

  useEffect(() => {
    // Load gallery images from settings_homepage
    const loadMedia = async () => {
      try {
        const homepageData = await getDocument("settings", "homepage") as any;
        if (homepageData?.gallery) {
          const galleryImages = homepageData.gallery.filter((url: string) => isImageUrl(url));
          setFiles(galleryImages);
        }
      } catch (error) {
        console.log("Gallery not found, will be created on first upload");
      }
    };

    loadMedia();

    // Subscribe to real-time updates from settings
    const unsubscribe = subscribeToCollection("settings", (docs) => {
      // Don't update during upload to prevent clearing
      if (isUploadingRef.current) return;
      
      const homepageData = docs.find((doc: any) => doc.id === "homepage");
      if (homepageData?.gallery && Array.isArray(homepageData.gallery)) {
        const galleryImages = homepageData.gallery.filter((url: string) => isImageUrl(url));
        // Always update with the latest data from database
        setFiles(galleryImages);
        setBrokenThumbs((prev) => {
          const next: Record<string, boolean> = {};
          galleryImages.forEach((url: string) => {
            if (prev[url]) {
              next[url] = true;
            }
          });
          return next;
        });
      } else if (homepageData && !homepageData.gallery) {
        // If homepage exists but no gallery field, set empty array only if we don't have files
        if (files.length === 0) {
          setFiles([]);
          setBrokenThumbs({});
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    // Filter only image files
    const imageFiles = Array.from(selectedFiles).filter((file) =>
      file.type.startsWith("image/")
    );

    if (imageFiles.length === 0) {
      alert("শুধুমাত্র ছবি আপলোড করা যাবে");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setUploading(true);
    isUploadingRef.current = true;
    try {
      // Load existing gallery images from settings_homepage
      const homepageData = await getDocument("settings", "homepage") as any;
      const baseFiles = Array.isArray(homepageData?.gallery)
        ? homepageData.gallery.filter((url: string) => isImageUrl(url))
        : [];

      const newlyUploaded: string[] = [];

      for (const [index, file] of imageFiles.entries()) {
        const path = `gallery/${Date.now()}_${index}_${file.name}`;
        const snapshotData = { files: [...baseFiles, ...newlyUploaded] };
        const url = await uploadFile(file, path, snapshotData);
        newlyUploaded.push(url);
      }

      const newFiles = [...baseFiles, ...newlyUploaded];

      // Save to settings_homepage.gallery (for public gallery display)
      await setDocument("settings", "homepage", {
        id: "homepage",
        sliderImages: homepageData?.sliderImages || [],
        featuredSections: homepageData?.featuredSections || [],
        gallery: newFiles,
      });

      // Update state immediately after successful save
      setFiles(newFiles);
      setBrokenThumbs({});
      
      // Wait a bit before allowing subscription updates
      setTimeout(() => {
        isUploadingRef.current = false;
        // Re-fetch to ensure we have the latest data
        getDocument("settings", "homepage").then((data: any) => {
          if (data?.gallery) {
            const galleryImages = data.gallery.filter((url: string) => isImageUrl(url));
            setFiles(galleryImages);
          }
        }).catch(() => {});
      }, 1000);
    } catch (error: any) {
      alert(error.message || "ফাইল আপলোড ব্যর্থ হয়েছে");
      isUploadingRef.current = false;
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async (url: string) => {
    if (!confirm("আপনি কি এই ফাইলটি মুছে ফেলতে চান?")) return;
    
    const newFiles = files.filter((f) => f !== url);
    
    try {
      // Remove from settings_homepage.gallery
      const homepageData = await getDocument("settings", "homepage") as any;
      
      await setDocument("settings", "homepage", {
        id: "homepage",
        sliderImages: homepageData?.sliderImages || [],
        featuredSections: homepageData?.featuredSections || [],
        gallery: newFiles,
      });

      // Update state immediately
      setFiles(newFiles);
      
      // Re-fetch after a short delay to ensure consistency
      setTimeout(() => {
        getDocument("settings", "homepage").then((data: any) => {
          if (data?.gallery) {
            const galleryImages = data.gallery.filter((url: string) => isImageUrl(url));
            setFiles(galleryImages);
          }
        }).catch(() => {});
      }, 500);
    } catch (error: any) {
      alert(error.message || "ফাইল মুছে ফেলা ব্যর্থ হয়েছে");
    }
  };

  const getFileIcon = (url: string) => {
    // Check if it's base64 image
    if (url.startsWith("data:image/")) {
      return <ImageIcon className="text-blue-500" size={24} />;
    } else if (url.startsWith("data:application/pdf")) {
      return <FileText className="text-red-500" size={24} />;
    } else if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return <ImageIcon className="text-blue-500" size={24} />;
    } else if (url.match(/\.(pdf)$/i)) {
      return <FileText className="text-red-500" size={24} />;
    }
    return <File className="text-gray-500" size={24} />;
  };

  // Filter to only show images
  const imageFiles = files.filter((url) => isImageUrl(url));

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">গ্যালারি</h2>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
          >
            <Upload size={20} />
            {uploading ? "আপলোড হচ্ছে..." : "ছবি আপলোড করুন"}
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {imageFiles.map((url, index) => (
          <div
            key={index}
            className="relative group border rounded-lg p-2 hover:shadow-md transition-shadow bg-white"
          >
            <div
              className="aspect-square flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden"
              style={{ aspectRatio: "1 / 1" }}
            >
              {!brokenThumbs[url] ? (
                <img
                  src={url}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={() =>
                    setBrokenThumbs((prev) => ({
                      ...prev,
                      [url]: true,
                    }))
                  }
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 text-gray-500 text-sm p-4 text-center">
                  <ImageIcon className="text-blue-500" size={24} />
                  <span className="line-clamp-2 break-all text-xs">
                    Image preview unavailable
                  </span>
                </div>
              )}
            </div>
            {/* Always visible delete button in top-right corner */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(url);
              }}
              className="absolute top-3 right-3 p-1.5 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-colors z-10"
              aria-label="Delete image"
            >
              <X size={14} />
            </button>
            {onSelect && (
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(url);
                  }}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  নির্বাচন করুন
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {imageFiles.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Upload size={48} className="mx-auto mb-4 opacity-50" />
          <p>কোনো ছবি নেই। ছবি আপলোড করুন।</p>
        </div>
      )}
    </div>
  );
}

