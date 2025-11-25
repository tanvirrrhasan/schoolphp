"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { createDocument } from "@/lib/firebase/firestore";
import { uploadMultipleFiles } from "@/lib/firebase/storage";
import { toFirestoreTimestamp } from "@/lib/firebase/firestore";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewNoticePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      let attachmentUrls: string[] = [];

      if (attachments.length > 0) {
        attachmentUrls = await uploadMultipleFiles(attachments, "notices");
      }

      const noticeData = {
        title: data.title,
        description: data.description,
        attachments: attachmentUrls,
        published: data.published === "true",
        scheduledTime: data.scheduledTime
          ? toFirestoreTimestamp(new Date(data.scheduledTime))
          : null,
      };

      await createDocument("notices", noticeData);
      router.push("/admin/notices");
    } catch (error: any) {
      alert(error.message || "নোটিশ তৈরি ব্যর্থ হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/admin/notices"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft size={20} />
          ফিরে যান
        </Link>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">নতুন নোটিশ</h1>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-lg shadow-md p-6 space-y-6"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            শিরোনাম *
          </label>
          <input
            {...register("title", { required: "শিরোনাম প্রয়োজন" })}
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message as string}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            বিবরণ *
          </label>
          <textarea
            {...register("description", { required: "বিবরণ প্রয়োজন" })}
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">
              {errors.description.message as string}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            সংযুক্তি
          </label>
          <input
            type="file"
            multiple
            onChange={(e) => {
              if (e.target.files) {
                setAttachments(Array.from(e.target.files));
              }
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            নির্ধারিত সময় (ঐচ্ছিক)
          </label>
          <input
            {...register("scheduledTime")}
            type="datetime-local"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            প্রকাশ করুন
          </label>
          <select
            {...register("published")}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="false">না</option>
            <option value="true">হ্যাঁ</option>
          </select>
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
            href="/admin/notices"
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            বাতিল
          </Link>
        </div>
      </form>
    </div>
  );
}

