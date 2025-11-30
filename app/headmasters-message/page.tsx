"use client";

import { useEffect, useState } from "react";
import { getDocument } from "@/lib/firebase/firestore";
import { HeadSettings } from "@/types";
import PublicPageShell from "@/components/public/PublicPageShell";

export default function HeadmastersMessagePage() {
  const [headSettings, setHeadSettings] = useState<HeadSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHeadSettings = async () => {
      try {
        const headData = await getDocument("settings", "head");
        if (headData) {
          setHeadSettings(headData as HeadSettings);
        }
      } catch (error) {
        console.error("Head settings load error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadHeadSettings();
  }, []);

  if (loading) {
    return (
      <PublicPageShell backHref="/" backLabel="হোম">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </PublicPageShell>
    );
  }

  if (!headSettings) {
    return (
      <PublicPageShell backHref="/" backLabel="হোম">
        <div className="container mx-auto px-4 py-12">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">প্রধান শিক্ষকের বার্তা পাওয়া যায়নি</p>
          </div>
        </div>
      </PublicPageShell>
    );
  }

  const headQuote = headSettings.quoteBn || headSettings.quote || "";

  return (
    <PublicPageShell backHref="/" backLabel="হোম">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-start gap-8 mb-8">
              {headSettings.photo && (
                <img
                  src={headSettings.photo}
                  alt={headSettings.name || headSettings.nameBn}
                  className="w-48 h-48 md:w-64 md:h-64 rounded-2xl object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
                  {headSettings.name || headSettings.nameBn}
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 mb-4">
                  {headSettings.designation || headSettings.designationBn}
                </p>
              </div>
            </div>

            {headQuote && (
              <div className="border-t border-gray-200 pt-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">প্রধান শিক্ষকের বার্তা</h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base md:text-lg">
                    "{headQuote}"
                  </p>
                </div>
              </div>
            )}

            {!headQuote && (
              <div className="border-t border-gray-200 pt-8 text-center text-gray-500">
                <p>প্রধান শিক্ষকের বার্তা এখনও যোগ করা হয়নি</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PublicPageShell>
  );
}

