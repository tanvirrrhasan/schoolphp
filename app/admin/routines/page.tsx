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
import { Routine } from "@/types";
import { format } from "date-fns";

export default function RoutinesPage() {
  const [routines, setRoutines] = useState<Routine[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToCollection(
      "routines",
      (docs) => {
        const routinesData = docs.map((doc: any) => ({
          ...doc,
          createdAt: convertTimestamp(doc.createdAt),
          updatedAt: convertTimestamp(doc.updatedAt),
        })) as Routine[];
        setRoutines(routinesData);
      },
      undefined,
      "createdAt",
      "desc"
    );

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("আপনি কি এই রুটিনটি মুছে ফেলতে চান?")) return;

    try {
      await deleteDocument("routines", id);
    } catch (error: any) {
      alert(error.message || "রুটিন মুছে ফেলা ব্যর্থ হয়েছে");
    }
  };

  const handleTogglePublish = async (routine: Routine) => {
    try {
      await updateDocument("routines", routine.id, {
        published: !routine.published,
      });
    } catch (error: any) {
      alert(error.message || "স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">ক্লাস রুটিন</h1>
          <p className="text-gray-600">ক্লাস ও পরীক্ষার রুটিন তৈরি করুন</p>
        </div>
        <Link
          href="/admin/routines/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          নতুন রুটিন
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {routines.map((routine) => (
          <div key={routine.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800">{routine.title}</h3>
                <p className="text-sm text-gray-600">{routine.titleBn}</p>
              </div>
              <button
                onClick={() => handleTogglePublish(routine)}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  routine.published
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {routine.published ? "প্রকাশিত" : "অপ্রকাশিত"}
              </button>
            </div>

            <div className="space-y-2 mb-4">
              <p className="text-sm text-gray-600">
                <span className="font-medium">ধরন:</span>{" "}
                {routine.type === "class" ? "ক্লাস" : "পরীক্ষা"}
              </p>
              {routine.class && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">ক্লাস:</span> {routine.class}
                </p>
              )}
              <p className="text-sm text-gray-500">
                {format(routine.createdAt, "dd MMM yyyy")}
              </p>
            </div>

            <div className="flex gap-2">
              <Link
                href={`/admin/routines/${routine.id}`}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
              >
                <Edit size={18} />
                সম্পাদনা
              </Link>
              <button
                onClick={() => handleDelete(routine.id)}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {routines.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-500">কোনো রুটিন নেই</p>
        </div>
      )}
    </div>
  );
}

