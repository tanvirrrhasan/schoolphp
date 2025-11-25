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
import { Alumni } from "@/types";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function EditAlumniPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alumni, setAlumni] = useState<Alumni | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  useEffect(() => {
    const loadAlumni = async () => {
      try {
        const data = await getDocument("alumni", id);
        if (data) {
          const alumniData = {
            ...data,
            createdAt: convertTimestamp(data.createdAt),
            updatedAt: convertTimestamp(data.updatedAt),
          } as Alumni;
          setAlumni(alumniData);
          setPhotoPreview(alumniData.photo || null);
          setValue("name", alumniData.name || alumniData.nameBn);
          setValue("graduationYear", alumniData.graduationYear);
          setValue("currentPosition", alumniData.currentPosition || alumniData.currentPositionBn || "");
          setValue("achievement", alumniData.achievement || alumniData.achievementBn || "");
          setValue("published", alumniData.published ? "true" : "false");
        }
      } catch (error: any) {
        alert(error.message || "প্রাক্তন ছাত্র/ছাত্রী লোড করা যায়নি");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadAlumni();
    }
  }, [id, setValue]);

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
    setSaving(true);
    try {
      let photoUrl = alumni?.photo || "";

      if (photo) {
        // Calculate existing data size to determine available space
        const existingData = {
          name: data.name,
          nameBn: data.name,
          photo: alumni?.photo || "",
          graduationYear: data.graduationYear,
          currentPosition: data.currentPosition || "",
          currentPositionBn: data.currentPosition || "",
          achievement: data.achievement || "",
          achievementBn: data.achievement || "",
          published: data.published === "true",
        };
        photoUrl = await uploadFile(photo, `alumni/${Date.now()}_${photo.name}`, existingData);
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

      await updateDocument("alumni", id, alumniData);
      router.push("/admin/alumni");
    } catch (error: any) {
      alert(error.message || "প্রাক্তন ছাত্র/ছাত্রী আপডেট ব্যর্থ হয়েছে");
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

  if (!alumni) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">প্রাক্তন ছাত্র/ছাত্রী পাওয়া যায়নি</p>
        <Link href="/admin/alumni" className="text-blue-600 mt-4 inline-block">
          ফিরে যান
        </Link>
      </div>
    );
  }

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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">প্রাক্তন ছাত্র-ছাত্রী সম্পাদনা</h1>
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

