"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Trash2, Edit } from "lucide-react";
import {
  subscribeToCollection,
  deleteDocument,
  updateDocument,
  createDocument,
  convertTimestamp,
} from "@/lib/firebase/firestore";
import { AdmissionApplication } from "@/types";
import { format } from "date-fns";

export default function AdmissionsPage() {
  const [admissions, setAdmissions] = useState<AdmissionApplication[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "cancelled">("all");

  useEffect(() => {
    const unsubscribe = subscribeToCollection(
      "admissions",
      (docs) => {
        const admissionsData = docs.map((doc: any) => ({
          ...doc,
          createdAt: convertTimestamp(doc.createdAt),
          updatedAt: convertTimestamp(doc.updatedAt),
        })) as AdmissionApplication[];
        setAdmissions(admissionsData);
      },
      undefined,
      "createdAt",
      "desc"
    );

    return () => unsubscribe();
  }, []);

  const handleApprove = async (admission: AdmissionApplication) => {
    const admissionRoll = prompt("ভর্তি রোল নম্বর দিন:");
    const assignedClass = prompt("ক্লাস নির্ধারণ করুন:");
    
    if (!admissionRoll || !assignedClass) return;

    try {
      await updateDocument("admissions", admission.id, {
        status: "approved",
        admissionRoll,
        assignedClass,
      });

      // Create student record
      await createDocument("students", {
        name: admission.studentName,
        nameBn: admission.studentNameBn,
        class: assignedClass,
        roll: admissionRoll,
        admissionYear: new Date().getFullYear().toString(),
        admissionRoll,
        fatherName: admission.fatherName,
        motherName: admission.motherName,
        address: admission.address,
        phone: admission.phone,
        email: admission.email,
      });
    } catch (error: any) {
      alert(error.message || "অনুমোদন ব্যর্থ হয়েছে");
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("আপনি কি এই আবেদনটি বাতিল করতে চান?")) return;

    try {
      await updateDocument("admissions", id, { status: "cancelled" });
    } catch (error: any) {
      alert(error.message || "বাতিল করা ব্যর্থ হয়েছে");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("আপনি কি এই আবেদনটি মুছে ফেলতে চান?")) return;

    try {
      await deleteDocument("admissions", id);
    } catch (error: any) {
      alert(error.message || "মুছে ফেলা ব্যর্থ হয়েছে");
    }
  };

  const filteredAdmissions = admissions.filter((a) =>
    filter === "all" ? true : a.status === filter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">অনলাইন ভর্তি আবেদন</h1>
        <p className="text-gray-600">ভর্তি আবেদনগুলো পর্যালোচনা করুন এবং অনুমোদন করুন</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            সব
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-4 py-2 rounded-lg ${
              filter === "pending"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            মুলতুবি
          </button>
          <button
            onClick={() => setFilter("approved")}
            className={`px-4 py-2 rounded-lg ${
              filter === "approved"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            অনুমোদিত
          </button>
          <button
            onClick={() => setFilter("cancelled")}
            className={`px-4 py-2 rounded-lg ${
              filter === "cancelled"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            বাতিল
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  শিক্ষার্থীর নাম
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  পিতার নাম
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ক্লাস
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ফোন
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  স্ট্যাটাস
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  তারিখ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  কাজ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAdmissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    কোনো আবেদন নেই
                  </td>
                </tr>
              ) : (
                filteredAdmissions.map((admission) => (
                  <tr key={admission.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {admission.studentName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {admission.studentNameBn}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {admission.fatherName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {admission.appliedClass}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {admission.phone}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          admission.status
                        )}`}
                      >
                        {admission.status === "pending"
                          ? "মুলতুবি"
                          : admission.status === "approved"
                          ? "অনুমোদিত"
                          : "বাতিল"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {format(admission.createdAt, "dd MMM yyyy")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {admission.status === "pending" && (
                          <button
                            onClick={() => handleApprove(admission)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded"
                            title="অনুমোদন করুন"
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}
                        {admission.status === "pending" && (
                          <button
                            onClick={() => handleCancel(admission.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                            title="বাতিল করুন"
                          >
                            <XCircle size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(admission.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="মুছে ফেলুন"
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

