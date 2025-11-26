"use client";

import { useRef, useState } from "react";
import JSZip from "jszip";
import {
  CloudUpload,
  CloudDownload,
  Download,
  Upload,
  Info,
} from "lucide-react";
import {
  createDocument,
  setDocument,
  getDocuments,
} from "@/lib/firebase/firestore";

const entityConfig = [
  { key: "students", label: "ছাত্র-ছাত্রী", collection: "students" },
  { key: "teachers", label: "শিক্ষক", collection: "teachers" },
  { key: "staff", label: "স্টাফ", collection: "staff" },
  { key: "notices", label: "নোটিশ", collection: "notices" },
  { key: "admissions", label: "ভর্তি আবেদন", collection: "admissions" },
  { key: "classes", label: "শ্রেণি", collection: "classes" },
  { key: "routines", label: "ক্লাস রুটিন", collection: "routines" },
  { key: "committee", label: "ব্যবস্থাপনা কমিটি", collection: "committee" },
  { key: "alumni", label: "প্রাক্তন ছাত্র-ছাত্রী", collection: "alumni" },
  { key: "posts", label: "সংবাদ ও পোস্ট", collection: "posts" },
  { key: "pages", label: "ওয়েব পেজ", collection: "pages" },
  { key: "media", label: "মিডিয়া লাইব্রেরি", collection: "media" },
] as const;

type EntityKey = (typeof entityConfig)[number]["key"];

export default function BulkUpDownPage() {
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});
  const [processing, setProcessing] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const triggerUpload = (key: string) => {
    if (fileInputs.current[key]) {
      fileInputs.current[key]!.value = "";
      fileInputs.current[key]!.click();
    }
  };

  const safeJsonParse = (text: string) => {
    try {
      return JSON.parse(text);
    } catch (error) {
      throw new Error("ফাইলটি বৈধ JSON ফরম্যাট নয়");
    }
  };

  const handleFileChange = async (
    entityKey: EntityKey,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.files || !event.target.files[0]) return;
    const file = event.target.files[0];
    const entity = entityConfig.find((item) => item.key === entityKey);
    if (!entity) return;

    try {
      setProcessing(entityKey);
      setStatus(null);

      const text = await file.text();
      let payload = safeJsonParse(text);

      if (!Array.isArray(payload)) {
        payload = [payload];
      }

      if (payload.length === 0) {
        throw new Error("JSON এর ভিতরে কোনো ডেটা পাওয়া যায়নি");
      }

      const operations = payload.map(async (item: any, index: number) => {
        if (typeof item !== "object" || item === null) {
          throw new Error(`আইটেম ${index + 1} অবজেক্ট নয়`);
        }

        if (item.id) {
          const { id, ...rest } = item;
          await setDocument(entity.collection, id, rest);
        } else {
          await createDocument(entity.collection, item);
        }
      });

      await Promise.all(operations);

      setStatus(
        `${entity.label} ডেটা (${payload.length} টি আইটেম) সফলভাবে আপলোড হয়েছে`
      );
    } catch (error: any) {
      alert(error.message || "Bulk upload ব্যর্থ হয়েছে");
    } finally {
      setProcessing(null);
    }
  };

  const downloadJson = (filename: string, data: any) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleDownload = async (entityKey: EntityKey) => {
    const entity = entityConfig.find((item) => item.key === entityKey);
    if (!entity) return;

    try {
      setProcessing(entityKey);
      setStatus(null);

      const docs = await getDocuments(entity.collection);
      if (!docs || docs.length === 0) {
        alert(`${entity.label} এর কোনো ডেটা পাওয়া যায়নি`);
        return;
      }

      downloadJson(`${entity.key}-export.json`, docs);
      setStatus(`${entity.label} ডেটা ডাউনলোড শুরু হয়েছে`);
    } catch (error: any) {
      alert(error.message || "ডাউনলোড ব্যর্থ হয়েছে");
    } finally {
      setProcessing(null);
    }
  };

  const handleDownloadAll = async () => {
    try {
      setProcessing("all");
      setStatus(null);

      const zip = new JSZip();
      const summary: Record<string, number> = {};

      await Promise.all(
        entityConfig.map(async (entity) => {
          const docs = await getDocuments(entity.collection);
          summary[entity.key] = docs.length;
          const content =
            docs.length > 0
              ? JSON.stringify(docs, null, 2)
              : "// কোনো ডেটা পাওয়া যায়নি";
          zip.file(`${entity.key}.json`, content);
        })
      );

      zip.file("SUMMARY.txt", JSON.stringify(summary, null, 2));

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `bulk-export-${Date.now()}.zip`;
      anchor.click();
      URL.revokeObjectURL(url);

      setStatus("সমস্ত ডেটা সহ ZIP ডাউনলোড শুরু হয়েছে");
    } catch (error: any) {
      alert(error.message || "ডাউনলোড ব্যর্থ হয়েছে");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Bulk Upload & Download
        </h1>
        <p className="text-gray-600">
          বড় পরিসরে ডেটা আপলোড ও ডাউনলোড করার জন্য বিশেষ প্যানেল
        </p>
      </div>

      <section className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <CloudUpload className="text-blue-600" size={26} />
          <h2 className="text-xl font-semibold text-gray-800">
            Bulk Upload
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {entityConfig.map((entity) => (
            <div
              key={entity.key}
              className="border border-dashed border-gray-300 rounded-lg p-4 flex flex-col gap-3"
            >
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {entity.label}
                </p>
                <p className="text-xs text-gray-500">
                  CSV বা JSON ফরম্যাটে bulk ফাইল আপলোড করুন
                </p>
              </div>
              <button
                onClick={() => triggerUpload(entity.key)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-60"
                disabled={processing === entity.key}
              >
                <Upload size={16} />
                {processing === entity.key ? "আপলোড হচ্ছে..." : "Bulk Upload"}
              </button>
              <input
                type="file"
                accept=".csv,.json"
                className="hidden"
                ref={(el) => {
                  if (el) fileInputs.current[entity.key] = el;
                }}
                onChange={(event) => handleFileChange(entity.key, event)}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <CloudDownload className="text-emerald-600" size={26} />
          <h2 className="text-xl font-semibold text-gray-800">
            Bulk Download
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {entityConfig.map((entity) => (
            <div
              key={entity.key}
              className="border border-gray-200 rounded-lg p-4 flex flex-col gap-3"
            >
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {entity.label}
                </p>
                <p className="text-xs text-gray-500">
                  বর্তমান ডেটা এক্সপোর্ট করুন (CSV / JSON)
                </p>
              </div>
              <button
                onClick={() => handleDownload(entity.key)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 disabled:opacity-60"
                disabled={processing === entity.key}
              >
                <Download size={16} />
                {processing === entity.key ? "ডাউনলোড হচ্ছে..." : "Download"}
              </button>
            </div>
          ))}
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t pt-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Download Everything
            </h3>
            <p className="text-sm text-gray-500">
              সমস্ত ডেটা একত্রে ZIP আকারে ডাউনলোড করুন
            </p>
          </div>
          <button
            onClick={handleDownloadAll}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-black disabled:opacity-70"
            disabled={processing === "all"}
          >
            <Download size={18} />
            {processing === "all" ? "প্রস্তুত হচ্ছে..." : "Download All (ZIP)"}
          </button>
        </div>
      </section>

      {status && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-sm text-emerald-700 flex items-center gap-2">
          <Info size={16} />
          {status}
        </div>
      )}
    </div>
  );
}

