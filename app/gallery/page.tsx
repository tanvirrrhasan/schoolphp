"use client";

import { useEffect, useState } from "react";
import PublicPageShell from "@/components/public/PublicPageShell";
import { subscribeToCollection, getDocument } from "@/lib/firebase/firestore";

type HomepageSettings = {
  id: string;
  gallery?: string[];
};

export default function GalleryPage() {
  const [images, setImages] = useState<string[]>([]);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  // Helper function to check if URL is an image
  const isImageUrl = (url: string) =>
    url.startsWith("data:image/") ||
    url.match(/\.(jpg|jpeg|png|gif|webp)$/i);

  useEffect(() => {
    // Load initial data
    const loadGallery = async () => {
      try {
        const homepageData = await getDocument("settings", "homepage") as HomepageSettings | null;
        if (homepageData?.gallery) {
          setImages(homepageData.gallery.filter((url: string) => isImageUrl(url)));
        }
      } catch (error) {
        console.error("Gallery load error:", error);
      }
    };

    loadGallery();

    // Subscribe to changes
    const unsubscribe = subscribeToCollection("settings", (docs) => {
      const homepageData = docs.find((doc: any) => doc.id === "homepage") as HomepageSettings | undefined;
      if (homepageData?.gallery) {
        setImages(homepageData.gallery.filter((url: string) => isImageUrl(url)));
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <PublicPageShell backHref="/" backLabel="হোম">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">গ্যালারি</h1>
          <p className="text-gray-600">
            বিদ্যালয়ের বিভিন্ন কার্যক্রম, অনুষ্ঠান এবং বিশেষ মুহূর্তের ছবি সমূহ
          </p>
        </div>

        {images.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
            এখনও কোনো ছবি যোগ করা হয়নি
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((url, index) => (
              <button
                key={`${url}-${index}`}
                type="button"
                onClick={() => setActiveImage(url)}
                className="aspect-square bg-gray-200 rounded-lg overflow-hidden hover:opacity-90 transition-opacity cursor-pointer"
              >
                <img
                  src={url}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

      {activeImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80"
          onClick={() => setActiveImage(null)}
        >
          <button
            onClick={() => setActiveImage(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 text-2xl font-bold"
            aria-label="Close"
          >
            ✕
          </button>
          <img
            src={activeImage}
            alt="Full size"
            className="max-w-full max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
      </div>
    </PublicPageShell>
  );
}


