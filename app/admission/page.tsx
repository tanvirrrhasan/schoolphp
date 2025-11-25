"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { createDocument } from "@/lib/firebase/firestore";
import { CheckCircle } from "lucide-react";
import PublicPageShell from "@/components/public/PublicPageShell";

export default function AdmissionPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const admissionData = {
        studentName: data.studentName,
        studentNameBn: data.studentName, // Same value for both
        fatherName: data.fatherName,
        motherName: data.motherName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        address: data.address,
        phone: data.phone,
        email: data.email || "",
        previousSchool: data.previousSchool || "",
        previousClass: data.previousClass || "",
        appliedClass: data.appliedClass,
        status: "pending",
      };

      await createDocument("admissions", admissionData);
      setSubmitted(true);
      reset();
    } catch (error: any) {
      alert(error.message || "আবেদন জমা দেওয়া ব্যর্থ হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <PublicPageShell backHref="/" backLabel="হোম">
        <div className="min-h-[60vh] bg-gray-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
            <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              আবেদন সফলভাবে জমা দেওয়া হয়েছে
            </h2>
            <p className="text-gray-600 mb-6">
              আপনার আবেদন পর্যালোচনা করা হচ্ছে। শীঘ্রই আপনার সাথে যোগাযোগ করা হবে।
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              নতুন আবেদন করুন
            </button>
          </div>
        </div>
      </PublicPageShell>
    );
  }

  return (
    <PublicPageShell backHref="/" backLabel="হোম">
    <div className="bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
            অনলাইন ভর্তি আবেদন
          </h1>
          <p className="text-gray-600 text-center mb-8">
            নিচের ফর্মটি পূরণ করে আপনার ভর্তি আবেদন জমা দিন
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  শিক্ষার্থীর নাম *
                </label>
                <input
                  {...register("studentName", { required: "নাম প্রয়োজন" })}
                  type="text"
                  placeholder="বাংলা বা ইংরেজি নাম"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {errors.studentName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.studentName.message as string}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  পিতার নাম *
                </label>
                <input
                  {...register("fatherName", { required: "পিতার নাম প্রয়োজন" })}
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {errors.fatherName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.fatherName.message as string}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  মাতার নাম *
                </label>
                <input
                  {...register("motherName", { required: "মাতার নাম প্রয়োজন" })}
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {errors.motherName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.motherName.message as string}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  জন্ম তারিখ *
                </label>
                <input
                  {...register("dateOfBirth", { required: "জন্ম তারিখ প্রয়োজন" })}
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {errors.dateOfBirth && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.dateOfBirth.message as string}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  লিঙ্গ *
                </label>
                <select
                  {...register("gender", { required: "লিঙ্গ নির্বাচন করুন" })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">নির্বাচন করুন</option>
                  <option value="male">পুরুষ</option>
                  <option value="female">মহিলা</option>
                  <option value="other">অন্যান্য</option>
                </select>
                {errors.gender && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.gender.message as string}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ভর্তি করতে চান (ক্লাস) *
                </label>
                <input
                  {...register("appliedClass", { required: "ক্লাস প্রয়োজন" })}
                  type="text"
                  placeholder="যেমন: ৬ষ্ঠ শ্রেণী"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {errors.appliedClass && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.appliedClass.message as string}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ফোন নম্বর *
                </label>
                <input
                  {...register("phone", { required: "ফোন নম্বর প্রয়োজন" })}
                  type="tel"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.phone.message as string}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ইমেইল
                </label>
                <input
                  {...register("email")}
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  পূর্ববর্তী স্কুল
                </label>
                <input
                  {...register("previousSchool")}
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  পূর্ববর্তী ক্লাস
                </label>
                <input
                  {...register("previousClass")}
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ঠিকানা *
              </label>
              <textarea
                {...register("address", { required: "ঠিকানা প্রয়োজন" })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.address.message as string}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {loading ? "জমা দেওয়া হচ্ছে..." : "আবেদন জমা দিন"}
            </button>
          </form>
        </div>
      </div>
    </div>
    </PublicPageShell>
  );
}

