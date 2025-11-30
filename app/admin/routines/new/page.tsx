"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { createDocument } from "@/lib/firebase/firestore";
import { uploadFile } from "@/lib/firebase/storage";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewRoutinePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [pdf, setPdf] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      let imageUrl = "";
      let pdfUrl = "";

      if (image) {
        imageUrl = await uploadFile(image, `routines/${Date.now()}_${image.name}`);
      }

      if (pdf) {
        pdfUrl = await uploadFile(pdf, `routines/${Date.now()}_${pdf.name}`);
      }

      const routineData = {
        title: data.title,
        titleBn: data.title, // Same value for both
        type: data.type,
        class: data.class || "",
        image: imageUrl,
        pdf: pdfUrl,
        published: data.published === "true",
      };

      await createDocument("routines", routineData);
      router.push("/admin/routines");
    } catch (error: any) {
      alert(error.message || "রুটিন তৈরি ব্যর্থ হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/admin/routines"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft size={20} />
          ফিরে যান
        </Link>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">নতুন রুটিন</h1>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-lg shadow-md p-6 space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              শিরোনাম *
            </label>
            <input
              {...register("title", { required: "শিরোনাম প্রয়োজন" })}
              type="text"
              placeholder="বাংলা বা ইংরেজি শিরোনাম"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message as string}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ধরন *
            </label>
            <select
              {...register("type", { required: "ধরন প্রয়োজন" })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="class">ক্লাস</option>
              <option value="exam">পরীক্ষা</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ক্লাস (ঐচ্ছিক)
            </label>
            <input
              {...register("class")}
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ছবি
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setImage(e.target.files[0]);
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PDF
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setPdf(e.target.files[0]);
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            {...register("published")}
            type="checkbox"
            defaultChecked={true}
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          />
          <label className="block text-sm font-medium text-gray-700">
            প্রকাশিত
          </label>
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
            href="/admin/routines"
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            বাতিল
          </Link>
        </div>
      </form>
    </div>
  );
}

