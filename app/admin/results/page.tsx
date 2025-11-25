"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  subscribeToCollection,
  convertTimestamp,
  deleteDocument,
  updateDocument,
} from "@/lib/firebase/firestore";
import { Result } from "@/types";
import { Plus, Edit, Trash2, Trophy } from "lucide-react";

export default function ResultsAdminPage() {
  const [results, setResults] = useState<Result[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToCollection(
      "results",
      (docs) => {
        const resultData = docs.map((doc: any) => ({
          ...doc,
          createdAt: convertTimestamp(doc.createdAt),
          updatedAt: convertTimestamp(doc.updatedAt),
          publishedAt: doc.publishedAt ? convertTimestamp(doc.publishedAt) : undefined,
        })) as Result[];
        setResults(resultData);
      },
      undefined,
      "publishedAt",
      "desc"
    );

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("আপনি কি এই ফলাফলটি মুছে ফেলতে চান?")) return;
    try {
      await deleteDocument("results", id);
    } catch (error: any) {
      alert(error.message || "মুছে ফেলা ব্যর্থ হয়েছে");
    }
  };

  const handleTogglePublish = async (result: Result) => {
    try {
      await updateDocument("results", result.id, {
        published: !result.published,
      });
    } catch (error: any) {
      alert(error.message || "স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">ফলাফল ব্যবস্থাপনা</h1>
          <p className="text-gray-600">প্রকাশিত ও অপ্রকাশিত ফলাফলের তালিকা</p>
        </div>
        <Link
          href="/admin/results/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          নতুন ফলাফল
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((result) => (
          <div key={result.id} className="bg-white rounded-lg shadow-md p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-blue-50 text-blue-600">
                <Trophy size={24} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">
                  {result.publishedAt
                    ? format(result.publishedAt, "dd MMM yyyy")
                    : "প্রকাশের তারিখ নেই"}
                </p>
                <h2 className="text-lg font-semibold text-gray-900">
                  {result.titleBn || result.title}
                </h2>
              </div>
              <button
                onClick={() => handleTogglePublish(result)}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  result.published
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {result.published ? "প্রকাশিত" : "অপ্রকাশিত"}
              </button>
            </div>
            {result.examName && (
              <p className="text-sm text-gray-700">
                পরীক্ষা: {result.examNameBn || result.examName}
              </p>
            )}
            {result.session && (
              <p className="text-sm text-gray-700">শিক্ষাবর্ষ: {result.session}</p>
            )}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <Link
                href={`/admin/results/${result.id}`}
                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700"
              >
                <Edit size={18} />
                সম্পাদনা
              </Link>
              <div className="flex items-center gap-3">
                {result.fileUrl && (
                  <a
                    href={result.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    ফাইল দেখুন
                  </a>
                )}
                <button
                  onClick={() => handleDelete(result.id)}
                  className="inline-flex items-center gap-1 text-red-600 hover:text-red-700"
                >
                  <Trash2 size={18} />
                  মুছুন
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {results.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-500">এখনও কোনো ফলাফল যোগ করা হয়নি</p>
        </div>
      )}
    </div>
  );
}


