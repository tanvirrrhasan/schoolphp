"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  getDocument,
  setDocument,
} from "@/lib/firebase/firestore";
import { uploadFile, uploadMultipleFiles } from "@/lib/firebase/storage";
import { changePassword } from "@/lib/firebase/auth";
import { GeneralSettings, HeadSettings, HomepageSettings } from "@/types";
import { Lock, Save, Edit2, X } from "lucide-react";

// Default demo data
const DEFAULT_GENERAL: GeneralSettings = {
  id: "general",
  schoolName: "xxxxxx High School",
  schoolNameBn: "xxxxxx High School",
  schoolCode: "SCH001",
  websiteInfo: "Welcome to our school. We provide quality education to all students.",
  websiteInfoBn: "আমাদের স্কুলে স্বাগতম। আমরা সকল শিক্ষার্থীকে মানসম্মত শিক্ষা প্রদান করি।",
  logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzAwN2NmZiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjI0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxPR088L3RleHQ+PC9zdmc+",
};

const DEFAULT_HEAD: HeadSettings = {
  id: "head",
  name: "জনাব মোঃ আবুল কালাম",
  nameBn: "জনাব মোঃ আবুল কালাম",
  designation: "প্রধান শিক্ষক",
  designationBn: "প্রধান শিক্ষক",
  photo: "",
  quote: "শিক্ষা হলো জীবনের সবচেয়ে গুরুত্বপূর্ণ সম্পদ",
  quoteBn: "শিক্ষা হলো জীবনের সবচেয়ে গুরুত্বপূর্ণ সম্পদ",
  teacherProfileLink: "",
};

