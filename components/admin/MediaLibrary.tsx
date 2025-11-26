"use client";

import { useState, useRef, useEffect } from "react";
import { uploadFile } from "@/lib/firebase/storage";
import {
  getDocument,
  updateDocument,
  createDocument,
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

  useEffect(() => {
    // Load media library from Firestore
    const loadMedia = async () => {
      try {
        const data = await getDocument("media", "library");
        if (data && (data as any).files) {
          setFiles((data as any).files);
        }
      } catch (error) {
        // Media library doesn't exist yet, create it
        console.log("Media library not found, will be created on first upload");
      }
    };

    loadMedia();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToCollection("media", (docs) => {
      const mediaData = docs.find((doc: any) => doc.id === "library");
      if (mediaData && mediaData.files) {
        setFiles(mediaData.files);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(selectedFiles).map((file) => {
        const path = `media/${Date.now()}_${file.name}`;
        return uploadFile(file, path);
      });

      const urls = await Promise.all(uploadPromises);
      const newFiles = [...files, ...urls];

      // Save to Firestore
      try {
        await updateDocument("media", "library", { files: newFiles });
      } catch (error) {
        // Create if doesn't exist
        await createDocument("media", { id: "library", files: newFiles });
      }

      setFiles(newFiles);
    } catch (error: any) {
      alert(error.message || "ফাইল আপলোড ব্যর্থ হয়েছে");
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
      // Update Firestore
      try {
        await updateDocument("media", "library", { files: newFiles });
      } catch (error) {
        // Create if doesn't exist
        await createDocument("media", { id: "library", files: newFiles });
      }
      
      setFiles(newFiles);
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">মিডিয়া লাইব্রেরি</h2>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleUpload}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
          >
            <Upload size={20} />
            {uploading ? "আপলোড হচ্ছে..." : "ফাইল আপলোড করুন"}
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {files.map((url, index) => (
          <div
            key={index}
            className="relative group border rounded-lg p-2 hover:shadow-md transition-shadow"
          >
            <div className="aspect-square flex items-center justify-center bg-gray-50 rounded">
              {url.startsWith("data:image/") || url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                <img
                  src={url}
                  alt={`Media ${index + 1}`}
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                getFileIcon(url)
              )}
            </div>
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded flex items-center justify-center gap-2">
              {onSelect && (
                <button
                  onClick={() => onSelect(url)}
                  className="opacity-0 group-hover:opacity-100 px-3 py-1 bg-blue-600 text-white rounded text-sm"
                >
                  নির্বাচন করুন
                </button>
              )}
              <button
                onClick={() => handleDelete(url)}
                className="opacity-0 group-hover:opacity-100 p-1 bg-red-600 text-white rounded"
              >
                <X size={16} />
              </button>
            </div>
            <div className="mt-2 text-xs text-gray-600 truncate">
              {url.startsWith("data:") ? "Base64 Image" : url.split("/").pop()}
            </div>
          </div>
        ))}
      </div>

      {files.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Upload size={48} className="mx-auto mb-4 opacity-50" />
          <p>কোনো ফাইল নেই। ফাইল আপলোড করুন।</p>
        </div>
      )}
    </div>
  );
}

