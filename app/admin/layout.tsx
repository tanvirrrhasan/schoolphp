"use client";

import { usePathname } from "next/navigation";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Don't wrap login and setup pages with layout
  if (
    pathname === "/admin/login" ||
    pathname === "/admin/login/" ||
    pathname === "/admin/setup" ||
    pathname === "/admin/setup/"
  ) {
    return <>{children}</>;
  }

  return (
    <ProtectedRoute>
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  );
}

