"use client";

import { useState, useEffect, useRef } from "react";
import type {
  PointerEvent as ReactPointerEvent,
  TouchEvent as ReactTouchEvent,
  KeyboardEvent as ReactKeyboardEvent,
} from "react";
import Link from "next/link";
import {
  subscribeToCollection,
  getDocument,
  convertTimestamp,
} from "@/lib/firebase/firestore";
import {
  Notice,
  Post,
  GeneralSettings,
  HeadSettings,
  HomepageSettings,
  Teacher,
  Routine,
  CommitteeMember,
  Alumni,
  WebPage,
  SupportStaff,
  Result,
} from "@/types";
import { format } from "date-fns";
import {
  Bell,
  BookOpen,
  Users,
  GraduationCap,
  ArrowRight,
  Calendar,
} from "lucide-react";
import PublicPageShell from "@/components/public/PublicPageShell";

type MediaDocument = {
  files?: string[];
};

export default function HomePage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings | null>(null);
  const [headSettings, setHeadSettings] = useState<HeadSettings | null>(null);
  const [sliderImages, setSliderImages] = useState<string[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mediaFiles, setMediaFiles] = useState<string[]>([]);
  const [activeNotice, setActiveNotice] = useState<Notice | null>(null);
  const [isHeadModalOpen, setIsHeadModalOpen] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [supportStaff, setSupportStaff] = useState<SupportStaff[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [committeeMembers, setCommitteeMembers] = useState<CommitteeMember[]>([]);
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [pages, setPages] = useState<WebPage[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const pointerIdRef = useRef<number | null>(null);

  useEffect(() => {
    // Load settings from 3 separate documents
    const loadSettings = async () => {
      try {
        const [generalData, headData, homepageData] = await Promise.all([
          getDocument("settings", "general"),
          getDocument("settings", "head"),
          getDocument("settings", "homepage"),
        ]);
        
        if (generalData) {
          setGeneralSettings(generalData as GeneralSettings);
        }
        if (headData) {
          setHeadSettings(headData as HeadSettings);
        }
        if (homepageData) {
          const homepage = homepageData as HomepageSettings;
          setSliderImages(homepage.sliderImages || []);
        }
      } catch (error) {
        console.error("Settings load error:", error);
      }
    };

    loadSettings();

    // Subscribe to settings changes
    const unsubscribeSettings = subscribeToCollection(
      "settings",
      (docs) => {
        const generalData = docs.find((doc: any) => doc.id === "general");
        const headData = docs.find((doc: any) => doc.id === "head");
        const homepageData = docs.find((doc: any) => doc.id === "homepage");
        
        if (generalData) {
          setGeneralSettings(generalData as GeneralSettings);
        }
        if (headData) {
          setHeadSettings(headData as HeadSettings);
        }
        if (homepageData) {
          const homepage = homepageData as HomepageSettings;
          setSliderImages(homepage.sliderImages || []);
        }
      }
    );

    // Load and subscribe to media library
    const loadMedia = async () => {
      try {
        const data = (await getDocument("media", "library")) as MediaDocument | null;
        if (data?.files) {
          setMediaFiles(data.files);
        }
      } catch (error) {
        console.error("Media load error:", error);
      }
    };

    loadMedia();

    const unsubscribeMedia = subscribeToCollection(
      "media",
      (docs) => {
        const mediaData = docs.find((doc: any) => doc.id === "library") as MediaDocument | undefined;
        if (mediaData?.files) {
          setMediaFiles(mediaData.files);
        }
      }
    );

    // Subscribe to published notices
    const unsubscribeNotices = subscribeToCollection(
      "notices",
      (docs) => {
        const noticesData = docs
          .filter((doc: any) => doc.published)
          .map((doc: any) => ({
            ...doc,
            createdAt: convertTimestamp(doc.createdAt),
            updatedAt: convertTimestamp(doc.updatedAt),
          }))
          .sort((a: Notice, b: Notice) => 
            b.createdAt.getTime() - a.createdAt.getTime()
          )
          .slice(0, 5) as Notice[];
        setNotices(noticesData);
      },
      [{ field: "published", operator: "==", value: true }],
      undefined,
      "desc"
    );

    // Subscribe to published posts
    const unsubscribePosts = subscribeToCollection(
      "posts",
      (docs) => {
        const postsData = docs
          .filter((doc: any) => doc.published)
          .map((doc: any) => ({
            ...doc,
            createdAt: convertTimestamp(doc.createdAt),
            updatedAt: convertTimestamp(doc.updatedAt),
          }))
          .sort((a: Post, b: Post) => 
            b.createdAt.getTime() - a.createdAt.getTime()
          )
          .slice(0, 6) as Post[];
        setPosts(postsData);
      },
      [{ field: "published", operator: "==", value: true }],
      undefined,
      "desc"
    );

    const unsubscribeTeachers = subscribeToCollection(
      "teachers",
      (docs) => {
        const teacherData = docs
          .map((doc: any) => ({
            ...doc,
            createdAt: convertTimestamp(doc.createdAt),
            updatedAt: convertTimestamp(doc.updatedAt),
          }))
          .sort(
            (a: Teacher, b: Teacher) =>
              b.createdAt.getTime() - a.createdAt.getTime()
          )
          .slice(0, 4) as Teacher[];
        setTeachers(teacherData);
      },
      [{ field: "published", operator: "==", value: true }]
    );

    const unsubscribeSupportStaff = subscribeToCollection(
      "supportStaff",
      (docs) => {
        const staffData = docs
          .map((doc: any) => ({
            ...doc,
            createdAt: convertTimestamp(doc.createdAt),
            updatedAt: convertTimestamp(doc.updatedAt),
          }))
          .sort(
            (a: SupportStaff, b: SupportStaff) =>
              b.createdAt.getTime() - a.createdAt.getTime()
          )
          .slice(0, 4) as SupportStaff[];
        setSupportStaff(staffData);
      },
      [{ field: "published", operator: "==", value: true }]
    );

    const unsubscribeRoutines = subscribeToCollection(
      "routines",
      (docs) => {
        const routineData = docs
          .map((doc: any) => ({
            ...doc,
            createdAt: convertTimestamp(doc.createdAt),
            updatedAt: convertTimestamp(doc.updatedAt),
          }))
          .sort(
            (a: Routine, b: Routine) =>
              b.createdAt.getTime() - a.createdAt.getTime()
          )
          .slice(0, 3) as Routine[];
        setRoutines(routineData);
      },
      [{ field: "published", operator: "==", value: true }]
    );

    const unsubscribeCommittee = subscribeToCollection(
      "committee",
      (docs) => {
        const committeeData = docs
          .map((doc: any) => ({
            ...doc,
            createdAt: convertTimestamp(doc.createdAt),
            updatedAt: convertTimestamp(doc.updatedAt),
          }))
          .sort(
            (a: CommitteeMember, b: CommitteeMember) =>
              b.createdAt.getTime() - a.createdAt.getTime()
          )
          .slice(0, 4) as CommitteeMember[];
        setCommitteeMembers(committeeData);
      },
      [{ field: "published", operator: "==", value: true }]
    );

    const unsubscribeAlumni = subscribeToCollection(
      "alumni",
      (docs) => {
        const alumniData = docs
          .map((doc: any) => ({
            ...doc,
            createdAt: convertTimestamp(doc.createdAt),
            updatedAt: convertTimestamp(doc.updatedAt),
          }))
          .sort(
            (a: Alumni, b: Alumni) =>
              b.createdAt.getTime() - a.createdAt.getTime()
          )
          .slice(0, 4) as Alumni[];
        setAlumni(alumniData);
      },
      [{ field: "published", operator: "==", value: true }]
    );

    const unsubscribePages = subscribeToCollection(
      "pages",
      (docs) => {
        const pageData = docs
          .map((doc: any) => ({
            ...doc,
            createdAt: convertTimestamp(doc.createdAt),
            updatedAt: convertTimestamp(doc.updatedAt),
          }))
          .sort(
            (a: WebPage, b: WebPage) =>
              b.createdAt.getTime() - a.createdAt.getTime()
          ) as WebPage[];
        setPages(pageData);
      },
      [{ field: "published", operator: "==", value: true }]
    );

    const unsubscribeResults = subscribeToCollection(
      "results",
      (docs) => {
        const resultData = docs
          .filter((doc: any) => doc.published)
          .map((doc: any) => ({
            ...doc,
            createdAt: convertTimestamp(doc.createdAt),
            updatedAt: convertTimestamp(doc.updatedAt),
            publishedAt: doc.publishedAt ? convertTimestamp(doc.publishedAt) : undefined,
          }))
          .sort((a: Result, b: Result) => {
            const aDate = a.publishedAt?.getTime() || a.createdAt.getTime();
            const bDate = b.publishedAt?.getTime() || b.createdAt.getTime();
            return bDate - aDate;
          })
          .slice(0, 4) as Result[];
        setResults(resultData);
      },
      [{ field: "published", operator: "==", value: true }]
    );

    return () => {
      unsubscribeSettings();
      unsubscribeMedia();
      unsubscribeNotices();
      unsubscribePosts();
      unsubscribeTeachers();
      unsubscribeRoutines();
      unsubscribeCommittee();
      unsubscribeAlumni();
      unsubscribePages();
      unsubscribeSupportStaff();
      unsubscribeResults();
    };
  }, []);

  // Auto-slide for slider
  useEffect(() => {
    if (sliderImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
      }, 5000); // Change slide every 5 seconds

      return () => clearInterval(interval);
    }
  }, [sliderImages.length]);

  const goToPreviousSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? sliderImages.length - 1 : prev - 1
    );
  };

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
  };

  const handleNoticeKey = (
    event: ReactKeyboardEvent<HTMLDivElement>,
    notice: Notice
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setActiveNotice(notice);
    }
  };

  const openNoticeModal = (notice: Notice) => {
    setActiveNotice(notice);
  };

  const closeNoticeModal = () => {
    setActiveNotice(null);
  };

  const handleTouchStart = (event: ReactTouchEvent<HTMLDivElement>) => {
    if (sliderImages.length <= 1) return;
    startDrag(event.touches[0]?.clientX || 0);
  };

  const handleTouchMove = (event: ReactTouchEvent<HTMLDivElement>) => {
    if (!isDragging.current || sliderImages.length <= 1) return;
    const touchX = event.touches[0]?.clientX || 0;
    const delta = touchX - dragStartX.current;
    if (Math.abs(delta) > 40) {
      if (delta < 0) {
        goToNextSlide();
      } else {
        goToPreviousSlide();
      }
      isDragging.current = false;
    }
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
  };

  const startDrag = (clientX: number) => {
    if (sliderImages.length <= 1) return;
    isDragging.current = true;
    dragStartX.current = clientX;
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (sliderImages.length <= 1 || event.pointerType === "touch") return;
    event.preventDefault();
    pointerIdRef.current = event.pointerId;
    sliderRef.current?.setPointerCapture(event.pointerId);
    startDrag(event.clientX);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (
      !isDragging.current ||
      pointerIdRef.current !== event.pointerId ||
      sliderImages.length <= 1 ||
      event.pointerType === "touch"
    ) {
      return;
    }
    event.preventDefault();
    const delta = event.clientX - dragStartX.current;
    if (Math.abs(delta) > 40) {
      if (delta < 0) {
        goToNextSlide();
      } else {
        goToPreviousSlide();
      }
      isDragging.current = false;
      pointerIdRef.current = null;
      sliderRef.current?.releasePointerCapture(event.pointerId);
    }
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") {
      return;
    }
    if (pointerIdRef.current === event.pointerId) {
      sliderRef.current?.releasePointerCapture(event.pointerId);
    }
    isDragging.current = false;
    pointerIdRef.current = null;
  };

  const headQuote =
    headSettings?.quoteBn ||
    headSettings?.quote ||
    "";

  const isHeadQuoteLong = (headQuote?.length || 0) > 180;

  const renderHeadCard = (variant: "desktop" | "mobile") => {
    if (!headSettings) return null;

    const layoutClasses =
      variant === "desktop"
        ? "flex items-center gap-4 text-left"
        : "flex flex-col items-center text-center gap-4";

    const imageClasses =
      variant === "desktop"
        ? "w-32 h-32 rounded-2xl object-cover"
        : "w-32 h-32 rounded-2xl object-cover";

    const shouldClamp = variant === "desktop" && isHeadQuoteLong;

    return (
      <div
        className="bg-white rounded-lg shadow-md p-6 h-full flex flex-col gap-4 cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => setIsHeadModalOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setIsHeadModalOpen(true);
          }
        }}
      >
        <div className={`${layoutClasses}`}>
          {headSettings.photo && (
            <img
              src={headSettings.photo}
              alt={headSettings.name}
              className={imageClasses}
            />
          )}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800">
              {headSettings.name || headSettings.nameBn}
            </h2>
            <p className="text-lg text-gray-600 mb-2">
              {headSettings.designation || headSettings.designationBn}
            </p>
            {headQuote && (
              <p className={`text-gray-700 ${shouldClamp ? "line-clamp-4" : ""}`}>
                “{headQuote}”
              </p>
            )}
          </div>
        </div>
        {variant === "desktop" && isHeadQuoteLong && (
          <div className="flex justify-end">
            <span className="text-xs text-blue-600 font-semibold">
              ... আরও পড়ুন
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <PublicPageShell>
      <div className="bg-gray-50">
        <section className="container mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row gap-6 items-stretch">
          <div className={`w-full ${headSettings ? "lg:w-2/3" : ""}`}>
            {/* Slider */}
            {sliderImages.length > 0 ? (
              <div className="relative bg-gray-200 rounded-lg overflow-hidden">
                <div
                  className="relative w-full"
                  style={{ paddingTop: "33.33%" }}
                  ref={sliderRef}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerLeave={handlePointerUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  <div className="absolute inset-0 overflow-hidden">
                    {sliderImages.map((image, index) => (
                      <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-700 ${
                          index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                        }`}
                      >
                        <img
                          src={image}
                          alt={`Slider ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error("Slider image load error:", image);
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  {sliderImages.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                      {sliderImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentSlide(index)}
                          className={`w-3 h-3 rounded-full transition-all ${
                            index === currentSlide ? "bg-white" : "bg-white/50"
                          }`}
                          aria-label={`Go to slide ${index + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div
                className="relative bg-gray-200 rounded-lg flex items-center justify-center"
                style={{ paddingTop: "33.33%" }}
              >
                <p className="absolute text-gray-500">স্লাইডার ছবি যোগ করুন</p>
              </div>
            )}
          </div>

          {headSettings && (
            <div className="hidden lg:block w-full lg:w-1/3">
              {renderHeadCard("desktop")}
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-3">
        {/* Notices */}
        <section className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-gray-800">নোটিশ</h2>
            <Link
              href="/notices"
              className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
            >
              সব দেখুন <ArrowRight size={18} />
            </Link>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {notices.map((notice, index) => {
              const isNoticeLong = (notice.description?.length || 0) > 140;
              // On mobile, only show the first (latest) notice; on desktop show all
              const isMobileHidden = index > 0;
              return (
                <div
                  key={notice.id}
                  className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${isMobileHidden ? 'hidden lg:block' : ''}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => openNoticeModal(notice)}
                  onKeyDown={(event) => handleNoticeKey(event, notice)}
                  aria-label={`${notice.title} বিস্তারিত দেখুন`}
                >
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{notice.title}</h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-3">
                    {notice.description}
                  </p>
                  {isNoticeLong && (
                    <div className="flex justify-end mb-2">
                      <span className="text-xs text-blue-600 font-semibold">
                        ... আরও পড়ুন
                      </span>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    {format(notice.createdAt, "dd MMM yyyy")}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Quick Links */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          <Link
            href="/notices"
            className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow"
          >
            <Bell className="mx-auto text-blue-600 mb-2" size={32} />
            <h3 className="font-semibold text-gray-800">নোটিশ</h3>
          </Link>
          <Link
            href="/students"
            className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow"
          >
            <Users className="mx-auto text-green-600 mb-2" size={32} />
            <h3 className="font-semibold text-gray-800">ছাত্র-ছাত্রী</h3>
          </Link>
          <Link
            href="/teachers"
            className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow"
          >
            <BookOpen className="mx-auto text-purple-600 mb-2" size={32} />
            <h3 className="font-semibold text-gray-800">শিক্ষক</h3>
          </Link>
          <Link
            href="/admission"
            className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow"
          >
            <GraduationCap className="mx-auto text-orange-600 mb-2" size={32} />
            <h3 className="font-semibold text-gray-800">ভর্তি</h3>
          </Link>
        </section>

        {/* Results */}
        {results.length > 0 && (
          <section className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold text-gray-800">ফলাফল</h2>
              <Link
                href="/results"
                className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
              >
                সব দেখুন <ArrowRight size={18} />
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="bg-white rounded-lg shadow-md p-6 flex flex-col gap-3"
                >
                  <div>
                    <p className="text-sm text-gray-500">
                      {result.publishedAt
                        ? format(result.publishedAt, "dd MMM yyyy")
                        : ""}
                    </p>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {result.titleBn || result.title}
                    </h3>
                  </div>
                  {result.examName && (
                    <p className="text-sm text-gray-600">
                      পরীক্ষা: {result.examNameBn || result.examName}
                    </p>
                  )}
                  {result.session && (
                    <p className="text-sm text-gray-600">শিক্ষাবর্ষ: {result.session}</p>
                  )}
                  {result.description && (
                    <p className="text-sm text-gray-700 line-clamp-3">
                      {result.descriptionBn || result.description}
                    </p>
                  )}
                  {result.fileUrl && (
                    <a
                      href={result.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto inline-flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      ফলাফল ডাউনলোড করুন
                      <ArrowRight size={16} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Posts */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-gray-800">সংবাদ ও পোস্ট</h2>
            <Link
              href="/posts"
              className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
            >
              সব দেখুন <ArrowRight size={18} />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/posts/${post.id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {post.image && (
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <span className="text-xs text-blue-600 font-medium">{post.category}</span>
                  <h3 className="text-lg font-bold text-gray-800 mt-2 mb-2">{post.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{post.description}</p>
                  <p className="text-xs text-gray-500 mt-4">
                    {format(post.createdAt, "dd MMM yyyy")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Media Gallery */}
        {mediaFiles.length > 0 && (
          <section className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold text-gray-800">গ্যালারি</h2>
              <Link
                href="/gallery"
                className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
              >
                সব দেখুন <ArrowRight size={18} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {mediaFiles
                .filter((url) => url.startsWith("data:image/"))
                .slice(0, 8)
                .map((url, index) => (
                  <div
                    key={index}
                    className="aspect-square bg-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <img
                      src={url}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* Mobile Head Message */}
        {headSettings && (
          <section className="mt-12 lg:hidden">
            {renderHeadCard("mobile")}
          </section>
        )}

        {/* Teachers */}
        {teachers.length > 0 && (
          <section className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold text-gray-800">শিক্ষকবৃন্দ</h2>
              <Link
                href="/teachers"
                className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
              >
                সব দেখুন <ArrowRight size={18} />
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {teachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div className="aspect-video bg-gray-200">
                    {teacher.photo ? (
                      <img
                        src={teacher.photo}
                        alt={teacher.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Users size={36} />
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-800">{teacher.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{teacher.nameBn}</p>
                    <p className="text-sm text-gray-700 font-medium">
                      {teacher.designation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Support Staff */}
        {supportStaff.length > 0 && (
          <section className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold text-gray-800">সহায়ক কর্মীবৃন্দ</h2>
              <Link
                href="/support-staff"
                className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
              >
                সব দেখুন <ArrowRight size={18} />
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {supportStaff.map((staff) => (
                <div
                  key={staff.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div className="aspect-video bg-gray-200">
                    {staff.photo ? (
                      <img
                        src={staff.photo}
                        alt={staff.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Users size={36} />
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-800">{staff.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{staff.nameBn}</p>
                    <p className="text-sm text-gray-700 font-medium">
                      {staff.roleBn || staff.role}
                    </p>
                    {staff.phone && (
                      <p className="text-xs text-gray-500 mt-2">{staff.phone}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Class Routine */}
        {routines.length > 0 && (
        <section className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-gray-800">ক্লাস রুটিন</h2>
            <Link
              href="/routines"
              className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
            >
              সব দেখুন <ArrowRight size={18} />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {routines.map((routine) => (
                <div
                  key={routine.id}
                  className="bg-white rounded-lg shadow-md p-6 flex flex-col gap-3"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="text-blue-600" size={20} />
                    <h3 className="text-lg font-semibold text-gray-800">
                      {routine.title || routine.titleBn}
                    </h3>
                  </div>
                  {routine.class && (
                    <p className="text-sm text-gray-600">শ্রেণি: {routine.class}</p>
                  )}
                  <div className="mt-auto flex gap-2">
                    {routine.pdf && (
                      <a
                        href={routine.pdf}
            target="_blank"
            rel="noopener noreferrer"
                        className="flex-1 text-center text-sm px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
                      >
                        PDF ডাউনলোড
                      </a>
                    )}
                    {routine.image && (
                      <button
                        type="button"
                        className="flex-1 text-center text-sm px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-default"
                      >
                        ইমেজ যুক্ত
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
        </section>
        )}

        {/* Management Committee */}
        {committeeMembers.length > 0 && (
        <section className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-gray-800">ব্যবস্থাপনা কমিটি</h2>
            <Link
              href="/committee"
              className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
            >
              সব দেখুন <ArrowRight size={18} />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {committeeMembers.map((member) => (
                <div
                  key={member.id}
                  className="bg-white rounded-lg shadow-md p-6 text-center"
                >
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-200 overflow-hidden">
                    {member.photo ? (
                      <img
                        src={member.photo}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Users size={32} />
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {member.name}
                  </h3>
                  <p className="text-sm text-gray-600">{member.designation}</p>
                </div>
              ))}
            </div>
        </section>
        )}

        {/* Alumni */}
        {alumni.length > 0 && (
        <section className="mt-5">
          <div className="flex items-center justify-between mb-2 ">
            <h2 className="text-2xl font-bold text-gray-800">প্রাক্তন ছাত্র-ছাত্রী</h2>
            <Link
              href="/alumni"
              className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
            >
              সব দেখুন <ArrowRight size={18} />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {alumni.map((person) => (
                <div
                  key={person.id}
                  className="bg-white rounded-lg shadow-md p-6 text-center"
                >
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-200 overflow-hidden">
                    {person.photo ? (
                      <img
                        src={person.photo}
                        alt={person.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Users size={32} />
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {person.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-1">
                    উত্তীর্ণ সাল: {person.graduationYear}
                  </p>
                  {person.currentPosition && (
                    <p className="text-sm text-gray-700">{person.currentPosition}</p>
                  )}
                </div>
              ))}
            </div>
        </section>
        )}

        {/* Web Pages */}
        {pages.length > 0 && (
        <section className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-gray-800">প্রতিষ্ঠানের ওয়েব পেজ</h2>
            <Link
              href="/pages"
              className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
            >
              সব দেখুন <ArrowRight size={18} />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:flex lg:flex-wrap gap-6">
              {pages.map((page) => {
                const resolvedUrl =
                  page.url?.startsWith("/") ? page.url : `/${page.url || page.id}`;
                return (
                  <Link
                    key={page.id}
                    href={resolvedUrl}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow block lg:flex-1 lg:min-w-[200px] lg:max-w-[300px]"
                  >
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {page.titleBn || page.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {page.descriptionBn || page.description}
                  </p>
                  </Link>
                );
              })}
            </div>
        </section>
        )}
      </main>

      {activeNotice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeNoticeModal}
          />
          <div className="relative bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6">
            <button
              onClick={closeNoticeModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              aria-label="Close notice details"
            >
              ✕
            </button>
            <p className="text-xs text-gray-500 mb-2">
              {format(activeNotice.createdAt, "dd MMM yyyy, hh:mm a")}
            </p>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              {activeNotice.title}
            </h3>
            <p className="text-gray-700 whitespace-pre-line">
              {activeNotice.description}
            </p>
            {activeNotice.attachments && activeNotice.attachments.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-semibold text-gray-700 mb-2">সংযুক্তি:</p>
                <div className="space-y-2">
                  {activeNotice.attachments.map((url, index) => (
                    <a
                      key={index}
                      href={url}
            target="_blank"
            rel="noopener noreferrer"
                      className="block text-blue-600 hover:underline break-all text-sm"
                    >
                      {url.split("/").pop()}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {isHeadModalOpen && headSettings && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsHeadModalOpen(false)}
          />
          <div className="relative bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6">
            <button
              onClick={() => setIsHeadModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              aria-label="Close head teacher message"
            >
              ✕
            </button>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-6">
              {headSettings.photo && (
                <img
                  src={headSettings.photo}
                  alt={headSettings.name}
                  className="w-32 h-32 rounded-2xl object-cover"
                />
              )}
              <div>
                <h3 className="text-2xl font-bold text-gray-800">
                  {headSettings.name || headSettings.nameBn}
                </h3>
                <p className="text-lg text-gray-600">
                  {headSettings.designation || headSettings.designationBn}
                </p>
              </div>
            </div>
            {headQuote && (
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                {headQuote}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">যোগাযোগ</h3>
            <p className="text-gray-300 text-sm">{generalSettings?.websiteInfo || generalSettings?.websiteInfoBn}</p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">লিঙ্ক</h3>
              <div className="space-y-2 text-sm">
                <Link href="/notices" className="block text-gray-300 hover:text-white">
                  নোটিশ
                </Link>
                <Link href="/students" className="block text-gray-300 hover:text-white">
                  ছাত্র-ছাত্রী
                </Link>
                <Link href="/teachers" className="block text-gray-300 hover:text-white">
                  শিক্ষক
                </Link>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">স্কুল কোড</h3>
              <p className="text-gray-300 text-sm">{generalSettings?.schoolCode}</p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>© {new Date().getFullYear()} {generalSettings?.schoolName || generalSettings?.schoolNameBn || "স্কুল"}. সর্বস্বত্ব সংরক্ষিত</p>
          </div>
        </div>
      </footer>
    </div>
    </PublicPageShell>
  );
}
