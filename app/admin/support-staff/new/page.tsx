"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createDocument } from "@/lib/firebase/firestore";
import { uploadFile } from "@/lib/firebase/storage";

type FormValues = {
  name: string;
  role: string;
  phone?: string;
  email?: string;
  published: string;
};

export default function NewSupportStaffPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      let photoUrl = "";
      if (photo) {
        photoUrl = await uploadFile(photo, `supportStaff/${Date.now()}_${photo.name}`);
      }

      await createDocument("supportStaff", {
        name: data.name,
        nameBn: data.name, // Use same value for both
        role: data.role,
        roleBn: data.role, // Use same value for both
        phone: data.phone || "",
        email: data.email || "",
        photo: photoUrl,
        published: data.published === "true",
      });

      router.push("/admin/support-staff");
    } catch (error: any) {
      alert(error.message || "ডেটা সংরক্ষণ ব্যর্থ হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/admin/support-staff"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft size={20} />
          তালিকায় ফিরে যান
        </Link>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">নতুন সহায়ক কর্মী</h1>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-lg shadow-md p-6 space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              নাম * (বাংলা বা ইংরেজি)
            </label>
            <input
              type="text"
              {...register("name", { required: "নাম প্রয়োজন" })}
              placeholder="বাংলা বা ইংরেজি যেকোনো ভাষায় লিখুন"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              পদবি * (বাংলা বা ইংরেজি)
            </label>
            <input
              type="text"
              {...register("role", { required: "পদবি প্রয়োজন" })}
              placeholder="বাংলা বা ইংরেজি যেকোনো ভাষায় লিখুন"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.role && (
              <p className="text-sm text-red-600 mt-1">{errors.role.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ফোন নম্বর
            </label>
            <input
              type="tel"
              {...register("phone")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ইমেইল
            </label>
            <input
              type="email"
              {...register("email")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ছবি
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          {photoPreview && (
            <div className="mt-3">
              <img
                src={photoPreview}
                alt="Preview"
                className="w-48 h-36 object-cover rounded-lg shadow"
              />
            </div>
          )}
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
            href="/admin/support-staff"
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            বাতিল
          </Link>
        </div>
      </form>
    </div>
  );
}


