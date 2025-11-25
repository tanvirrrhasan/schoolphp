"use client";

import { useState, useEffect } from "react";
import {
  subscribeToCollection,
  convertTimestamp,
} from "@/lib/firebase/firestore";
import { Notice } from "@/types";
import { format } from "date-fns";
import { FileText } from "lucide-react";
import PublicPageShell from "@/components/public/PublicPageShell";

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [activeNotice, setActiveNotice] = useState<Notice | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToCollection(
      "notices",
      (docs) => {
        const noticesData = docs
          .filter((doc: any) => doc.published)
          .map((doc: any) => ({
            ...doc,
            createdAt: convertTimestamp(doc.createdAt),
            updatedAt: convertTimestamp(doc.updatedAt),
          }))
          .sort((a: Notice, b: Notice) => 
            b.createdAt.getTime() - a.createdAt.getTime()
          ) as Notice[];
        setNotices(noticesData);
      },
      [{ field: "published", operator: "==", value: true }],
      undefined,
      "desc"
    );

    return () => unsubscribe();
  }, []);

  const handleNoticeKey = (
    event: React.KeyboardEvent<HTMLDivElement>,
    notice: Notice
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setActiveNotice(notice);
    }
  };

  const closeModal = () => setActiveNotice(null);

  return (
    <>
      <PublicPageShell backHref="/" backLabel="হোম">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">নোটিশ</h1>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {notices.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-lg shadow-md">
              <FileText className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500">কোনো নোটিশ নেই</p>
            </div>
          ) : (
            notices.map((notice) => (
              <div
                key={notice.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                role="button"
                tabIndex={0}
                onClick={() => setActiveNotice(notice)}
                onKeyDown={(event) => handleNoticeKey(event, notice)}
                aria-label={`${notice.title} বিস্তারিত দেখুন`}
              >
                <h3 className="text-lg font-bold text-gray-800 mb-2">{notice.title}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-4">
                  {notice.description}
                </p>
                {notice.attachments && notice.attachments.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">সংযুক্তি:</p>
                    <div className="space-y-1">
                      {notice.attachments.map((url, index) => (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-xs block"
                          onClick={(event) => event.stopPropagation()}
                        >
                          {url.split("/").pop()}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  {format(notice.createdAt, "dd MMM yyyy, hh:mm a")}
                </p>
              </div>
            ))
          )}
          </div>
        </div>
      </PublicPageShell>

      {activeNotice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/60"
            onClick={closeModal}
          />
          <div className="relative bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              aria-label="Close notice details"
            >
              ✕
            </button>
            <p className="text-xs text-gray-500 mb-2">
              {format(activeNotice.createdAt, "dd MMM yyyy, hh:mm a")}
            </p>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              {activeNotice.title}
            </h3>
            <p className="text-gray-700 whitespace-pre-line">
              {activeNotice.description}
            </p>
            {activeNotice.attachments && activeNotice.attachments.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-semibold text-gray-700 mb-2">সংযুক্তি:</p>
                <div className="space-y-2">
                  {activeNotice.attachments.map((url, index) => (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-blue-600 hover:underline break-all text-sm"
                    >
                      {url.split("/").pop()}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
    )}
    </>
  );
}

