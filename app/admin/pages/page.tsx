"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2 } from "lucide-react";
import {
  subscribeToCollection,
  updateDocument,
  deleteDocument,
  convertTimestamp,
} from "@/lib/firebase/firestore";
import { WebPage } from "@/types";
import { format } from "date-fns";

export default function PagesPage() {
  const [pages, setPages] = useState<WebPage[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToCollection(
      "pages",
      (docs) => {
        const pagesData = docs.map((doc: any) => ({
          ...doc,
          createdAt: convertTimestamp(doc.createdAt),
          updatedAt: convertTimestamp(doc.updatedAt),
        })) as WebPage[];
        setPages(pagesData);
      },
      undefined,
      "createdAt",
      "desc"
    );

    return () => unsubscribe();
  }, []);

  const handleTogglePublish = async (page: WebPage) => {
    try {
      await updateDocument("pages", page.id, {
        published: !page.published,
      });
    } catch (error: any) {
      alert(error.message || "স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে");
    }
  };

  const handleDelete = async (page: WebPage) => {
    if (
      !confirm(
        `আপনি কি "${page.titleBn || page.title}" পেজটি মুছে ফেলতে চান?`
      )
    ) {
      return;
    }

    try {
      await deleteDocument("pages", page.id);
    } catch (error: any) {
      alert(error.message || "পেজ মুছে ফেলা ব্যর্থ হয়েছে");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">ওয়েব পেজ</h1>
          <p className="text-gray-600">স্ট্যাটিক পেজসমূহ পরিচালনা করুন</p>
        </div>
        <Link
          href="/admin/pages/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          নতুন পেজ
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  শিরোনাম
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  প্রকাশিত
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  তারিখ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  কাজ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    কোনো পেজ নেই
                  </td>
                </tr>
              ) : (
                pages.map((page) => (
                  <tr key={page.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{page.title}</div>
                      <div className="text-sm text-gray-500">{page.titleBn}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">/{page.url}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleTogglePublish(page)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          page.published
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {page.published ? "প্রকাশিত" : "অপ্রকাশিত"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {format(page.createdAt, "dd MMM yyyy")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end">
                        <Link
                          href={`/admin/pages/edit?id=${page.id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(page)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          aria-label="পেজ মুছুন"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

