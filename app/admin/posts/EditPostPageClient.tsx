"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

type FormValues = {
  title: string;
  description: string;
  category: string;
  published: boolean;
};

type EditPostProps = {
  id?: string;
};

export default function EditPostPageClient({ id }: EditPostProps) {
  const router = useRouter();
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
  } = useForm<FormValues>({
    defaultValues: {
      title: "",
      description: "",
      category: "",
      published: false,
    },
  });

  useEffect(() => {
    const loadPost = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

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
          setValue("published", !!postData.published);
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

  const onSubmit = async (data: FormValues) => {
    if (!id || !post) return;
    setSaving(true);
    try {
      let imageUrl = post?.image || "";

      if (image) {
        imageUrl = await uploadFile(image, `posts/${Date.now()}_${image.name}`);
      }

      const postData = {
        title: data.title,
        titleBn: data.title,
        description: data.description,
        descriptionBn: data.description,
        category: data.category,
        categoryBn: data.category,
        image: imageUrl,
        published: data.published,
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

  if (!id) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">সম্পাদনার জন্য বৈধ আইডি পাওয়া যায়নি</p>
        <Link href="/admin/posts" className="text-blue-600 mt-4 inline-block">
          ফিরে যান
        </Link>
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

        <div className="flex items-center gap-3">
          <input
            {...register("published")}
            type="checkbox"
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          />
          <label className="block text-sm font-medium text-gray-700">
            প্রকাশিত
          </label>
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

