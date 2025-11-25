"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import PublicPageShell from "@/components/public/PublicPageShell";
import {
  subscribeToCollection,
  convertTimestamp,
} from "@/lib/firebase/firestore";
import { Result } from "@/types";

export default function ResultsPage() {
  const [results, setResults] = useState<Result[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToCollection(
      "results",
      (docs) => {
        const resultData = docs
          .filter((doc: any) => doc.published)
          .map((doc: any) => ({
            ...doc,
            createdAt: convertTimestamp(doc.createdAt),
            updatedAt: convertTimestamp(doc.updatedAt),
            publishedAt: doc.publishedAt
              ? convertTimestamp(doc.publishedAt)
              : undefined,
          }))
          .sort((a: Result, b: Result) => {
            const aDate = a.publishedAt?.getTime() || a.createdAt.getTime();
            const bDate = b.publishedAt?.getTime() || b.createdAt.getTime();
            return bDate - aDate;
          }) as Result[];
        setResults(resultData);
      },
      [{ field: "published", operator: "==", value: true }]
    );

    return () => unsubscribe();
  }, []);

  return (
    <PublicPageShell backHref="/" backLabel="হোম">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">ফলাফল</h1>
          <p className="text-gray-600">
            সাম্প্রতিক প্রকাশিত পরীক্ষার ফলাফল ও নির্দেশনা দেখুন
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-500">এখনও কোনো ফলাফল প্রকাশিত হয়নি</p>
            </div>
          ) : (
            results.map((result) => (
              <div
                key={result.id}
                className="bg-white rounded-lg shadow-md p-6 flex flex-col gap-3"
              >
                <div>
                  <p className="text-sm text-gray-500">
                    {result.publishedAt
                      ? format(result.publishedAt, "dd MMM yyyy")
                      : ""}
                  </p>
                  <h2 className="text-xl font-semibold text-gray-800">
                    {result.titleBn || result.title}
                  </h2>
                </div>
                {result.examName && (
                  <p className="text-sm text-gray-600">
                    পরীক্ষা: {result.examNameBn || result.examName}
                  </p>
                )}
                {result.session && (
                  <p className="text-sm text-gray-600">শিক্ষাবর্ষ: {result.session}</p>
                )}
                {result.description && (
                  <p className="text-sm text-gray-700 whitespace-pre-line">
                    {result.descriptionBn || result.description}
                  </p>
                )}
                {result.fileUrl && (
                  <a
                    href={result.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-flex items-center justify-center rounded-lg border border-blue-200 text-blue-600 font-semibold px-4 py-2 hover:bg-blue-50 transition-colors"
                  >
                    ফলাফল ডাউনলোড করুন
                  </a>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </PublicPageShell>
  );
}


