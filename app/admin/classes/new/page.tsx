"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { createDocument } from "@/lib/firebase/firestore";
import Link from "next/link";
import { ArrowLeft, Plus, X } from "lucide-react";

export default function NewClassPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<any>({
    defaultValues: {
      name: "",
      capacity: "",
      status: "active",
      sections: "",
      subjects: [{ name: "", textbooks: [{ name: "" }] }],
    },
  });

  const {
    fields: subjectFields,
    append: appendSubject,
    remove: removeSubject,
  } = useFieldArray({
    control,
    name: "subjects",
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const classData = {
        name: data.name,
        nameBn: data.name, // Same value for both
        capacity: parseInt(data.capacity),
        status: data.status,
        subjects: data.subjects.map((subject: any) => ({
          id: Date.now().toString(),
          name: subject.name,
          nameBn: subject.name, // Same value for both
          textbooks: (subject.textbooks || []).map((book: any) => ({
            id: Date.now().toString() + Math.random(),
            name: book.name || "",
            nameBn: book.name || "", // Same value for both
            author: book.author || "",
            publisher: book.publisher || "",
          })),
        })),
        sections: data.sections ? data.sections.split(",").map((s: string) => s.trim()) : [],
      };

      await createDocument("classes", classData);
      router.push("/admin/classes");
    } catch (error: any) {
      alert(error.message || "ক্লাস তৈরি ব্যর্থ হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/admin/classes"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft size={20} />
          ফিরে যান
        </Link>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">নতুন ক্লাস</h1>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-lg shadow-md p-6 space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ক্লাস নাম *
            </label>
            <input
              {...register("name", { required: "ক্লাস নাম প্রয়োজন" })}
              type="text"
              placeholder="বাংলা বা ইংরেজি ক্লাস নাম"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message as string}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              সিট সংখ্যা *
            </label>
            <input
              {...register("capacity", { required: "সিট সংখ্যা প্রয়োজন" })}
              type="number"
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.capacity && (
              <p className="mt-1 text-sm text-red-600">
                {errors.capacity.message as string}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              স্ট্যাটাস *
            </label>
            <select
              {...register("status", { required: "স্ট্যাটাস প্রয়োজন" })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">সক্রিয়</option>
              <option value="inactive">নিষ্ক্রিয়</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              সেকশন (কমা দ্বারা আলাদা করুন)
            </label>
            <input
              {...register("sections")}
              type="text"
              placeholder="যেমন: A, B, C"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">
              বিষয়সমূহ *
            </label>
            <button
              type="button"
              onClick={() => appendSubject({ name: "", textbooks: [] })}
              className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
            >
              <Plus size={16} />
              বিষয় যোগ করুন
            </button>
          </div>

          <div className="space-y-4">
            {subjectFields.map((field, subjectIndex) => (
              <div key={field.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-700">বিষয় {subjectIndex + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeSubject(subjectIndex)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    বিষয় নাম
                  </label>
                  <input
                    {...register(`subjects.${subjectIndex}.name`)}
                    type="text"
                    placeholder="বাংলা বা ইংরেজি বিষয় নাম"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    পাঠ্যপুস্তক
                  </label>
                  <div className="space-y-2">
                    {[0, 1, 2].map((bookIndex) => (
                      <input
                        key={bookIndex}
                        {...register(`subjects.${subjectIndex}.textbooks.${bookIndex}.name`)}
                        type="text"
                        placeholder="পাঠ্যপুস্তক নাম (বাংলা বা ইংরেজি)"
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2"
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
          </button>
          <Link
            href="/admin/classes"
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            বাতিল
          </Link>
        </div>
      </form>
    </div>
  );
}

