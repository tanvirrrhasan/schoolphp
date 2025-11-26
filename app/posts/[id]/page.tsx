"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getDocument, convertTimestamp } from "@/lib/firebase/firestore";
import { Post } from "@/types";
import { format } from "date-fns";
import PublicPageShell from "@/components/public/PublicPageShell";

export default function PostDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPost = async () => {
      try {
        const data = await getDocument("posts", id);
        if (data && (data as any).published) {
          const dataAny = data as any;
          const postData = {
            ...dataAny,
            createdAt: convertTimestamp(dataAny.createdAt),
            updatedAt: convertTimestamp(dataAny.updatedAt),
          } as Post;
          setPost(postData);
        }
      } catch (error) {
        console.error("Post load error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadPost();
    }
  }, [id]);

  if (loading) {
    return (
      <PublicPageShell backHref="/posts" backLabel="পোস্ট তালিকা">
        <div className="min-h-[50vh] bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </PublicPageShell>
    );
  }

  if (!post) {
    return (
      <PublicPageShell backHref="/posts" backLabel="পোস্ট তালিকা">
        <div className="min-h-[50vh] bg-gray-50 flex items-center justify-center px-4">
          <div className="text-center bg-white rounded-lg shadow-md p-8">
            <p className="text-gray-500 mb-4">পোস্ট পাওয়া যায়নি</p>
            <Link href="/posts" className="text-blue-600 hover:text-blue-700 font-medium">
              সব পোস্ট দেখুন
            </Link>
          </div>
        </div>
      </PublicPageShell>
    );
  }

  return (
    <PublicPageShell backHref="/posts" backLabel="পোস্ট তালিকা">
      <div className="container mx-auto px-4 py-12">
        <article className="bg-white rounded-lg shadow-md overflow-hidden">
          {post.image && (
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-96 object-cover"
            />
          )}
          <div className="p-8">
            <span className="text-sm text-blue-600 font-medium">{post.category}</span>
            <h1 className="text-3xl font-bold text-gray-800 mt-4 mb-2">{post.title}</h1>
            <p className="text-lg text-gray-600 mb-4">{post.titleBn}</p>
            <p className="text-sm text-gray-500 mb-8">
              {format(post.createdAt, "dd MMM yyyy, hh:mm a")}
            </p>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-line mb-6">{post.description}</p>
              <p className="text-gray-700 whitespace-pre-line">{post.descriptionBn}</p>
            </div>
          </div>
        </article>
      </div>
    </PublicPageShell>
  );
}

