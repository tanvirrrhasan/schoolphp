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
  const [activeStaff, setActiveStaff] = useState<SupportStaff | null>(null);

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
              <button
                key={member.id}
                type="button"
                onClick={() => setActiveStaff(member)}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow text-left"
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
              </button>
            ))
          )}
        </div>
      </div>

      {/* Support Staff Modal */}
      {activeStaff && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80"
          onClick={() => setActiveStaff(null)}
        >
          <div
            className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveStaff(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
              aria-label="Close"
            >
              ✕
            </button>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-48 h-48 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                {activeStaff.photo ? (
                  <img
                    src={activeStaff.photo}
                    alt={activeStaff.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <UserCircle className="text-gray-400" size={64} />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{activeStaff.name}</h2>
                <p className="text-lg text-gray-600 mb-4">{activeStaff.nameBn}</p>
                <p className="text-lg text-gray-700 font-medium mb-4">
                  {activeStaff.roleBn || activeStaff.role}
                </p>
                {activeStaff.phone && (
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-semibold">ফোন:</span> {activeStaff.phone}
                  </p>
                )}
                {activeStaff.email && (
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-semibold">ইমেইল:</span> {activeStaff.email}
                  </p>
                )}
                {activeStaff.bio && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">বিবরণ:</p>
                    <p className="text-sm text-gray-600 whitespace-pre-line">{activeStaff.bio}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </PublicPageShell>
  );
}


