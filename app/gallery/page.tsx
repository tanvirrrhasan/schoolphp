"use client";

import { useEffect, useState } from "react";
import PublicPageShell from "@/components/public/PublicPageShell";
import { subscribeToCollection } from "@/lib/firebase/firestore";

type MediaDocument = {
  id: string;
  files?: string[];
};

export default function GalleryPage() {
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToCollection("media", (docs) => {
      const library = docs.find((doc: MediaDocument) => doc.id === "library");
      if (library?.files) {
        setImages(library.files.filter((url) => url.startsWith("data:image/")));
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
              <div
                key={`${url}-${index}`}
                className="aspect-square bg-gray-200 rounded-lg overflow-hidden"
              >
                <img
                  src={url}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </PublicPageShell>
  );
}


