"use client";

import { useState, useEffect } from "react";
import {
  subscribeToCollection,
  convertTimestamp,
} from "@/lib/firebase/firestore";
import { Teacher, SupportStaff } from "@/types";
import { UserCircle } from "lucide-react";
import PublicPageShell from "@/components/public/PublicPageShell";

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [supportStaff, setSupportStaff] = useState<SupportStaff[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToCollection(
      "teachers",
      (docs) => {
        const teachersData = docs
          .filter((doc: any) => doc.published)
          .map((doc: any) => ({
            ...doc,
            createdAt: convertTimestamp(doc.createdAt),
            updatedAt: convertTimestamp(doc.updatedAt),
          }))
          .sort((a: Teacher, b: Teacher) =>
            a.name.localeCompare(b.name)
          ) as Teacher[];
        setTeachers(teachersData);
      },
      [{ field: "published", operator: "==", value: true }],
      undefined,
      "asc"
    );

    return () => unsubscribe();
  }, []);

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
        setSupportStaff(staffData);
      },
      [{ field: "published", operator: "==", value: true }],
      undefined,
      "asc"
    );

    return () => unsubscribe();
  }, []);

  return (
    <PublicPageShell backHref="/" backLabel="হোম">
      <div className="container mx-auto px-4 py-12 space-y-16">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">শিক্ষকবৃন্দ</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
            {teachers.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white rounded-lg shadow-md">
                <UserCircle className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500">কোনো শিক্ষক নেই</p>
              </div>
            ) : (
              teachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-video bg-gray-200 flex items-center justify-center">
                    {teacher.photo ? (
                      <img
                        src={teacher.photo}
                        alt={teacher.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserCircle className="text-gray-400" size={48} />
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-800">{teacher.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{teacher.nameBn}</p>
                    <p className="text-sm text-gray-700 font-medium">{teacher.designation}</p>
                    {teacher.qualification && (
                      <p className="text-xs text-gray-500 mt-2">{teacher.qualification}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">সহায়ক কর্মীবৃন্দ</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
            {supportStaff.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white rounded-lg shadow-md">
                <UserCircle className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500">কোনো সহায়ক কর্মী যোগ করা হয়নি</p>
              </div>
            ) : (
              supportStaff.map((staff) => (
                <div
                  key={staff.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-video bg-gray-200 flex items-center justify-center">
                    {staff.photo ? (
                      <img
                        src={staff.photo}
                        alt={staff.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserCircle className="text-gray-400" size={48} />
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-800">{staff.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{staff.nameBn}</p>
                    <p className="text-sm text-gray-700 font-medium">
                      {staff.roleBn || staff.role}
                    </p>
                    {staff.phone && (
                      <p className="text-xs text-gray-500 mt-2">{staff.phone}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </PublicPageShell>
  );
}

