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
} from "lucide-react";
import {
  getDocuments,
  subscribeToCollection,
  convertTimestamp,
} from "@/lib/firebase/firestore";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    notices: 0,
    posts: 0,
    admissions: 0,
    routines: 0,
    alumni: 0,
  });

  useEffect(() => {
    // Subscribe to real-time updates
    const unsubscribers = [
      subscribeToCollection("students", (docs) => {
        setStats((prev) => ({ ...prev, students: docs.length }));
      }),
      subscribeToCollection("teachers", (docs) => {
        setStats((prev) => ({ ...prev, teachers: docs.length }));
      }),
      subscribeToCollection("notices", (docs) => {
        setStats((prev) => ({ ...prev, notices: docs.length }));
      }),
      subscribeToCollection("posts", (docs) => {
        setStats((prev) => ({ ...prev, posts: docs.length }));
      }),
      subscribeToCollection("admissions", (docs) => {
        setStats((prev) => ({ ...prev, admissions: docs.length }));
      }),
      subscribeToCollection("routines", (docs) => {
        setStats((prev) => ({ ...prev, routines: docs.length }));
      }),
      subscribeToCollection("alumni", (docs) => {
        setStats((prev) => ({ ...prev, alumni: docs.length }));
      }),
    ];

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, []);

  const statCards = [
    {
      title: "মোট ছাত্র-ছাত্রী",
      value: stats.students,
      icon: Users,
      color: "bg-blue-500",
      href: "/admin/students",
    },
    {
      title: "মোট শিক্ষক",
      value: stats.teachers,
      icon: UserCircle,
      color: "bg-green-500",
      href: "/admin/teachers",
    },
    {
      title: "নোটিশ",
      value: stats.notices,
      icon: Bell,
      color: "bg-yellow-500",
      href: "/admin/notices",
    },
    {
      title: "পোস্ট ও সংবাদ",
      value: stats.posts,
      icon: FileText,
      color: "bg-purple-500",
      href: "/admin/posts",
    },
    {
      title: "অনলাইন ভর্তি",
      value: stats.admissions,
      icon: BookOpen,
      color: "bg-indigo-500",
      href: "/admin/admissions",
    },
    {
      title: "ক্লাস রুটিন",
      value: stats.routines,
      icon: Calendar,
      color: "bg-pink-500",
      href: "/admin/routines",
    },
    {
      title: "প্রাক্তন ছাত্র-ছাত্রী",
      value: stats.alumni,
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link
              key={index}
              href={stat.href}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-800">
                    {stat.value}
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

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">সিস্টেম তথ্য</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>স্কুল ম্যানেজমেন্ট সিস্টেম v1.0</p>
            <p>Firebase Backend</p>
            <p>Next.js Frontend</p>
          </div>
        </div>
      </div>
    </div>
  );
}

