"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  getDocument,
  updateDocument,
  convertTimestamp,
} from "@/lib/firebase/firestore";
import { uploadFile } from "@/lib/firebase/storage";
import { Post } from "@/types";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [post, setPost] = useState<Post | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  useEffect(() => {
    const loadPost = async () => {
      try {
        const data = await getDocument("posts", id);
        if (data) {
          const dataAny = data as any;
          const postData = {
            ...dataAny,
            createdAt: convertTimestamp(dataAny.createdAt),
            updatedAt: convertTimestamp(dataAny.updatedAt),
          } as Post;
          setPost(postData);
          setImagePreview(postData.image || null);
          setValue("title", postData.title || postData.titleBn);
          setValue("description", postData.description || postData.descriptionBn);
          setValue("category", postData.category || postData.categoryBn);
          setValue("published", postData.published ? "true" : "false");
        }
      } catch (error: any) {
        alert(error.message || "পোস্ট লোড করা যায়নি");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadPost();
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

  const onSubmit = async (data: any) => {
    setSaving(true);
    try {
      let imageUrl = post?.image || "";

      if (image) {
        // Calculate existing data size to determine available space
        const existingData = {
          title: data.title,
          titleBn: data.title,
          description: data.description,
          descriptionBn: data.description,
          category: data.category,
          categoryBn: data.category,
          image: post?.image || "",
          published: data.published === "true",
        };
        imageUrl = await uploadFile(image, `posts/${Date.now()}_${image.name}`, existingData);
      }

      const postData = {
        title: data.title,
        titleBn: data.title, // Same value for both
        description: data.description,
        descriptionBn: data.description, // Same value for both
        category: data.category,
        categoryBn: data.category, // Same value for both
        image: imageUrl,
        published: data.published === "true",
      };

      await updateDocument("posts", id, postData);
      router.push("/admin/posts");
    } catch (error: any) {
      alert(error.message || "পোস্ট আপডেট ব্যর্থ হয়েছে");
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

  if (!post) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">পোস্ট পাওয়া যায়নি</p>
        <Link href="/admin/posts" className="text-blue-600 mt-4 inline-block">
          ফিরে যান
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/admin/posts"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft size={20} />
          ফিরে যান
        </Link>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">পোস্ট সম্পাদনা</h1>
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
              বিভাগ *
            </label>
            <input
              {...register("category", { required: "বিভাগ প্রয়োজন" })}
              type="text"
              placeholder="বাংলা বা ইংরেজি বিভাগ"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category.message as string}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            বিবরণ *
          </label>
          <textarea
            {...register("description", { required: "বিবরণ প্রয়োজন" })}
            rows={6}
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
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
          </button>
          <Link
            href="/admin/posts"
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            বাতিল
          </Link>
        </div>
      </form>
    </div>
  );
}

