"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { login } from "@/lib/firebase/auth";
import { Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { user, userData, refreshUserData } = useAuth();

  useEffect(() => {
    if (user && userData) {
      router.push("/admin");
    }
  }, [user, userData, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      // Refresh user data in context
      await refreshUserData();
      // Wait a bit for state to update
      await new Promise((resolve) => setTimeout(resolve, 300));
      router.push("/admin");
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "লগইন ব্যর্থ হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              স্কুল ম্যানেজমেন্ট
            </h1>
            <p className="text-gray-600">অ্যাডমিন লগইন</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
              {error.includes("অ্যাক্সেস নেই") && (
                <div className="mt-2">
                  <Link
                    href="/admin/setup"
                    className="text-blue-600 hover:text-blue-700 underline text-xs"
                  >
                    প্রথম অ্যাডমিন তৈরি করুন
                  </Link>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ইমেইল
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                পাসওয়ার্ড
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "লগইন হচ্ছে..." : "লগইন করুন"}
            </button>
          </form>

          <div className="mt-6 space-y-2 text-center">
            <Link href="/admin/setup" className="block text-sm text-blue-600 hover:text-blue-700">
              প্রথম অ্যাডমিন তৈরি করুন
            </Link>
            <Link href="/" className="block text-sm text-gray-600 hover:text-gray-700">
              ← ওয়েবসাইটে ফিরে যান
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

