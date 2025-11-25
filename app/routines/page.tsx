"use client";

import { useEffect, useState } from "react";
import {
  subscribeToCollection,
  convertTimestamp,
} from "@/lib/firebase/firestore";
import { Routine } from "@/types";
import { Calendar } from "lucide-react";
import PublicPageShell from "@/components/public/PublicPageShell";

export default function RoutinesPage() {
  const [routines, setRoutines] = useState<Routine[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToCollection(
      "routines",
      (docs) => {
        const routineData = docs
          .filter((doc: any) => doc.published)
          .map((doc: any) => ({
            ...doc,
            createdAt: convertTimestamp(doc.createdAt),
            updatedAt: convertTimestamp(doc.updatedAt),
          }))
          .sort((a: Routine, b: Routine) =>
            b.createdAt.getTime() - a.createdAt.getTime()
          ) as Routine[];
        setRoutines(routineData);
      },
      [{ field: "published", operator: "==", value: true }],
      "createdAt",
      "desc"
    );

    return () => unsubscribe();
  }, []);

  return (
    <PublicPageShell backHref="/" backLabel="হোম">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">ক্লাস রুটিন</h1>
          <p className="text-gray-600">
            সর্বশেষ প্রকাশিত ক্লাস ও পরীক্ষা রুটিন থেকে প্রয়োজনীয় তথ্য সংগ্রহ করুন
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {routines.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-lg shadow-md">
              <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500">কোনো রুটিন প্রকাশিত নেই</p>
            </div>
          ) : (
            routines.map((routine) => (
              <div
                key={routine.id}
                className="bg-white rounded-lg shadow-md p-6 flex flex-col gap-3"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="text-blue-600" size={20} />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      {routine.titleBn || routine.title}
                    </h2>
                    {routine.class && (
                      <p className="text-sm text-gray-600">শ্রেণি: {routine.class}</p>
                    )}
                  </div>
                </div>
                <div className="mt-auto flex gap-2">
                  {routine.pdf && (
                    <a
                      href={routine.pdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center text-sm px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
                    >
                      PDF ডাউনলোড
                    </a>
                  )}
                  {routine.image && (
                    <a
                      href={routine.image}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center text-sm px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      ইমেজ দেখুন
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </PublicPageShell>
  );
}


