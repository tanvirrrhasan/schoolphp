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
  const [activeTeacher, setActiveTeacher] = useState<Teacher | null>(null);
  const [activeStaff, setActiveStaff] = useState<SupportStaff | null>(null);

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
                <button
                  key={teacher.id}
                  type="button"
                  onClick={() => setActiveTeacher(teacher)}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow text-left"
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
                </button>
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
                <button
                  key={staff.id}
                  type="button"
                  onClick={() => setActiveStaff(staff)}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow text-left"
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
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Teacher Modal */}
      {activeTeacher && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80"
          onClick={() => setActiveTeacher(null)}
        >
          <div
            className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveTeacher(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
              aria-label="Close"
            >
              ✕
            </button>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-48 h-48 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                {activeTeacher.photo ? (
                  <img
                    src={activeTeacher.photo}
                    alt={activeTeacher.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <UserCircle className="text-gray-400" size={64} />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{activeTeacher.name}</h2>
                <p className="text-lg text-gray-600 mb-4">{activeTeacher.nameBn}</p>
                <p className="text-lg text-gray-700 font-medium mb-4">{activeTeacher.designation}</p>
                {activeTeacher.qualification && (
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-semibold">যোগ্যতা:</span> {activeTeacher.qualification}
                  </p>
                )}
                {activeTeacher.experience && (
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-semibold">অভিজ্ঞতা:</span> {activeTeacher.experience}
                  </p>
                )}
                {activeTeacher.email && (
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-semibold">ইমেইল:</span> {activeTeacher.email}
                  </p>
                )}
                {activeTeacher.phone && (
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-semibold">ফোন:</span> {activeTeacher.phone}
                  </p>
                )}
                {activeTeacher.bio && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">জীবনবৃত্তান্ত:</p>
                    <p className="text-sm text-gray-600 whitespace-pre-line">{activeTeacher.bio}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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

