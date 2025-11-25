"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  subscribeToCollection,
  convertTimestamp,
} from "@/lib/firebase/firestore";
import { Post } from "@/types";
import { format } from "date-fns";
import { FileText } from "lucide-react";
import PublicPageShell from "@/components/public/PublicPageShell";

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToCollection(
      "posts",
      (docs) => {
        const postsData = docs
          .filter((doc: any) => doc.published)
          .map((doc: any) => ({
            ...doc,
            createdAt: convertTimestamp(doc.createdAt),
            updatedAt: convertTimestamp(doc.updatedAt),
          }))
          .sort((a: Post, b: Post) => 
            b.createdAt.getTime() - a.createdAt.getTime()
          ) as Post[];
        setPosts(postsData);
      },
      [{ field: "published", operator: "==", value: true }],
      undefined,
      "desc"
    );

    return () => unsubscribe();
  }, []);

  return (
    <PublicPageShell backHref="/" backLabel="হোম">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">পোস্ট ও সংবাদ</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-lg shadow-md">
              <FileText className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500">কোনো পোস্ট নেই</p>
            </div>
          ) : (
            posts.map((post) => (
              <Link
                key={post.id}
                href={`/posts/${post.id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {post.image && (
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <span className="text-xs text-blue-600 font-medium">{post.category}</span>
                  <h3 className="text-lg font-bold text-gray-800 mt-2 mb-2">{post.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-3">{post.description}</p>
                  <p className="text-xs text-gray-500 mt-4">
                    {format(post.createdAt, "dd MMM yyyy")}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </PublicPageShell>
  );
}

