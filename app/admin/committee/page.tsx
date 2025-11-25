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
import { CommitteeMember } from "@/types";

export default function CommitteePage() {
  const [members, setMembers] = useState<CommitteeMember[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToCollection(
      "committee",
      (docs) => {
        const membersData = docs.map((doc: any) => ({
          ...doc,
          createdAt: convertTimestamp(doc.createdAt),
          updatedAt: convertTimestamp(doc.updatedAt),
        })) as CommitteeMember[];
        setMembers(membersData);
      },
      undefined,
      "createdAt",
      "desc"
    );

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("আপনি কি এই সদস্যকে মুছে ফেলতে চান?")) return;
    try {
      await deleteDocument("committee", id);
    } catch (error: any) {
      alert(error.message || "মুছে ফেলা ব্যর্থ হয়েছে");
    }
  };

  const handleTogglePublish = async (member: CommitteeMember) => {
    try {
      await updateDocument("committee", member.id, {
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">ব্যবস্থাপনা কমিটি</h1>
          <p className="text-gray-600">কমিটি সদস্যদের পরিচালনা করুন</p>
        </div>
        <Link
          href="/admin/committee/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          নতুন সদস্য
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member) => (
          <div key={member.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="aspect-video bg-gray-200 flex items-center justify-center">
              {member.photo ? (
                <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-400">ছবি নেই</span>
              )}
            </div>
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-800">{member.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{member.nameBn}</p>
              <p className="text-sm text-gray-700 mb-4">{member.designation}</p>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleTogglePublish(member)}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    member.published
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {member.published ? "প্রকাশিত" : "অপ্রকাশিত"}
                </button>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/committee/${member.id}`}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit size={18} />
                  </Link>
                  <button
                    onClick={() => handleDelete(member.id)}
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

      {members.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-500">কোনো সদস্য নেই</p>
        </div>
      )}
    </div>
  );
}

