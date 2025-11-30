"use client";

import EditStudentPageClient from "../EditStudentPageClient";
import { useSearchParams } from "next/navigation";

export default function EditStudentPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || undefined;
  return <EditStudentPageClient id={id} />;
}