const DEFAULT_HOMEPAGE: HomepageSettings = {
  id: "homepage",
  sliderImages: [],
  featuredSections: [],
  gallery: [],
};

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings | null>(null);
  const [headSettings, setHeadSettings] = useState<HeadSettings | null>(null);
  const [homepageSettings, setHomepageSettings] = useState<HomepageSettings | null>(null);
  const [activeTab, setActiveTab] = useState<
    "general" | "homepage" | "password" | "head"
  >("general");
  const [editingTab, setEditingTab] = useState<string | null>(null);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [sliderImages, setSliderImages] = useState<File[]>([]);
  const [sliderImagePreviews, setSliderImagePreviews] = useState<string[]>([]);
  const [headPhoto, setHeadPhoto] = useState<File | null>(null);
  const [headPhotoPreview, setHeadPhotoPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Load General Settings
        let generalData = await getDocument("settings", "general");
        if (!generalData) {
          generalData = DEFAULT_GENERAL;
          await setDocument("settings", "general", generalData);
        }
        const generalDataAny = generalData as any;
        setGeneralSettings(generalDataAny as GeneralSettings);
        setLogoPreview(generalDataAny.logo || DEFAULT_GENERAL.logo || null);
        setValue("schoolName", generalDataAny.schoolName || DEFAULT_GENERAL.schoolName);
        setValue("schoolCode", generalDataAny.schoolCode || DEFAULT_GENERAL.schoolCode);
        setValue("websiteInfo", generalDataAny.websiteInfo || generalDataAny.websiteInfoBn || DEFAULT_GENERAL.websiteInfo || "");

        // Load Head Settings
        let headData = await getDocument("settings", "head");
        if (!headData) {
          headData = DEFAULT_HEAD;
          await setDocument("settings", "head", headData);
        }
        const headDataAny = headData as any;
        setHeadSettings(headDataAny as HeadSettings);
        setHeadPhotoPreview(headDataAny.photo || null);
        setValue("headName", headDataAny.name || headDataAny.nameBn || DEFAULT_HEAD.name);
        setValue("headDesignation", headDataAny.designation || headDataAny.designationBn || DEFAULT_HEAD.designation);
        setValue("headQuote", headDataAny.quote || headDataAny.quoteBn || DEFAULT_HEAD.quote || "");
        setValue("headTeacherLink", headDataAny.teacherProfileLink || "");

        // Load Homepage Settings
        let homepageData = await getDocument("settings", "homepage");
        if (!homepageData) {
          homepageData = DEFAULT_HOMEPAGE;
          await setDocument("settings", "homepage", homepageData);
        }
        const homepageDataAny = homepageData as any;
        setHomepageSettings(homepageDataAny as HomepageSettings);
        setSliderImagePreviews(homepageDataAny.sliderImages || []);
      } catch (error: any) {
        console.error("Settings load error:", error);
        // Use defaults on error
        setGeneralSettings(DEFAULT_GENERAL);
        setHeadSettings(DEFAULT_HEAD);
        setHomepageSettings(DEFAULT_HOMEPAGE);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [setValue]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHeadPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setHeadPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setHeadPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onGeneralSubmit = async (data: any) => {
    setSaving(true);
    try {
      let logoUrl = generalSettings?.logo || DEFAULT_GENERAL.logo || "";

      if (logo) {
        const existingData = {
          schoolName: data.schoolName,
          schoolNameBn: data.schoolName,
          schoolCode: data.schoolCode,
          logo: generalSettings?.logo || "",
          websiteInfo: data.websiteInfo || "",
          websiteInfoBn: data.websiteInfo || "",
        };
        logoUrl = await uploadFile(logo, `settings/logo_${Date.now()}`, existingData);
      }

      const settingsData: GeneralSettings = {
        id: "general",
        schoolName: data.schoolName,
        schoolNameBn: data.schoolName,
        schoolCode: data.schoolCode,
        websiteInfo: data.websiteInfo || "",
        websiteInfoBn: data.websiteInfo || "",
        logo: logoUrl,
      };

      await setDocument("settings", "general", settingsData);

      setGeneralSettings(settingsData);
      setLogoPreview(logoUrl || null);
      setLogo(null);
      setEditingTab(null);
      alert("সেটিংস সফলভাবে সংরক্ষণ করা হয়েছে");
    } catch (error: any) {
      alert(error.message || "সংরক্ষণ ব্যর্থ হয়েছে");
    } finally {
      setSaving(false);
    }
  };

  const onHeadSubmit = async (data: any) => {
    setSaving(true);
    try {
      let headPhotoUrl = headSettings?.photo || "";

      if (headPhoto) {
        const existingData = {
          name: data.headName,
          nameBn: data.headName,
          designation: data.headDesignation,
          designationBn: data.headDesignation,
          photo: headSettings?.photo || "",
          quote: data.headQuote || "",
          quoteBn: data.headQuote || "",
          teacherProfileLink: data.headTeacherLink || "",
        };
        headPhotoUrl = await uploadFile(headPhoto, `settings/head_${Date.now()}`, existingData);
      }

      const settingsData: HeadSettings = {
        id: "head",
        name: data.headName,
        nameBn: data.headName,
        designation: data.headDesignation,
        designationBn: data.headDesignation,
        photo: headPhotoUrl,
        quote: data.headQuote || "",
        quoteBn: data.headQuote || "",
        teacherProfileLink: data.headTeacherLink || "",
      };

      await setDocument("settings", "head", settingsData);

      setHeadSettings(settingsData);
      setHeadPhotoPreview(headPhotoUrl || null);
      setHeadPhoto(null);
      setEditingTab(null);
      alert("ইনস্টিটিউট প্রধান তথ্য সফলভাবে সংরক্ষণ করা হয়েছে");
    } catch (error: any) {
      alert(error.message || "সংরক্ষণ ব্যর্থ হয়েছে");
    } finally {
      setSaving(false);
    }
  };

  const onHomepageSubmit = async () => {
    if (sliderImages.length !== 3) {
      alert("দয়া করে ঠিক ৩টি ছবি নির্বাচন করুন");
      return;
    }

    setSaving(true);
    try {
      const existingData = {
        sliderImages: homepageSettings?.sliderImages || [],
        featuredSections: homepageSettings?.featuredSections || [],
        gallery: homepageSettings?.gallery || [],
      };
      
      const urls = await uploadMultipleFiles(sliderImages, "homepage/slider", existingData);

      const settingsData: HomepageSettings = {
        id: "homepage",
        sliderImages: urls,
        featuredSections: homepageSettings?.featuredSections || [],
        gallery: homepageSettings?.gallery || [],
      };

      await setDocument("settings", "homepage", settingsData);

      setHomepageSettings(settingsData);
      setSliderImagePreviews(urls);
      setSliderImages([]);
      setEditingTab(null);
      alert("স্লাইডার ছবি সফলভাবে সংরক্ষণ করা হয়েছে");
    } catch (error: any) {
      alert(error.message || "সংরক্ষণ ব্যর্থ হয়েছে");
    } finally {
      setSaving(false);
    }
  };

  const onPasswordSubmit = async (data: any) => {
    if (data.newPassword !== data.confirmPassword) {
      alert("পাসওয়ার্ড মিলছে না");
      return;
    }

    setSaving(true);
    try {
      await changePassword(data.newPassword);
      alert("পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে। আপনি লগআউট হয়ে যাবেন।");
      window.location.href = "/admin/login";
    } catch (error: any) {
      alert(error.message || "পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">সেটিংস</h1>
        <p className="text-gray-600">স্কুলের সাধারণ সেটিংস পরিচালনা করুন</p>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab("general")}
              className={`px-6 py-4 font-medium ${
                activeTab === "general"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              সাধারণ তথ্য
            </button>
            <button
              onClick={() => setActiveTab("head")}
              className={`px-6 py-4 font-medium ${
                activeTab === "head"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              ইনস্টিটিউট প্রধান
            </button>
            <button
              onClick={() => setActiveTab("homepage")}
              className={`px-6 py-4 font-medium ${
                activeTab === "homepage"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              হোমপেজ
            </button>
            <button
              onClick={() => setActiveTab("password")}
              className={`px-6 py-4 font-medium ${
                activeTab === "password"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <Lock size={18} className="inline mr-2" />
              পাসওয়ার্ড
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === "general" && (
            <div className="space-y-6">
              {editingTab !== "general" ? (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-800">সাধারণ তথ্য</h3>
                    <button
                      onClick={() => setEditingTab("general")}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Edit2 size={18} />
                      সম্পাদনা করুন
                    </button>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">স্কুলের নাম</label>
                      <p className="text-lg text-gray-800 mt-1">
                        {generalSettings?.schoolName || generalSettings?.schoolNameBn || DEFAULT_GENERAL.schoolName}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">স্কুল কোড</label>
                      <p className="text-lg text-gray-800 mt-1">
                        {generalSettings?.schoolCode || DEFAULT_GENERAL.schoolCode}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">লোগো</label>
                      {logoPreview ? (
                        <div className="mt-2">
                          <img
                            src={logoPreview}
                            alt="Logo"
                            className="h-20 object-contain"
                          />
                        </div>
                      ) : (
                        <p className="text-gray-500 mt-1">লোগো আপলোড করা হয়নি</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">ওয়েবসাইট তথ্য</label>
                      <p className="text-gray-800 mt-1">
                        {generalSettings?.websiteInfo || generalSettings?.websiteInfoBn || DEFAULT_GENERAL.websiteInfo}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onGeneralSubmit)} className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-800">সাধারণ তথ্য সম্পাদনা</h3>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTab(null);
                        setLogo(null);
                        setLogoPreview(generalSettings?.logo || DEFAULT_GENERAL.logo || null);
                        setValue("schoolName", generalSettings?.schoolName || DEFAULT_GENERAL.schoolName);
                        setValue("schoolCode", generalSettings?.schoolCode || DEFAULT_GENERAL.schoolCode);
                        setValue("websiteInfo", generalSettings?.websiteInfo || generalSettings?.websiteInfoBn || DEFAULT_GENERAL.websiteInfo || "");
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      <X size={18} />
                      বাতিল
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        স্কুলের নাম *
                      </label>
                      <input
                        {...register("schoolName", { required: "স্কুলের নাম প্রয়োজন" })}
                        type="text"
                        placeholder="বাংলা বা ইংরেজি স্কুলের নাম"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        স্কুল কোড *
                      </label>
                      <input
                        {...register("schoolCode", { required: "স্কুল কোড প্রয়োজন" })}
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        লোগো
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                      {logoPreview && (
                        <div className="mt-2">
                          <img
                            src={logoPreview}
                            alt="Logo"
                            className="h-20 object-contain"
                          />
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ওয়েবসাইট তথ্য
                      </label>
                      <textarea
                        {...register("websiteInfo")}
                        rows={4}
                        placeholder="বাংলা বা ইংরেজি ওয়েবসাইট তথ্য"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Save size={18} />
                    {saving ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
                  </button>
                </form>
              )}
            </div>
          )}

          {activeTab === "head" && (
            <div className="space-y-6">
              {editingTab !== "head" ? (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-800">ইনস্টিটিউট প্রধান</h3>
                    <button
                      onClick={() => setEditingTab("head")}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Edit2 size={18} />
                      সম্পাদনা করুন
                    </button>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">নাম</label>
                      <p className="text-lg text-gray-800 mt-1">
                        {headSettings?.name || headSettings?.nameBn || DEFAULT_HEAD.name}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">পদবী</label>
                      <p className="text-lg text-gray-800 mt-1">
                        {headSettings?.designation || headSettings?.designationBn || DEFAULT_HEAD.designation}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">ছবি</label>
                      {headPhotoPreview ? (
                        <div className="mt-2">
                          <img
                            src={headPhotoPreview}
                            alt="Head"
                            className="w-32 h-32 rounded-full object-cover"
                          />
                        </div>
                      ) : (
                        <p className="text-gray-500 mt-1">ছবি আপলোড করা হয়নি</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">উক্তি</label>
                      <p className="text-gray-800 mt-1">
                        {headSettings?.quote || headSettings?.quoteBn || DEFAULT_HEAD.quote || "নির্ধারিত হয়নি"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">শিক্ষক প্রোফাইল লিঙ্ক</label>
                      <p className="text-gray-800 mt-1">
                        {headSettings?.teacherProfileLink || "নির্ধারিত হয়নি"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onHeadSubmit)} className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-800">ইনস্টিটিউট প্রধান সম্পাদনা</h3>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTab(null);
                        setHeadPhoto(null);
                        setHeadPhotoPreview(headSettings?.photo || null);
                        setValue("headName", headSettings?.name || headSettings?.nameBn || DEFAULT_HEAD.name);
                        setValue("headDesignation", headSettings?.designation || headSettings?.designationBn || DEFAULT_HEAD.designation);
                        setValue("headQuote", headSettings?.quote || headSettings?.quoteBn || DEFAULT_HEAD.quote || "");
                        setValue("headTeacherLink", headSettings?.teacherProfileLink || "");
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      <X size={18} />
                      বাতিল
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        নাম *
                      </label>
                      <input
                        {...register("headName", { required: "নাম প্রয়োজন" })}
                        type="text"
                        placeholder="বাংলা বা ইংরেজি নাম"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        পদবী *
                      </label>
                      <input
                        {...register("headDesignation", { required: "পদবী প্রয়োজন" })}
                        type="text"
                        placeholder="বাংলা বা ইংরেজি পদবী"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ছবি
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleHeadPhotoChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                      {headPhotoPreview && (
                        <div className="mt-2">
                          <img
                            src={headPhotoPreview}
                            alt="Head"
                            className="w-32 h-32 rounded-full object-cover"
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        শিক্ষক প্রোফাইল লিঙ্ক
                      </label>
                      <input
                        {...register("headTeacherLink")}
                        type="text"
                        placeholder="/admin/teachers/{id}"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        উক্তি
                      </label>
                      <textarea
                        {...register("headQuote")}
                        rows={3}
                        placeholder="বাংলা বা ইংরেজি উক্তি"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Save size={18} />
                    {saving ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
                  </button>
                </form>
              )}
            </div>
          )}

          {activeTab === "homepage" && (
            <div className="space-y-6">
              {editingTab !== "homepage" ? (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-800">হোমপেজ স্লাইডার</h3>
                    <button
                      onClick={() => setEditingTab("homepage")}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Edit2 size={18} />
                      সম্পাদনা করুন
                    </button>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-6">
                    {sliderImagePreviews.length > 0 ? (
                      <div className="grid grid-cols-3 gap-4">
                        {sliderImagePreviews.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={image}
                              alt={`Slider ${index + 1}`}
                              className="w-full h-32 object-cover rounded"
                              onError={(e) => {
                                console.error("Slider preview error:", image);
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">স্লাইডার ছবি আপলোড করা হয়নি</p>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-800">হোমপেজ স্লাইডার সম্পাদনা</h3>
                    <button
                      onClick={() => {
                        setEditingTab(null);
                        setSliderImages([]);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      <X size={18} />
                      বাতিল
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        হোমপেজ স্লাইডার (৩টি ছবি)
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        হোমপেজ স্লাইডারের জন্য ৩টি একই সাইজের ছবি আপলোড করুন
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          if (e.target.files) {
                            const files = Array.from(e.target.files).slice(0, 3);
                            setSliderImages(files);
                          }
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                      {sliderImages.length > 0 && (
                        <div className="mt-4 grid grid-cols-3 gap-4">
                          {sliderImages.map((file, index) => (
                            <div key={index} className="relative">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Slider ${index + 1}`}
                                className="w-full h-32 object-cover rounded"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={onHomepageSubmit}
                      disabled={saving || sliderImages.length !== 3}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {saving ? "সংরক্ষণ হচ্ছে..." : "স্লাইডার ছবি সংরক্ষণ করুন"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "password" && (
            <div className="space-y-6">
              {editingTab !== "password" ? (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-800">পাসওয়ার্ড</h3>
                    <button
                      onClick={() => setEditingTab("password")}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Edit2 size={18} />
                      পরিবর্তন করুন
                    </button>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-6">
                    <p className="text-gray-600">পাসওয়ার্ড পরিবর্তন করতে সম্পাদনা বাটনে ক্লিক করুন</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-6 max-w-md">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-800">পাসওয়ার্ড পরিবর্তন</h3>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTab(null);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      <X size={18} />
                      বাতিল
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      নতুন পাসওয়ার্ড *
                    </label>
                    <input
                      {...register("newPassword", {
                        required: "নতুন পাসওয়ার্ড প্রয়োজন",
                        minLength: {
                          value: 6,
                          message: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে",
                        },
                      })}
                      type="password"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.newPassword && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.newPassword.message as string}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      পাসওয়ার্ড নিশ্চিত করুন *
                    </label>
                    <input
                      {...register("confirmPassword", { required: "পাসওয়ার্ড নিশ্চিত করুন" })}
                      type="password"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.confirmPassword.message as string}
                      </p>
                    )}
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      ⚠️ পাসওয়ার্ড পরিবর্তন করলে আপনি সব ডিভাইস থেকে লগআউট হয়ে যাবেন
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Lock size={18} />
                    {saving ? "পরিবর্তন করা হচ্ছে..." : "পাসওয়ার্ড পরিবর্তন করুন"}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
