"use client";

import { useEffect, useState } from "react";
import {
  subscribeToCollection,
  convertTimestamp,
} from "@/lib/firebase/firestore";
import { SupportStaff } from "@/types";
import { UserCircle } from "lucide-react";
import PublicPageShell from "@/components/public/PublicPageShell";

export default function SupportStaffPage() {
  const [staff, setStaff] = useState<SupportStaff[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToCollection(
      "supportStaff",
      (docs) => {
        const staffData = docs
          .filter((doc: any) => doc.published)
          .map((doc: any) => ({
            ...doc,
            createdAt: convertTimestamp(doc.createdAt),
            updatedAt: convertTimestamp(doc.updatedAt),
          }))
          .sort((a: SupportStaff, b: SupportStaff) =>
            a.name.localeCompare(b.name)
          ) as SupportStaff[];
        setStaff(staffData);
      },
      [{ field: "published", operator: "==", value: true }],
      undefined,
      "asc"
    );

    return () => unsubscribe();
  }, []);

  return (
    <PublicPageShell backHref="/" backLabel="হোম">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">সহায়ক কর্মীবৃন্দ</h1>
          <p className="text-gray-600">
            বিদ্যালয়ের দৈনন্দিন কার্যক্রম পরিচালনায় সহায়তা করেন এমন কর্মীদের তালিকা
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {staff.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-lg shadow-md">
              <UserCircle className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500">কোনো সহায়ক কর্মী যুক্ত করা হয়নি</p>
            </div>
          ) : (
            staff.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-video bg-gray-200 flex items-center justify-center">
                  {member.photo ? (
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserCircle className="text-gray-400" size={48} />
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-800">{member.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{member.nameBn}</p>
                  <p className="text-sm text-gray-700 font-medium">
                    {member.roleBn || member.role}
                  </p>
                  {member.phone && (
                    <p className="text-xs text-gray-500 mt-2">{member.phone}</p>
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


