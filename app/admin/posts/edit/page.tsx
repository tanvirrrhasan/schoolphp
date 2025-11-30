"use client";

import EditPostPageClient from "../EditPostPageClient";
import { useSearchParams } from "next/navigation";

export default function EditPostPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || undefined;
  return <EditPostPageClient id={id} />;
}

