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
import { Routine } from "@/types";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function EditRoutinePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [pdf, setPdf] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  useEffect(() => {
    const loadRoutine = async () => {
      try {
        const data = await getDocument("routines", id);
        if (data) {
          const dataAny = data as any;
          const routineData = {
            ...dataAny,
            createdAt: convertTimestamp(dataAny.createdAt),
            updatedAt: convertTimestamp(dataAny.updatedAt),
          } as Routine;
          setRoutine(routineData);
          setValue("title", routineData.title || routineData.titleBn);
          setValue("type", routineData.type);
          setValue("class", routineData.class || "");
          setValue("published", routineData.published ? "true" : "false");
        }
      } catch (error: any) {
        alert(error.message || "রুটিন লোড করা যায়নি");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadRoutine();
    }
  }, [id, setValue]);

  const onSubmit = async (data: any) => {
    setSaving(true);
    try {
      let imageUrl = routine?.image || "";
      let pdfUrl = routine?.pdf || "";

      if (image) {
        // Calculate existing data size to determine available space
        const existingData = {
          title: data.title,
          titleBn: data.title,
          type: data.type,
          classId: data.classId,
          image: routine?.image || "",
          pdf: routine?.pdf || "",
          published: data.published === "true",
        };
        imageUrl = await uploadFile(image, `routines/${Date.now()}_${image.name}`, existingData);
      }

      if (pdf) {
        // Calculate existing data size including new image
        const existingData = {
          title: data.title,
          titleBn: data.title,
          type: data.type,
          classId: data.classId,
          image: imageUrl || routine?.image || "",
          pdf: routine?.pdf || "",
          published: data.published === "true",
        };
        pdfUrl = await uploadFile(pdf, `routines/${Date.now()}_${pdf.name}`, existingData);
      }

      const routineData = {
        title: data.title,
        titleBn: data.title, // Same value for both
        type: data.type,
        class: data.class || "",
        image: imageUrl,
        pdf: pdfUrl,
        published: data.published === "true",
      };

      await updateDocument("routines", id, routineData);
      router.push("/admin/routines");
    } catch (error: any) {
      alert(error.message || "রুটিন আপডেট ব্যর্থ হয়েছে");
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

  if (!routine) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">রুটিন পাওয়া যায়নি</p>
        <Link href="/admin/routines" className="text-blue-600 mt-4 inline-block">
          ফিরে যান
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/admin/routines"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft size={20} />
          ফিরে যান
        </Link>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">রুটিন সম্পাদনা</h1>
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
              ধরন *
            </label>
            <select
              {...register("type", { required: "ধরন প্রয়োজন" })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="class">ক্লাস</option>
              <option value="exam">পরীক্ষা</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ক্লাস (ঐচ্ছিক)
            </label>
            <input
              {...register("class")}
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              নতুন ছবি
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setImage(e.target.files[0]);
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            {routine.image && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-1">বিদ্যমান ছবি:</p>
                <img src={routine.image} alt="Routine" className="w-32 h-32 object-cover rounded" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              নতুন PDF
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setPdf(e.target.files[0]);
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            {routine.pdf && (
              <div className="mt-2">
                <a
                  href={routine.pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  বিদ্যমান PDF দেখুন
                </a>
              </div>
            )}
          </div>
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
            href="/admin/routines"
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            বাতিল
          </Link>
        </div>
      </form>
    </div>
  );
}

