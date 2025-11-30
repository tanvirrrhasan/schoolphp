"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowLeft } from "lucide-react";

type NavLink = {
  href: string;
  label: string;
};

const navLinks: NavLink[] = [
  { href: "/", label: "হোম" },
  { href: "/notices", label: "নোটিশ" },
  { href: "/students", label: "ছাত্র-ছাত্রী" },
  { href: "/teachers", label: "শিক্ষকবৃন্দ" },
  { href: "/support-staff", label: "সহায়ক কর্মীবৃন্দ" },
  { href: "/results", label: "ফলাফল" },
  { href: "/posts", label: "পোস্ট ও সংবাদ" },
  { href: "/admission", label: "ভর্তি" },
];

const MAP_URL = "https://maps.app.goo.gl/BGgZH6dC2gEdq4pf7";

export type PublicTopBarProps = {
  backHref?: string;
  backLabel?: string;
};

export default function PublicTopBar({
  backHref,
  backLabel,
}: PublicTopBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const schoolName = "আলালপুর হাজি শেখ আলম উচ্চ বিদ্যালয়";
  const schoolAddress = "ডাকঘর: রামবাড়ী, উপজেলা: মান্দা, জেলা: নওগাঁ";
  const schoolInfo = "স্থাপিত: ১৯৭২, বিদ্যালয় কোড: ২৭৪৬, EIIN: ১২৩২২৮";

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 border-b border-gray-100 shadow-sm backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center gap-2 min-w-0 shrink-0">
                {backHref ? (
                  <Link
                    href={backHref}
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 rounded-full border border-blue-100 px-3 h-11 text-sm font-medium transition-colors"
                  >
                    <ArrowLeft size={18} />
                    <span className="hidden sm:inline">{backLabel || "ফিরে যান"}</span>
                  </Link>
                ) : (
                  <img
                    src="/logo.png"
                    alt="আলালপুর হাজি শেখ আলম উচ্চ বিদ্যালয় লোগো"
                    className="h-11 w-11 rounded-full object-cover border border-gray-100"
                  />
                )}
                <div className="leading-tight min-w-0">
                  <p className="font-semibold text-gray-900 text-sm leading-snug sm:text-base">
                    {schoolName}
                  </p>
                  <p className="text-[10px] text-gray-600">{schoolInfo}</p>
                  <p className="text-[10px] text-gray-500">{schoolAddress}</p>
                </div>
              </div>
            </div>

            <nav className="hidden lg:flex items-center gap-4 text-sm font-medium">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors ${
                    isActive(link.href)
                      ? "text-blue-600"
                      : "text-gray-600 hover:text-blue-600"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <a
                href={MAP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-blue-500 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
              >
                গুগল ম্যাপে দেখুন
              </a>
            </nav>

            <button
              type="button"
              className="lg:hidden inline-flex items-center justify-center p-1.5 text-gray-700 hover:text-blue-600 transition-colors"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label={menuOpen ? "মেনু বন্ধ করুন" : "মেনু খুলুন"}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      <div
        className={`fixed top-0 right-0 z-40 h-full w-72 bg-white shadow-xl border-l border-gray-100 transform transition-transform duration-300 ease-in-out ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="pt-20 px-4 pb-8 h-full overflow-y-auto">
          <div className="space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "border-blue-600 text-blue-600 bg-blue-50"
                    : "border-gray-200 text-gray-700 hover:border-blue-200 hover:text-blue-600"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <a
            href={MAP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 block w-full rounded-lg bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            গুগল ম্যাপে দেখুন
          </a>
        </div>
      </div>

      {menuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}


