"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, BookOpen } from "lucide-react";
import {
  subscribeToCollection,
  deleteDocument,
  updateDocument,
  convertTimestamp,
} from "@/lib/firebase/firestore";
import { Class } from "@/types";

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToCollection(
      "classes",
      (docs) => {
        const classesData = docs.map((doc: any) => ({
          ...doc,
          createdAt: convertTimestamp(doc.createdAt),
          updatedAt: convertTimestamp(doc.updatedAt),
        })) as Class[];
        setClasses(classesData);
      },
      undefined,
      "name",
      "asc"
    );

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("আপনি কি এই ক্লাসটি মুছে ফেলতে চান?")) return;

    try {
      await deleteDocument("classes", id);
    } catch (error: any) {
      alert(error.message || "ক্লাস মুছে ফেলা ব্যর্থ হয়েছে");
    }
  };

  const handleToggleStatus = async (cls: Class) => {
    try {
      await updateDocument("classes", cls.id, {
        status: cls.status === "active" ? "inactive" : "active",
      });
    } catch (error: any) {
      alert(error.message || "স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">ক্লাস ও পাঠ্যপুস্তক</h1>
          <p className="text-gray-600">ক্লাস এবং পাঠ্যপুস্তক পরিচালনা করুন</p>
        </div>
        <Link
          href="/admin/classes/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          নতুন ক্লাস
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls) => (
          <div key={cls.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800">{cls.name}</h3>
                <p className="text-sm text-gray-600">{cls.nameBn}</p>
              </div>
              <button
                onClick={() => handleToggleStatus(cls)}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  cls.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {cls.status === "active" ? "সক্রিয়" : "নিষ্ক্রিয়"}
              </button>
            </div>

            <div className="space-y-2 mb-4">
              <p className="text-sm text-gray-600">
                <span className="font-medium">সিট সংখ্যা:</span> {cls.capacity}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">বিষয়:</span> {cls.subjects?.length || 0}
              </p>
            </div>

            <div className="flex gap-2">
              <Link
                href={`/admin/classes/edit?id=${cls.id}`}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
              >
                <Edit size={18} />
                সম্পাদনা
              </Link>
              <button
                onClick={() => handleDelete(cls.id)}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {classes.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500">কোনো ক্লাস নেই</p>
        </div>
      )}
    </div>
  );
}

