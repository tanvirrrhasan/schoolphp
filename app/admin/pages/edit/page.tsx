"use client";

import EditPagePageClient from "../EditPagePageClient";
import { useSearchParams } from "next/navigation";

export default function EditPagePage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || undefined;
  return <EditPagePageClient id={id} />;
}

