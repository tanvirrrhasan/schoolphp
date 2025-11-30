"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import {
  subscribeToCollection,
  deleteDocument,
  convertTimestamp,
} from "@/lib/firebase/firestore";
import { Student } from "@/types";
import { format } from "date-fns";

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");

  useEffect(() => {
    const unsubscribe = subscribeToCollection(
      "students",
      (docs) => {
        const studentsData = docs.map((doc: any) => ({
          ...doc,
          createdAt: convertTimestamp(doc.createdAt),
          updatedAt: convertTimestamp(doc.updatedAt),
        })) as Student[];
        setStudents(studentsData);
        setFilteredStudents(studentsData);
      },
      undefined,
      "createdAt",
      "desc"
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let filtered = students;

    if (selectedClass !== "all") {
      filtered = filtered.filter((s) => s.class === selectedClass);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.nameBn.includes(searchTerm) ||
          s.roll.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredStudents(filtered);
  }, [searchTerm, selectedClass, students]);

  const handleDelete = async (id: string) => {
    if (!confirm("আপনি কি এই ছাত্র/ছাত্রীটি মুছে ফেলতে চান?")) return;

    try {
      await deleteDocument("students", id);
    } catch (error: any) {
      alert(error.message || "ছাত্র/ছাত্রী মুছে ফেলা ব্যর্থ হয়েছে");
    }
  };

  const classes = Array.from(new Set(students.map((s) => s.class))).sort();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">ছাত্র-ছাত্রী পরিচালনা</h1>
          <p className="text-gray-600">ছাত্র-ছাত্রীদের তথ্য যোগ, সম্পাদনা ও মুছে ফেলুন</p>
        </div>
        <Link
          href="/admin/students/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          নতুন ছাত্র-ছাত্রী
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="নাম, রোল নম্বর দিয়ে খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">সব ক্লাস</option>
            {classes.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ছবি
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  নাম
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ক্লাস
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  রোল
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ভর্তির বছর
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  কাজ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    কোনো ছাত্র-ছাত্রী নেই
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      {student.photo ? (
                        <img
                          src={student.photo}
                          alt={student.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-xs">ছবি নেই</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{student.name}</div>
                      <div className="text-sm text-gray-500">{student.nameBn}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{student.class}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{student.roll}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {student.admissionYear}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/students/edit?id=${student.id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(student.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

