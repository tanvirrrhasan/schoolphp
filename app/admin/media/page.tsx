"use client";

import MediaLibrary from "@/components/admin/MediaLibrary";

export default function MediaPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">গ্যালারি</h1>
        <p className="text-gray-600">ছবি আপলোড ও পরিচালনা করুন</p>
      </div>
      <MediaLibrary />
    </div>
  );
}

