"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  subscribeToCollection,
  convertTimestamp,
} from "@/lib/firebase/firestore";
import { WebPage } from "@/types";
import PublicPageShell from "@/components/public/PublicPageShell";

export default function WebPagesList() {
  const [pages, setPages] = useState<WebPage[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToCollection(
      "pages",
      (docs) => {
        const pageData = docs
          .filter((doc: any) => doc.published)
          .map((doc: any) => ({
            ...doc,
            createdAt: convertTimestamp(doc.createdAt),
            updatedAt: convertTimestamp(doc.updatedAt),
          }))
          .sort((a: WebPage, b: WebPage) =>
            b.createdAt.getTime() - a.createdAt.getTime()
          ) as WebPage[];
        setPages(pageData);
      },
      [{ field: "published", operator: "==", value: true }],
      "createdAt",
      "desc"
    );

    return () => unsubscribe();
  }, []);

  return (
    <PublicPageShell backHref="/" backLabel="হোম">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">প্রকাশিত ওয়েব পেজ</h1>
          <p className="text-gray-600">
            প্রতিষ্ঠানের বিভিন্ন বিভাগ, নীতিমালা ও গুরুত্বপূর্ণ তথ্যের তালিকা
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
          {pages.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
              কোনো ওয়েব পেজ প্রকাশিত নেই
            </div>
          ) : (
            pages.map((page) => {
              const resolvedUrl =
                page.url?.startsWith("/") ? page.url : `/${page.url || page.id}`;
              return (
                <Link
                  key={page.id}
                  href={resolvedUrl}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow block"
                >
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    {page.titleBn || page.title}
                  </h2>
                  <p className="text-sm text-gray-600 line-clamp-4">
                    {page.descriptionBn || page.description}
                  </p>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </PublicPageShell>
  );
}


