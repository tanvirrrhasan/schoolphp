"use client";

import EditClassPageClient from "../EditClassPageClient";
import { useSearchParams } from "next/navigation";

export default function EditClassPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || undefined;
  return <EditClassPageClient id={id} />;
}

