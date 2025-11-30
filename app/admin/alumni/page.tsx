"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2 } from "lucide-react";
import {
  subscribeToCollection,
  deleteDocument,
  updateDocument,
  convertTimestamp,
} from "@/lib/firebase/firestore";
import { Alumni } from "@/types";

export default function AlumniPage() {
  const [alumni, setAlumni] = useState<Alumni[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToCollection(
      "alumni",
      (docs) => {
        const alumniData = docs.map((doc: any) => ({
          ...doc,
          createdAt: convertTimestamp(doc.createdAt),
          updatedAt: convertTimestamp(doc.updatedAt),
        })) as Alumni[];
        setAlumni(alumniData);
      },
      undefined,
      "createdAt",
      "desc"
    );

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("আপনি কি এই প্রাক্তন ছাত্র/ছাত্রীকে মুছে ফেলতে চান?")) return;
    try {
      await deleteDocument("alumni", id);
    } catch (error: any) {
      alert(error.message || "মুছে ফেলা ব্যর্থ হয়েছে");
    }
  };

  const handleTogglePublish = async (alum: Alumni) => {
    try {
      await updateDocument("alumni", alum.id, {
        published: !alum.published,
      });
    } catch (error: any) {
      alert(error.message || "স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">প্রাক্তন ছাত্র-ছাত্রী</h1>
          <p className="text-gray-600">প্রাক্তন ছাত্র-ছাত্রীদের পরিচালনা করুন</p>
        </div>
        <Link
          href="/admin/alumni/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          নতুন প্রাক্তন ছাত্র-ছাত্রী
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {alumni.map((alum) => (
          <div key={alum.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="aspect-video bg-gray-200 flex items-center justify-center">
              {alum.photo ? (
                <img
                  src={alum.photo}
                  alt={alum.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400">ছবি নেই</span>
              )}
            </div>
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-800">{alum.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{alum.nameBn}</p>
              <p className="text-sm text-gray-700 mb-1">
                পাসের বছর: {alum.graduationYear}
              </p>
              {alum.currentPosition && (
                <p className="text-sm text-gray-700 mb-4">{alum.currentPosition}</p>
              )}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleTogglePublish(alum)}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    alum.published
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {alum.published ? "প্রকাশিত" : "অপ্রকাশিত"}
                </button>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/alumni/edit?id=${alum.id}`}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit size={18} />
                  </Link>
                  <button
                    onClick={() => handleDelete(alum.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {alumni.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-500">কোনো প্রাক্তন ছাত্র-ছাত্রী নেই</p>
        </div>
      )}
    </div>
  );
}

