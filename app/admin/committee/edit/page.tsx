"use client";

import EditCommitteePageClient from "../EditCommitteePageClient";
import { useSearchParams } from "next/navigation";

export default function EditCommitteePage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || undefined;
  return <EditCommitteePageClient id={id} />;
}

