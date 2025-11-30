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
import { Teacher } from "@/types";

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToCollection(
      "teachers",
      (docs) => {
        const teachersData = docs.map((doc: any) => ({
          ...doc,
          createdAt: convertTimestamp(doc.createdAt),
          updatedAt: convertTimestamp(doc.updatedAt),
        })) as Teacher[];
        setTeachers(teachersData);
      },
      undefined,
      "createdAt",
      "desc"
    );

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("আপনি কি এই শিক্ষককে মুছে ফেলতে চান?")) return;

    try {
      await deleteDocument("teachers", id);
    } catch (error: any) {
      alert(error.message || "শিক্ষক মুছে ফেলা ব্যর্থ হয়েছে");
    }
  };

  const handleTogglePublish = async (teacher: Teacher) => {
    try {
      await updateDocument("teachers", teacher.id, {
        published: !teacher.published,
      });
    } catch (error: any) {
      alert(error.message || "স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">শিক্ষক পরিচালনা</h1>
          <p className="text-gray-600">শিক্ষকদের তথ্য যোগ, সম্পাদনা ও মুছে ফেলুন</p>
        </div>
        <Link
          href="/admin/teachers/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          নতুন শিক্ষক
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.map((teacher) => (
          <div key={teacher.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="aspect-video bg-gray-200 flex items-center justify-center">
              {teacher.photo ? (
                <img
                  src={teacher.photo}
                  alt={teacher.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400">ছবি নেই</span>
              )}
            </div>
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-800">{teacher.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{teacher.nameBn}</p>
              <p className="text-sm text-gray-700 mb-4">{teacher.designation}</p>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleTogglePublish(teacher)}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    teacher.published
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {teacher.published ? "প্রকাশিত" : "অপ্রকাশিত"}
                </button>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/teachers/edit?id=${teacher.id}`}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit size={18} />
                  </Link>
                  <button
                    onClick={() => handleDelete(teacher.id)}
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

      {teachers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-500">কোনো শিক্ষক নেই</p>
        </div>
      )}
    </div>
  );
}

