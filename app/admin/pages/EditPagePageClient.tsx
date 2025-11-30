"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  getDocument,
  updateDocument,
  getDocuments,
  convertTimestamp,
} from "@/lib/firebase/firestore";
import { uploadFile } from "@/lib/firebase/storage";
import { WebPage } from "@/types";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type FormValues = {
  title: string;
  description: string;
  url: string;
  published: string;
};

type EditPageProps = {
  id?: string;
};

export default function EditPagePageClient({ id }: EditPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState<WebPage | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormValues>({
    defaultValues: {
      title: "",
      description: "",
      url: "",
      published: "false",
    },
  });

  useEffect(() => {
    const loadPage = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const data = await getDocument("pages", id);
        if (data) {
          const dataAny = data as any;
          const pageData = {
            ...dataAny,
            createdAt: convertTimestamp(dataAny.createdAt),
            updatedAt: convertTimestamp(dataAny.updatedAt),
          } as WebPage;
          setPage(pageData);
          setImagePreview(pageData.image || null);
          setValue("title", pageData.title || pageData.titleBn);
          setValue("description", pageData.description || pageData.descriptionBn);
          setValue("url", pageData.url);
          setValue("published", pageData.published ? "true" : "false");
        }
      } catch (error: any) {
        alert(error.message || "পেজ লোড করা যায়নি");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadPage();
    }
  }, [id, setValue]);

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

  const onSubmit = async (data: FormValues) => {
    if (!id || !page) return;
    setSaving(true);
    try {
      // Check if URL already exists (excluding current page)
      if (data.url !== page?.url) {
        const existingPages = await getDocuments("pages", [
          { field: "url", operator: "==", value: data.url },
        ]);

        if (existingPages.length > 0) {
          alert("এই URL ইতিমধ্যে ব্যবহৃত হয়েছে");
          setSaving(false);
          return;
        }
      }

      let imageUrl = page?.image || "";

      if (image) {
        imageUrl = await uploadFile(image, `pages/${Date.now()}_${image.name}`);
      }

      const pageData = {
        title: data.title,
        titleBn: data.title,
        description: data.description,
        descriptionBn: data.description,
        image: imageUrl,
        url: data.url,
        published: data.published === "true",
      };

      await updateDocument("pages", id, pageData);
      router.push("/admin/pages");
    } catch (error: any) {
      alert(error.message || "পেজ আপডেট ব্যর্থ হয়েছে");
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

  if (!id) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">সম্পাদনার জন্য বৈধ আইডি পাওয়া যায়নি</p>
        <Link href="/admin/pages" className="text-blue-600 mt-4 inline-block">
          ফিরে যান
        </Link>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">পেজ পাওয়া যায়নি</p>
        <Link href="/admin/pages" className="text-blue-600 mt-4 inline-block">
          ফিরে যান
        </Link>
      </div>
    );
  }

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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">পেজ সম্পাদনা</h1>
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
              URL (ইংরেজি) *
            </label>
            <input
              {...register("url", {
                required: "URL প্রয়োজন",
                pattern: {
                  value: /^[a-z0-9-]+$/,
                  message: "URL শুধুমাত্র ছোট হাতের অক্ষর, সংখ্যা এবং হাইফেন হতে পারবে",
                },
              })}
              type="text"
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
            প্রকাশের অবস্থা
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
            {saving ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
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

