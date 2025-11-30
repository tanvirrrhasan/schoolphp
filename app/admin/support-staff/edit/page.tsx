"use client";

import EditSupportStaffPageClient from "../EditSupportStaffPageClient";
import { useSearchParams } from "next/navigation";

export default function EditSupportStaffPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || undefined;
  return <EditSupportStaffPageClient id={id} />;
}

