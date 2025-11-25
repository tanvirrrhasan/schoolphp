"use client";

import { useEffect, useState } from "react";
import {
  subscribeToCollection,
  convertTimestamp,
} from "@/lib/firebase/firestore";
import { CommitteeMember } from "@/types";
import { Users } from "lucide-react";
import PublicPageShell from "@/components/public/PublicPageShell";

export default function CommitteePage() {
  const [members, setMembers] = useState<CommitteeMember[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToCollection(
      "committee",
      (docs) => {
        const memberData = docs
          .filter((doc: any) => doc.published)
          .map((doc: any) => ({
            ...doc,
            createdAt: convertTimestamp(doc.createdAt),
            updatedAt: convertTimestamp(doc.updatedAt),
          }))
          .sort((a: CommitteeMember, b: CommitteeMember) =>
            a.name.localeCompare(b.name)
          ) as CommitteeMember[];
        setMembers(memberData);
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">ব্যবস্থাপনা কমিটি</h1>
          <p className="text-gray-600">
            শিক্ষা প্রতিষ্ঠানের প্রশাসনিক ও নীতিগত বিষয় পরিচালনাকারী কমিটির সদস্যরা
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {members.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-lg shadow-md">
              <Users className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500">কোনো সদস্য প্রকাশিত নেই</p>
            </div>
          ) : (
            members.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                  {member.photo ? (
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Users className="text-gray-400" size={32} />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-800">{member.name}</h3>
                <p className="text-sm text-gray-600 mb-1">{member.nameBn}</p>
                <p className="text-sm text-gray-700">{member.designationBn || member.designation}</p>
                {member.bio && (
                  <p className="text-xs text-gray-500 mt-3 line-clamp-3">
                    {member.bioBn || member.bio}
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


