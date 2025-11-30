"use client";

import EditNoticePageClient from "../EditNoticePageClient";
import { useSearchParams } from "next/navigation";

export default function EditNoticePage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || undefined;
  return <EditNoticePageClient id={id} />;
}

