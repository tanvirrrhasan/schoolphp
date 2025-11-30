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

export default function PublicPageClient() {
  const params = useParams();
  const slug = params?.slug as string;
  const [page, setPage] = useState<WebPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPage = async () => {
      if (!slug || slug === "index" || slug === "undefined") {
        setLoading(false);
        setError("পেজ পাওয়া যায়নি");
        return;
      }
      
      setLoading(true);
      setError(null);

      try {
        // First try to get by URL field
        try {
          const docs = await getDocuments("pages", [
            { field: "url", operator: "==", value: slug },
            { field: "published", operator: "==", value: true },
          ]);

          if (docs && docs.length > 0) {
            const doc = docs[0] as any;
            setPage({
              ...doc,
              createdAt: convertTimestamp(doc.createdAt),
              updatedAt: convertTimestamp(doc.updatedAt),
            } as WebPage);
            setLoading(false);
            return;
          }
        } catch (queryError) {
          console.log("Query by URL failed, trying fallback:", queryError);
        }

        // Fallback: try to get by ID
        try {
          const fallback = await getDocument("pages", slug);
          if (fallback) {
            const fallbackAny = fallback as any;
            if (fallbackAny.published) {
              setPage({
                ...fallbackAny,
                createdAt: convertTimestamp(fallbackAny.createdAt),
                updatedAt: convertTimestamp(fallbackAny.updatedAt),
              } as WebPage);
              setLoading(false);
              return;
            }
          }
        } catch (fallbackError) {
          console.log("Fallback query failed:", fallbackError);
        }

        setError("পেজ পাওয়া যায়নি");
      } catch (err: any) {
        console.error("Page load error:", err);
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


