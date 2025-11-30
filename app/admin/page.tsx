"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Bell,
  FileText,
  BookOpen,
  Calendar,
  UserCircle,
  GraduationCap,
  UserCog,
  type LucideIcon,
} from "lucide-react";
import { subscribeToCollection } from "@/lib/firebase/firestore";

type StatKey =
  | "notices"
  | "students"
  | "teachers"
  | "supportStaff"
  | "admissions"
  | "posts"
  | "routines"
  | "alumni";

type DashboardStats = Record<
  StatKey,
  {
    total: number;
    published: number;
  }
>;

const initialStats: DashboardStats = {
  notices: { total: 0, published: 0 },
  students: { total: 0, published: 0 },
  teachers: { total: 0, published: 0 },
  supportStaff: { total: 0, published: 0 },
  admissions: { total: 0, published: 0 },
  posts: { total: 0, published: 0 },
  routines: { total: 0, published: 0 },
  alumni: { total: 0, published: 0 },
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>(initialStats);

  const updateStats = (
    key: StatKey,
    docs: any[],
    hasPublishedField = false
  ) => {
    const publishedCount = hasPublishedField
      ? docs.filter((doc: any) => doc.published).length
      : docs.length;

    setStats((prev) => ({
      ...prev,
      [key]: {
        total: docs.length,
        published: publishedCount,
      },
    }));
  };

  useEffect(() => {
    // Subscribe to real-time updates
    const unsubscribers = [
      subscribeToCollection("notices", (docs) =>
        updateStats("notices", docs, true)
      ),
      subscribeToCollection("students", (docs) =>
        updateStats("students", docs, false)
      ),
      subscribeToCollection("teachers", (docs) =>
        updateStats("teachers", docs, true)
      ),
      subscribeToCollection("supportStaff", (docs) =>
        updateStats("supportStaff", docs, true)
      ),
      subscribeToCollection("admissions", (docs) =>
        updateStats("admissions", docs, false)
      ),
      subscribeToCollection("posts", (docs) =>
        updateStats("posts", docs, true)
      ),
      subscribeToCollection("routines", (docs) =>
        updateStats("routines", docs, true)
      ),
      subscribeToCollection("alumni", (docs) =>
        updateStats("alumni", docs, true)
      ),
    ];

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, []);

  const statCards: {
    key: StatKey;
    title: string;
    icon: LucideIcon;
    color: string;
    href: string;
  }[] = [
    {
      key: "notices",
      title: "নোটিশ",
      icon: Bell,
      color: "bg-yellow-500",
      href: "/admin/notices",
    },
    {
      key: "students",
      title: "মোট ছাত্র-ছাত্রী",
      icon: Users,
      color: "bg-blue-500",
      href: "/admin/students",
    },
    {
      key: "teachers",
      title: "মোট শিক্ষক",
      icon: UserCircle,
      color: "bg-green-500",
      href: "/admin/teachers",
    },
    {
      key: "supportStaff",
      title: "সহায়ক কর্মীবৃন্দ",
      icon: UserCog,
      color: "bg-emerald-500",
      href: "/admin/support-staff",
    },
    {
      key: "admissions",
      title: "অনলাইন ভর্তি",
      icon: BookOpen,
      color: "bg-indigo-500",
      href: "/admin/admissions",
    },
    {
      key: "posts",
      title: "পোস্ট ও সংবাদ",
      icon: FileText,
      color: "bg-purple-500",
      href: "/admin/posts",
    },
    {
      key: "routines",
      title: "ক্লাস রুটিন",
      icon: Calendar,
      color: "bg-pink-500",
      href: "/admin/routines",
    },
    {
      key: "alumni",
      title: "প্রাক্তন ছাত্র-ছাত্রী",
      icon: GraduationCap,
      color: "bg-orange-500",
      href: "/admin/alumni",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">ড্যাশবোর্ড</h1>
        <p className="text-gray-600">স্কুল ম্যানেজমেন্ট সিস্টেমের ওভারভিউ</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const counts = stats[stat.key];
          return (
            <Link
              key={stat.key}
              href={stat.href}
              className="bg-white rounded-lg shadow-md p-4 sm:p-5 lg:p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-800">
                    {counts.total}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    প্রকাশিত:{" "}
                    <span className="font-semibold text-gray-700">
                      {counts.published}
                    </span>
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">দ্রুত অ্যাক্সেস</h2>
          <div className="space-y-2">
            <Link
              href="/admin/notices/new"
              className="block px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
            >
              + নতুন নোটিশ প্রকাশ করুন
            </Link>
            <Link
              href="/admin/students/new"
              className="block px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
            >
              + নতুন ছাত্র-ছাত্রী যোগ করুন
            </Link>
            <Link
              href="/admin/posts/new"
              className="block px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
            >
              + নতুন পোস্ট তৈরি করুন
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">সিস্টেম তথ্য</h2>
            <p className="text-sm text-gray-600">
              আপনার স্কুল ম্যানেজমেন্ট সিস্টেমের পরিচিতি
            </p>
          </div>
          <a
            href="https://tanvirhasan.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
          >
            Design &amp; Developed by Tanvir Hasan
          </a>
        </div>
      </div>
    </div>
  );
}

