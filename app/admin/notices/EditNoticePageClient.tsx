"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  getDocument,
  updateDocument,
  convertTimestamp,
} from "@/lib/firebase/firestore";
import { uploadMultipleFiles } from "@/lib/firebase/storage";
import { toFirestoreTimestamp } from "@/lib/firebase/firestore";
import { Notice } from "@/types";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type FormValues = {
  title: string;
  description: string;
  scheduledTime?: string;
  published: boolean;
};

type EditNoticeProps = {
  id?: string;
};

export default function EditNoticePageClient({ id }: EditNoticeProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormValues>({
    defaultValues: {
      title: "",
      description: "",
      scheduledTime: "",
      published: false,
    },
  });

  useEffect(() => {
    const loadNotice = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const data = await getDocument("notices", id);
        if (data) {
          const dataAny = data as any;
          const noticeData = {
            ...dataAny,
            createdAt: convertTimestamp(dataAny.createdAt),
            updatedAt: convertTimestamp(dataAny.updatedAt),
            scheduledTime: dataAny.scheduledTime
              ? convertTimestamp(dataAny.scheduledTime)
              : undefined,
          } as Notice;
          setNotice(noticeData);
          setExistingAttachments(noticeData.attachments || []);
          setValue("title", noticeData.title);
          setValue("description", noticeData.description);
          setValue("published", !!noticeData.published);
          if (noticeData.scheduledTime) {
            const date = new Date(noticeData.scheduledTime);
            setValue("scheduledTime", date.toISOString().slice(0, 16));
          }
        }
      } catch (error: any) {
        alert(error.message || "নোটিশ লোড করা যায়নি");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadNotice();
    }
  }, [id, setValue]);

  const onSubmit = async (data: FormValues) => {
    if (!id) return;
    setSaving(true);
    try {
      let attachmentUrls = [...existingAttachments];
      const isPublished = !!data.published;

      if (attachments.length > 0) {
        const existingData = {
          title: data.title,
          description: data.description,
          attachments: existingAttachments,
          published: isPublished,
          scheduledTime: data.scheduledTime
            ? new Date(data.scheduledTime).toISOString()
            : null,
        };
        const newUrls = await uploadMultipleFiles(attachments, "notices", existingData);
        attachmentUrls = [...attachmentUrls, ...newUrls];
      }

      const noticeData = {
        title: data.title,
        description: data.description,
        attachments: attachmentUrls,
        published: isPublished,
        scheduledTime: data.scheduledTime
          ? toFirestoreTimestamp(new Date(data.scheduledTime))
          : null,
      };

      await updateDocument("notices", id, noticeData);
      router.push("/admin/notices");
    } catch (error: any) {
      alert(error.message || "নোটিশ আপডেট ব্যর্থ হয়েছে");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveAttachment = (url: string) => {
    if (!confirm("আপনি কি এই সংযুক্তিটি সরাতে চান?")) return;
    setExistingAttachments((prev) => prev.filter((u) => u !== url));
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
        <Link href="/admin/notices" className="text-blue-600 mt-4 inline-block">
          ফিরে যান
        </Link>
      </div>
    );
  }

  if (!notice) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">নোটিশ পাওয়া যায়নি</p>
        <Link href="/admin/notices" className="text-blue-600 mt-4 inline-block">
          ফিরে যান
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/admin/notices"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft size={20} />
          ফিরে যান
        </Link>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">নোটিশ সম্পাদনা</h1>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-lg shadow-md p-6 space-y-6"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            শিরোনাম *
          </label>
          <input
            {...register("title", { required: "শিরোনাম প্রয়োজন" })}
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message as string}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            বিবরণ *
          </label>
          <textarea
            {...register("description", { required: "বিবরণ প্রয়োজন" })}
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">
              {errors.description.message as string}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            নতুন সংযুক্তি
          </label>
          <input
            type="file"
            multiple
            onChange={(e) => {
              if (e.target.files) {
                setAttachments(Array.from(e.target.files));
              }
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        {existingAttachments.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              বিদ্যমান সংযুক্তি
            </label>
            <div className="space-y-2">
              {existingAttachments.map((url, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    {url.split("/").pop()}
                  </a>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(url)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    সরান
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            নির্ধারিত সময় (ঐচ্ছিক)
          </label>
          <input
            {...register("scheduledTime")}
            type="datetime-local"
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

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
          </button>
          <Link
            href="/admin/notices"
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            বাতিল
          </Link>
        </div>
      </form>
    </div>
  );
}


