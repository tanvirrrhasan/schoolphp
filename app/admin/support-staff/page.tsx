"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  subscribeToCollection,
  convertTimestamp,
  deleteDocument,
  updateDocument,
} from "@/lib/firebase/firestore";
import { SupportStaff } from "@/types";
import { Plus, Edit, Trash2, Users } from "lucide-react";

export default function SupportStaffAdminPage() {
  const [staff, setStaff] = useState<SupportStaff[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToCollection(
      "supportStaff",
      (docs) => {
        const staffData = docs.map((doc: any) => ({
          ...doc,
          createdAt: convertTimestamp(doc.createdAt),
          updatedAt: convertTimestamp(doc.updatedAt),
        })) as SupportStaff[];
        setStaff(staffData);
      },
      undefined,
      "createdAt",
      "desc"
    );

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("আপনি কি এই কর্মীকে মুছে ফেলতে চান?")) return;
    try {
      await deleteDocument("supportStaff", id);
    } catch (error: any) {
      alert(error.message || "মুছে ফেলা ব্যর্থ হয়েছে");
    }
  };

  const handleTogglePublish = async (member: SupportStaff) => {
    try {
      await updateDocument("supportStaff", member.id, {
        published: !member.published,
      });
    } catch (error: any) {
      alert(error.message || "স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            সহায়ক কর্মীবৃন্দ
          </h1>
          <p className="text-gray-600">কর্মীদের তথ্য যোগ, সম্পাদনা ও ব্যবস্থাপনা করুন</p>
        </div>
        <Link
          href="/admin/support-staff/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          নতুন কর্মী
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map((member) => (
          <div key={member.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="aspect-video bg-gray-200 flex items-center justify-center">
              {member.photo ? (
                <img
                  src={member.photo}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Users className="text-gray-400" size={40} />
              )}
            </div>
            <div className="p-6 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{member.name}</h3>
                  <p className="text-sm text-gray-600">{member.nameBn}</p>
                </div>
                <button
                  onClick={() => handleTogglePublish(member)}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    member.published
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {member.published ? "প্রকাশিত" : "অপ্রকাশিত"}
                </button>
              </div>
              <p className="text-sm text-gray-700 font-medium">
                {member.roleBn || member.role}
              </p>
              <div className="flex items-center justify-between pt-4">
                <Link
                  href={`/admin/support-staff/${member.id}`}
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700"
                >
                  <Edit size={18} />
                  সম্পাদনা
                </Link>
                <button
                  onClick={() => handleDelete(member.id)}
                  className="inline-flex items-center gap-1 text-red-600 hover:text-red-700"
                >
                  <Trash2 size={18} />
                  মুছুন
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {staff.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md mt-6">
          <p className="text-gray-500">এখনও কোনো সহায়ক কর্মী যোগ করা হয়নি</p>
        </div>
      )}
    </div>
  );
}


