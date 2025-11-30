"use client";

import type { ReactNode } from "react";
import PublicTopBar from "./PublicTopBar";
import PublicFooter from "./PublicFooter";

type PublicPageShellProps = {
  children: ReactNode;
  backHref?: string;
  backLabel?: string;
  backgroundClassName?: string;
};

export default function PublicPageShell({
  children,
  backHref,
  backLabel,
  backgroundClassName = "bg-gray-50",
}: PublicPageShellProps) {
  return (
    <>
      <PublicTopBar backHref={backHref} backLabel={backLabel} />
      <div className={`min-h-screen pt-15 ${backgroundClassName}`}>
        {children}
        <PublicFooter />
      </div>
    </>
  );
}


