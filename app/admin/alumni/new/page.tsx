"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { createDocument } from "@/lib/firebase/firestore";
import { uploadFile } from "@/lib/firebase/storage";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewAlumniPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      let photoUrl = "";
      if (photo) {
        photoUrl = await uploadFile(photo, `alumni/${Date.now()}_${photo.name}`);
      }

      const alumniData = {
        name: data.name,
        nameBn: data.name, // Same value for both
        photo: photoUrl,
        graduationYear: data.graduationYear,
        currentPosition: data.currentPosition || "",
        currentPositionBn: data.currentPosition || "", // Same value for both
        achievement: data.achievement || "",
        achievementBn: data.achievement || "", // Same value for both
        published: data.published === "true",
      };

      await createDocument("alumni", alumniData);
      router.push("/admin/alumni");
    } catch (error: any) {
      alert(error.message || "প্রাক্তন ছাত্র/ছাত্রী যোগ করা ব্যর্থ হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/admin/alumni"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft size={20} />
          ফিরে যান
        </Link>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">নতুন প্রাক্তন ছাত্র-ছাত্রী</h1>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-lg shadow-md p-6 space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              নাম *
            </label>
            <input
              {...register("name", { required: "নাম প্রয়োজন" })}
              type="text"
              placeholder="বাংলা বা ইংরেজি নাম"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message as string}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              পাসের বছর *
            </label>
            <input
              {...register("graduationYear", { required: "পাসের বছর প্রয়োজন" })}
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.graduationYear && (
              <p className="mt-1 text-sm text-red-600">
                {errors.graduationYear.message as string}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              বর্তমান পদ
            </label>
            <input
              {...register("currentPosition")}
              type="text"
              placeholder="বাংলা বা ইংরেজি বর্তমান পদ"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">ছবি</label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            {photoPreview && (
              <div className="mt-2">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-32 h-32 rounded-full object-cover"
                />
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              অর্জন
            </label>
            <textarea
              {...register("achievement")}
              rows={4}
              placeholder="বাংলা বা ইংরেজি অর্জন"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
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
            href="/admin/alumni"
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            বাতিল
          </Link>
        </div>
      </form>
    </div>
  );
}

