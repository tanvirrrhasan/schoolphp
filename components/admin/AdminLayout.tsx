"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { logout } from "@/lib/firebase/auth";
import {
  LayoutDashboard,
  Bell,
  Users,
  BookOpen,
  Calendar,
  GraduationCap,
  UserCircle,
  UsersRound,
  FileText,
  Globe,
  Settings,
  Image as ImageIcon,
  Menu,
  X,
  LogOut,
  Trophy,
  UserCog,
} from "lucide-react";

const menuItems = [
  { name: "ড্যাশবোর্ড", href: "/admin", icon: LayoutDashboard },
  { name: "গ্যালারি", href: "/admin/media", icon: ImageIcon },
  { name: "নোটিশ", href: "/admin/notices", icon: Bell },
  { name: "ছাত্র-ছাত্রী", href: "/admin/students", icon: Users },
  { name: "অনলাইন ভর্তি", href: "/admin/admissions", icon: BookOpen },
  { name: "ক্লাস ও পাঠ্যপুস্তক", href: "/admin/classes", icon: BookOpen },
  { name: "ক্লাস রুটিন", href: "/admin/routines", icon: Calendar },
  { name: "ফলাফল", href: "/admin/results", icon: Trophy },
  { name: "শিক্ষক", href: "/admin/teachers", icon: UserCircle },
  { name: "সহায়ক কর্মীবৃন্দ", href: "/admin/support-staff", icon: UserCog },
  { name: "ব্যবস্থাপনা কমিটি", href: "/admin/committee", icon: UsersRound },
  { name: "প্রাক্তন ছাত্র-ছাত্রী", href: "/admin/alumni", icon: GraduationCap },
  { name: "পোস্ট ও সংবাদ", href: "/admin/posts", icon: FileText },
  { name: "ওয়েব পেজ", href: "/admin/pages", icon: Globe },
  { name: "সেটিংস", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { userData } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/admin/login";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-50 bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-semibold text-gray-800">অ্যাডমিন প্যানেল</h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            aria-label={sidebarOpen ? "Close menu" : "Open menu"}
          >
            {sidebarOpen ? <X size={24} className="text-white" /> : <Menu size={24} className="text-white" />}
          </button>
        </div>
      </div>

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } fixed inset-y-0 left-0 z-[60] w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out lg:translate-x-0 lg:fixed`}
        >
          <div className="h-full flex flex-col overflow-hidden">
            <div className="p-4 lg:p-6 border-b flex-shrink-0">
              <h2 className="text-lg lg:text-xl font-bold text-gray-800">স্কুল ম্যানেজমেন্ট</h2>
              <p className="text-xs lg:text-sm text-gray-500 mt-1">
                {userData?.role === "super_admin" ? "সুপার অ্যাডমিন" : "অ্যাডমিন"}
              </p>
            </div>

            <nav className="flex-1 overflow-y-auto p-2 lg:p-4 min-h-0">
              <ul className="space-y-1 lg:space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  // Check if pathname matches exactly or starts with the href (for nested routes)
                  const isActive = pathname === item.href || 
                    (item.href !== "/admin" && pathname.startsWith(item.href + "/"));
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg transition-colors text-sm lg:text-base ${
                          isActive
                            ? "bg-blue-600 text-white font-semibold"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <Icon size={18} className="lg:w-5 lg:h-5 flex-shrink-0" />
                        <span className="truncate">{item.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="p-2 lg:p-4 border-t flex-shrink-0">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-sm lg:text-base"
              >
                <LogOut size={18} className="lg:w-5 lg:h-5 flex-shrink-0" />
                <span>লগআউট</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 w-0 lg:ml-64 min-w-0 pt-16 lg:pt-0">
          <div className="p-3 lg:p-8 max-w-full overflow-x-hidden">{children}</div>
        </main>
      </div>
    </div>
  );
}

