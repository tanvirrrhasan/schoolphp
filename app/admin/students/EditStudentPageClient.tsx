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
import { Student } from "@/types";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type FormValues = {
  name: string;
  class: string;
  roll: string;
  admissionYear: string;
  admissionRoll: string;
  fatherName: string;
  motherName: string;
  address: string;
  phone: string;
  email: string;
};

type EditStudentProps = {
  id?: string;
};

export default function EditStudentPageClient({ id }: EditStudentProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [student, setStudent] = useState<Student | null>(null);
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
      class: "",
      roll: "",
      admissionYear: "",
      admissionRoll: "",
      fatherName: "",
      motherName: "",
      address: "",
      phone: "",
      email: "",
    },
  });

  useEffect(() => {
    const loadStudent = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const data = await getDocument("students", id);
        if (data) {
          const dataAny = data as any;
          const studentData = {
            ...dataAny,
            createdAt: convertTimestamp(dataAny.createdAt),
            updatedAt: convertTimestamp(dataAny.updatedAt),
          } as Student;
          setStudent(studentData);
          setPhotoPreview(studentData.photo || null);
          setValue("name", studentData.name || studentData.nameBn);
          setValue("class", studentData.class);
          setValue("roll", studentData.roll);
          setValue("admissionYear", studentData.admissionYear);
          setValue("admissionRoll", studentData.admissionRoll || "");
          setValue("fatherName", studentData.fatherName || "");
          setValue("motherName", studentData.motherName || "");
          setValue("address", studentData.address || "");
          setValue("phone", studentData.phone || "");
          setValue("email", studentData.email || "");
        }
      } catch (error: any) {
        alert(error.message || "ছাত্র/ছাত্রী লোড করা যায়নি");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadStudent();
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
    if (!id || !student) return;
    setSaving(true);
    try {
      let photoUrl = student?.photo || "";

      if (photo) {
        photoUrl = await uploadFile(photo, `students/${Date.now()}_${photo.name}`);
      }

      const studentData = {
        name: data.name,
        nameBn: data.name,
        photo: photoUrl,
        class: data.class,
        roll: data.roll,
        admissionYear: data.admissionYear,
        admissionRoll: data.admissionRoll || "",
        fatherName: data.fatherName || "",
        motherName: data.motherName || "",
        address: data.address || "",
        phone: data.phone || "",
        email: data.email || "",
      };

      await updateDocument("students", id, studentData);
      router.push("/admin/students");
    } catch (error: any) {
      alert(error.message || "ছাত্র/ছাত্রী আপডেট ব্যর্থ হয়েছে");
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
        <Link href="/admin/students" className="text-blue-600 mt-4 inline-block">
          ফিরে যান
        </Link>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">ছাত্র/ছাত্রী পাওয়া যায়নি</p>
        <Link href="/admin/students" className="text-blue-600 mt-4 inline-block">
          ফিরে যান
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/admin/students"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft size={20} />
          ফিরে যান
        </Link>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">ছাত্র/ছাত্রী সম্পাদনা</h1>
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
              ক্লাস *
            </label>
            <input
              {...register("class", { required: "ক্লাস প্রয়োজন" })}
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.class && (
              <p className="mt-1 text-sm text-red-600">{errors.class.message as string}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              রোল নম্বর *
            </label>
            <input
              {...register("roll", { required: "রোল নম্বর প্রয়োজন" })}
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.roll && (
              <p className="mt-1 text-sm text-red-600">{errors.roll.message as string}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ভর্তির বছর *
            </label>
            <input
              {...register("admissionYear", { required: "ভর্তির বছর প্রয়োজন" })}
              type="text"
              placeholder="২০২৪"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.admissionYear && (
              <p className="mt-1 text-sm text-red-600">
                {errors.admissionYear.message as string}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ভর্তি রোল নম্বর
            </label>
            <input
              {...register("admissionRoll")}
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              পিতার নাম
            </label>
            <input
              {...register("fatherName")}
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              মাতার নাম
            </label>
            <input
              {...register("motherName")}
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ঠিকানা
            </label>
            <textarea
              {...register("address")}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ফোন নম্বর
            </label>
            <input
              {...register("phone")}
              type="tel"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ইমেইল
            </label>
            <input
              {...register("email")}
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
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
              <div className="mt-2">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-24 h-24 rounded-full object-cover"
                />
              </div>
            )}
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
            href="/admin/students"
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            বাতিল
          </Link>
        </div>
      </form>
    </div>
  );
}

