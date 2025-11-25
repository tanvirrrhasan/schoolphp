"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  getDocuments,
  getDocument,
  convertTimestamp,
} from "@/lib/firebase/firestore";
import { WebPage } from "@/types";
import PublicPageShell from "@/components/public/PublicPageShell";

export default function PublicPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [page, setPage] = useState<WebPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPage = async () => {
      if (!slug) return;
      setLoading(true);
      setError(null);

      try {
        const docs = await getDocuments("pages", [
          { field: "url", operator: "==", value: slug },
          { field: "published", operator: "==", value: true },
        ]);

        if (docs.length > 0) {
          const doc = docs[0];
          setPage({
            ...doc,
            createdAt: convertTimestamp(doc.createdAt),
            updatedAt: convertTimestamp(doc.updatedAt),
          } as WebPage);
          setLoading(false);
          return;
        }

        const fallback = await getDocument("pages", slug);
        if (fallback && fallback.published) {
          setPage({
            ...fallback,
            createdAt: convertTimestamp(fallback.createdAt),
            updatedAt: convertTimestamp(fallback.updatedAt),
          } as WebPage);
        } else {
          setError("পেজ পাওয়া যায়নি");
        }
      } catch (err: any) {
        setError(err.message || "পেজ লোড করা যায়নি");
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, [slug]);

  if (loading) {
    return (
      <PublicPageShell backHref="/" backLabel="হোম">
        <div className="min-h-[50vh] bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </PublicPageShell>
    );
  }

  if (error || !page) {
    return (
      <PublicPageShell backHref="/" backLabel="হোম">
        <div className="min-h-[50vh] bg-gray-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {error || "পেজ পাওয়া যায়নি"}
            </h1>
            <p className="text-gray-600">প্রয়োজন হলে প্রশাসকের সাথে যোগাযোগ করুন।</p>
          </div>
        </div>
      </PublicPageShell>
    );
  }

  return (
    <PublicPageShell backHref="/" backLabel="হোম">
      <div className="container mx-auto px-4 py-12">
        <article className="bg-white rounded-lg shadow-md p-6 md:p-10 space-y-6">
          <header className="space-y-2">
            <p className="text-sm text-gray-500">
              {page.createdAt
                ? (page.createdAt instanceof Date
                    ? page.createdAt
                    : convertTimestamp(page.createdAt)
                  ).toLocaleDateString("bn-BD")
                : ""}
            </p>
            <h1 className="text-3xl font-bold text-gray-900">
              {page.titleBn || page.title}
            </h1>
          </header>

          {page.image && (
            <div className="w-full rounded-lg overflow-hidden">
              <img
                src={page.image}
                alt={page.title}
                className="w-full h-80 object-cover"
              />
            </div>
          )}

          <div className="prose max-w-none text-gray-700 whitespace-pre-line leading-relaxed">
            {page.descriptionBn || page.description}
          </div>
        </article>
      </div>
    </PublicPageShell>
  );
}

