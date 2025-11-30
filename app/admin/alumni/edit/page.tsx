"use client";

import EditAlumniPageClient from "../EditAlumniPageClient";
import { useSearchParams } from "next/navigation";

export default function EditAlumniPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || undefined;
  return <EditAlumniPageClient id={id} />;
}

