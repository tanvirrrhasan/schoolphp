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
import { CommitteeMember } from "@/types";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type FormValues = {
  name: string;
  designation: string;
  bio?: string;
  published: boolean;
};

type EditCommitteeProps = {
  id?: string;
};

export default function EditCommitteePageClient({ id }: EditCommitteeProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [member, setMember] = useState<CommitteeMember | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      designation: "",
      bio: "",
      published: false,
    },
  });

  useEffect(() => {
    const loadMember = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const data = await getDocument("committee", id);
        if (data) {
          const dataAny = data as any;
          const memberData = {
            ...dataAny,
            createdAt: convertTimestamp(dataAny.createdAt),
            updatedAt: convertTimestamp(dataAny.updatedAt),
          } as CommitteeMember;
          setMember(memberData);
          setPhotoPreview(memberData.photo || null);
          setValue("name", memberData.name || memberData.nameBn);
          setValue("designation", memberData.designation || memberData.designationBn);
          setValue("bio", memberData.bio || memberData.bioBn || "");
          setValue("published", !!memberData.published);
        }
      } catch (error: any) {
        alert(error.message || "সদস্য লোড করা যায়নি");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadMember();
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

  const onSubmit = async (data: FormValues) => {
    if (!id) return;
    setSaving(true);
    try {
      let photoUrl = member?.photo || "";

      if (photo) {
        const existingData = {
          name: data.name,
          nameBn: data.name,
          photo: member?.photo || "",
          designation: data.designation,
          designationBn: data.designation,
          bio: data.bio || "",
          bioBn: data.bio || "",
          published: data.published,
        };
        photoUrl = await uploadFile(photo, `committee/${Date.now()}_${photo.name}`, existingData);
      }

      const memberData = {
        name: data.name,
        nameBn: data.name,
        photo: photoUrl,
        designation: data.designation,
        designationBn: data.designation,
        bio: data.bio || "",
        bioBn: data.bio || "",
        published: data.published,
      };

      await updateDocument("committee", id, memberData);
      router.push("/admin/committee");
    } catch (error: any) {
      alert(error.message || "সদস্য আপডেট ব্যর্থ হয়েছে");
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
        <Link href="/admin/committee" className="text-blue-600 mt-4 inline-block">
          ফিরে যান
        </Link>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">সদস্য পাওয়া যায়নি</p>
        <Link href="/admin/committee" className="text-blue-600 mt-4 inline-block">
          ফিরে যান
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/admin/committee"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft size={20} />
          ফিরে যান
        </Link>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">কমিটি সদস্য সম্পাদনা</h1>
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
              পদবী *
            </label>
            <input
              {...register("designation", { required: "পদবী প্রয়োজন" })}
              type="text"
              placeholder="বাংলা বা ইংরেজি পদবী"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.designation && (
              <p className="mt-1 text-sm text-red-600">
                {errors.designation.message as string}
              </p>
            )}
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
              জীবনী
            </label>
            <textarea
              {...register("bio")}
              rows={4}
              placeholder="বাংলা বা ইংরেজি জীবনী"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
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
            href="/admin/committee"
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            বাতিল
          </Link>
        </div>
      </form>
    </div>
  );
}


