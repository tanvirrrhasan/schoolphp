"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import {
  subscribeToCollection,
  deleteDocument,
  updateDocument,
  convertTimestamp,
} from "@/lib/firebase/firestore";
import { Notice } from "@/types";
import { format } from "date-fns";

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToCollection(
      "notices",
      (docs) => {
        const noticesData = docs.map((doc: any) => ({
          ...doc,
          createdAt: convertTimestamp(doc.createdAt),
          updatedAt: convertTimestamp(doc.updatedAt),
          scheduledTime: doc.scheduledTime
            ? convertTimestamp(doc.scheduledTime)
            : undefined,
        })) as Notice[];
        setNotices(noticesData);
        setLoading(false);
      },
      undefined,
      "createdAt",
      "desc"
    );

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("আপনি কি এই নোটিশটি মুছে ফেলতে চান?")) return;

    try {
      await deleteDocument("notices", id);
    } catch (error: any) {
      alert(error.message || "নোটিশ মুছে ফেলা ব্যর্থ হয়েছে");
    }
  };

  const handleTogglePublish = async (notice: Notice) => {
    try {
      await updateDocument("notices", notice.id, {
        published: !notice.published,
      });
    } catch (error: any) {
      alert(error.message || "স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">নোটিশ বোর্ড</h1>
          <p className="text-gray-600">নতুন নোটিশ প্রকাশ করুন এবং পরিচালনা করুন</p>
        </div>
        <Link
          href="/admin/notices/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          নতুন নোটিশ
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
              {notices.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    কোনো নোটিশ নেই
                  </td>
                </tr>
              ) : (
                notices.map((notice) => (
                  <tr key={notice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{notice.title}</div>
                      <div className="text-sm text-gray-500 line-clamp-1">
                        {notice.description}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleTogglePublish(notice)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          notice.published
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {notice.published ? "প্রকাশিত" : "অপ্রকাশিত"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {format(notice.createdAt, "dd MMM yyyy")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/notices/${notice.id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(notice.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
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

