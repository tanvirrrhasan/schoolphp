"use client";

import MediaLibrary from "@/components/admin/MediaLibrary";

export default function MediaPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">মিডিয়া লাইব্রেরি</h1>
        <p className="text-gray-600">ছবি, ভিডিও, PDF এবং অন্যান্য ফাইল আপলোড ও পরিচালনা করুন</p>
      </div>
      <MediaLibrary />
    </div>
  );
}

