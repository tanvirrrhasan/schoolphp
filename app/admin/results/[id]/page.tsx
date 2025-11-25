"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  getDocument,
  updateDocument,
  convertTimestamp,
  toFirestoreTimestamp,
} from "@/lib/firebase/firestore";
import { uploadFile } from "@/lib/firebase/storage";
import { Result } from "@/types";
import { format } from "date-fns";

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

export default function EditResultPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormValues>();

  useEffect(() => {
    const loadResult = async () => {
      try {
        const data = await getDocument("results", id);
        if (data) {
          const resultData = {
            ...data,
            createdAt: convertTimestamp(data.createdAt),
            updatedAt: convertTimestamp(data.updatedAt),
            publishedAt: data.publishedAt ? convertTimestamp(data.publishedAt) : undefined,
          } as Result;
          setResult(resultData);
          setValue("title", resultData.title);
          setValue("titleBn", resultData.titleBn || resultData.title);
          setValue("examName", resultData.examName || "");
          setValue("examNameBn", resultData.examNameBn || resultData.examName || "");
          setValue("session", resultData.session || "");
          setValue("description", resultData.description || "");
          setValue("descriptionBn", resultData.descriptionBn || resultData.description || "");
          setValue(
            "publishedAt",
            resultData.publishedAt ? format(resultData.publishedAt, "yyyy-MM-dd") : ""
          );
          setValue("published", resultData.published ? "true" : "false");
        } else {
          alert("ফলাফল পাওয়া যায়নি");
        }
      } catch (error: any) {
        alert(error.message || "ফলাফল লোড করা যায়নি");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadResult();
    }
  }, [id, setValue]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const onSubmit = async (data: FormValues) => {
    if (!result) return;
    setSaving(true);
    try {
      let fileUrl = result.fileUrl || "";
      if (file) {
        fileUrl = await uploadFile(file, `results/${Date.now()}_${file.name}`);
      }

      await updateDocument("results", result.id, {
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
          data.publishedAt || result.publishedAt?.toISOString() || new Date().toISOString()
        ),
      });

      router.push("/admin/results");
    } catch (error: any) {
      alert(error.message || "আপডেট ব্যর্থ হয়েছে");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">ফলাফল পাওয়া যায়নি</p>
        <Link href="/admin/results" className="text-blue-600 mt-4 inline-block">
          ফিরে যান
        </Link>
      </div>
    );
  }

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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">ফলাফল সম্পাদনা</h1>
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
            ফলাফলের ফাইল
          </label>
          <input
            type="file"
            accept=".pdf,image/*"
            onChange={handleFileChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          {result.fileUrl && !file && (
            <p className="text-sm text-gray-500 mt-2">
              বর্তমান ফাইল:{" "}
              <a
                href={result.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                দেখতে ক্লিক করুন
              </a>
            </p>
          )}
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
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "আপডেট হচ্ছে..." : "আপডেট করুন"}
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


