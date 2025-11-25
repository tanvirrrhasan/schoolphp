"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  createDocument,
  toFirestoreTimestamp,
} from "@/lib/firebase/firestore";
import { uploadFile } from "@/lib/firebase/storage";

type FormValues = {
  title: string;
  titleBn: string;
  examName?: string;
  examNameBn?: string;
  session?: string;
  description?: string;
  descriptionBn?: string;
  publishedAt?: string;
  published: string;
};

export default function NewResultPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      let fileUrl = "";
      if (file) {
        fileUrl = await uploadFile(file, `results/${Date.now()}_${file.name}`);
      }

      await createDocument("results", {
        title: data.title,
        titleBn: data.titleBn || data.title,
        examName: data.examName || "",
        examNameBn: data.examNameBn || data.examName || "",
        session: data.session || "",
        description: data.description || "",
        descriptionBn: data.descriptionBn || data.description || "",
        fileUrl,
        published: data.published === "true",
        publishedAt: toFirestoreTimestamp(
          data.publishedAt || new Date().toISOString()
        ),
      });

      router.push("/admin/results");
    } catch (error: any) {
      alert(error.message || "ফলাফল সংরক্ষণ ব্যর্থ হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/admin/results"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft size={20} />
          তালিকায় ফিরে যান
        </Link>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">নতুন ফলাফল</h1>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-lg shadow-md p-6 space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              শিরোনাম (ইংরেজি/বাংলা) *
            </label>
            <input
              type="text"
              {...register("title", { required: "শিরোনাম প্রয়োজন" })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.title && (
              <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              শিরোনাম (বাংলা)
            </label>
            <input
              type="text"
              {...register("titleBn")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              পরীক্ষার নাম
            </label>
            <input
              type="text"
              {...register("examName")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              পরীক্ষার নাম (বাংলা)
            </label>
            <input
              type="text"
              {...register("examNameBn")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              শিক্ষাবর্ষ
            </label>
            <input
              type="text"
              {...register("session")}
              placeholder="যেমন: ২০২৪"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              প্রকাশের তারিখ
            </label>
            <input
              type="date"
              {...register("publishedAt")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            বিবরণ
          </label>
          <textarea
            rows={4}
            {...register("description")}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            বিবরণ (বাংলা)
          </label>
          <textarea
            rows={4}
            {...register("descriptionBn")}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ফলাফলের ফাইল (PDF/ইমেজ)
          </label>
          <input
            type="file"
            accept=".pdf,image/*"
            onChange={handleFileChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
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
            href="/admin/results"
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            বাতিল
          </Link>
        </div>
      </form>
    </div>
  );
}


