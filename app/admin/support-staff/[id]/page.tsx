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
} from "@/lib/firebase/firestore";
import { uploadFile } from "@/lib/firebase/storage";
import { SupportStaff } from "@/types";

type FormValues = {
  name: string;
  nameBn: string;
  role: string;
  roleBn: string;
  phone?: string;
  email?: string;
  published: string;
};

export default function EditSupportStaffPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [member, setMember] = useState<SupportStaff | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormValues>();

  useEffect(() => {
    const loadMember = async () => {
      try {
        const data = await getDocument("supportStaff", id);
        if (data) {
          const staffData = {
            ...data,
            createdAt: convertTimestamp(data.createdAt),
            updatedAt: convertTimestamp(data.updatedAt),
          } as SupportStaff;
          setMember(staffData);
          setPhotoPreview(staffData.photo || null);
          setValue("name", staffData.name);
          setValue("nameBn", staffData.nameBn || staffData.name);
          setValue("role", staffData.role);
          setValue("roleBn", staffData.roleBn || staffData.role);
          setValue("phone", staffData.phone || "");
          setValue("email", staffData.email || "");
          setValue("published", staffData.published ? "true" : "false");
        } else {
          alert("কর্মীর তথ্য পাওয়া যায়নি");
        }
      } catch (error: any) {
        alert(error.message || "তথ্য লোড করা যায়নি");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadMember();
    }
  }, [id, setValue]);

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
    if (!member) return;
    setSaving(true);
    try {
      let photoUrl = member.photo || "";
      if (photo) {
        photoUrl = await uploadFile(photo, `supportStaff/${Date.now()}_${photo.name}`);
      }

      await updateDocument("supportStaff", member.id, {
        name: data.name,
        nameBn: data.nameBn || data.name,
        role: data.role,
        roleBn: data.roleBn || data.role,
        phone: data.phone || "",
        email: data.email || "",
        photo: photoUrl,
        published: data.published === "true",
      });

      router.push("/admin/support-staff");
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

  if (!member) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">কর্মীর তথ্য পাওয়া যায়নি</p>
        <Link href="/admin/support-staff" className="text-blue-600 mt-4 inline-block">
          ফিরে যান
        </Link>
      </div>
    );
  }

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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">তথ্য সম্পাদনা</h1>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-lg shadow-md p-6 space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              নাম (ইংরেজি) *
            </label>
            <input
              type="text"
              {...register("name", { required: "নাম প্রয়োজন" })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              নাম (বাংলা) *
            </label>
            <input
              type="text"
              {...register("nameBn", { required: "বাংলা নাম প্রয়োজন" })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.nameBn && (
              <p className="text-sm text-red-600 mt-1">{errors.nameBn.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              পদবি (ইংরেজি) *
            </label>
            <input
              type="text"
              {...register("role", { required: "পদবি প্রয়োজন" })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.role && (
              <p className="text-sm text-red-600 mt-1">{errors.role.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              পদবি (বাংলা) *
            </label>
            <input
              type="text"
              {...register("roleBn", { required: "বাংলা পদবি প্রয়োজন" })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.roleBn && (
              <p className="text-sm text-red-600 mt-1">{errors.roleBn.message}</p>
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


