"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { createDocument, getDocuments } from "@/lib/firebase/firestore";
import { uploadFile } from "@/lib/firebase/storage";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewPagePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      // Check if URL already exists
      const existingPages = await getDocuments("pages", [
        { field: "url", operator: "==", value: data.url },
      ]);

      if (existingPages.length > 0) {
        alert("এই URL ইতিমধ্যে ব্যবহার করা হয়েছে");
        setLoading(false);
        return;
      }

      let imageUrl = "";
      if (image) {
        imageUrl = await uploadFile(image, `pages/${Date.now()}_${image.name}`);
      }

      const pageData = {
        title: data.title,
        titleBn: data.title, // Same value for both
        description: data.description,
        descriptionBn: data.description, // Same value for both
        image: imageUrl,
        url: data.url,
        published: data.published === "true",
      };

      await createDocument("pages", pageData);
      router.push("/admin/pages");
    } catch (error: any) {
      alert(error.message || "পেজ তৈরি ব্যর্থ হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/admin/pages"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft size={20} />
          ফিরে যান
        </Link>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">নতুন ওয়েব পেজ</h1>
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

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL (ইউনিক) *
            </label>
            <input
              {...register("url", {
                required: "URL প্রয়োজন",
                pattern: {
                  value: /^[a-z0-9-]+$/,
                  message: "URL শুধুমাত্র ছোট হাতের অক্ষর, সংখ্যা এবং হাইফেন হতে পারে",
                },
              })}
              type="text"
              placeholder="history"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.url && (
              <p className="mt-1 text-sm text-red-600">{errors.url.message as string}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">পেজটি /{`{url}`} এ পাওয়া যাবে</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            বিবরণ *
          </label>
          <textarea
            {...register("description", { required: "বিবরণ প্রয়োজন" })}
            rows={8}
            placeholder="বাংলা বা ইংরেজি বিবরণ"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">
              {errors.description.message as string}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">ছবি</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          {imagePreview && (
            <div className="mt-2">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-64 h-48 object-cover rounded"
              />
            </div>
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
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
          </button>
          <Link
            href="/admin/pages"
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            বাতিল
          </Link>
        </div>
      </form>
    </div>
  );
}

