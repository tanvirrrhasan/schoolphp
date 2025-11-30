"use client";

import EditTeacherPageClient from "../EditTeacherPageClient";
import { useSearchParams } from "next/navigation";

export default function EditTeacherPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || undefined;
  return <EditTeacherPageClient id={id} />;
}

