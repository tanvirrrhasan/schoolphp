"use client";

import { useEffect, useState } from "react";
import {
  subscribeToCollection,
  convertTimestamp,
} from "@/lib/firebase/firestore";
import { Alumni } from "@/types";
import { Users } from "lucide-react";
import PublicPageShell from "@/components/public/PublicPageShell";

export default function AlumniPage() {
  const [alumni, setAlumni] = useState<Alumni[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToCollection(
      "alumni",
      (docs) => {
        const alumniData = docs
          .filter((doc: any) => doc.published)
          .map((doc: any) => ({
            ...doc,
            createdAt: convertTimestamp(doc.createdAt),
            updatedAt: convertTimestamp(doc.updatedAt),
          }))
          .sort((a: Alumni, b: Alumni) =>
            b.graduationYear.localeCompare(a.graduationYear)
          ) as Alumni[];
        setAlumni(alumniData);
      },
      [{ field: "published", operator: "==", value: true }],
      undefined,
      "desc"
    );

    return () => unsubscribe();
  }, []);

  return (
    <PublicPageShell backHref="/" backLabel="হোম">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">প্রাক্তন ছাত্র-ছাত্রী</h1>
          <p className="text-gray-600">
            আমাদের গর্বিত প্রাক্তন শিক্ষার্থীদের সাফল্যের গল্প ও বর্তমান অবস্থান
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {alumni.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-lg shadow-md">
              <Users className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500">কোনো প্রাক্তন শিক্ষার্থীর তথ্য নেই</p>
            </div>
          ) : (
            alumni.map((person) => (
              <div
                key={person.id}
                className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                  {person.photo ? (
                    <img
                      src={person.photo}
                      alt={person.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Users className="text-gray-400" size={32} />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-800">{person.name}</h3>
                <p className="text-sm text-gray-600">উত্তীর্ণ সাল: {person.graduationYear}</p>
                {person.currentPosition && (
                  <p className="text-sm text-gray-700 mt-1">
                    {person.currentPositionBn || person.currentPosition}
                  </p>
                )}
                {person.achievement && (
                  <p className="text-xs text-gray-500 mt-3 line-clamp-3">
                    {person.achievementBn || person.achievement}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </PublicPageShell>
  );
}


