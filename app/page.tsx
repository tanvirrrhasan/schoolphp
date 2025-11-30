"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
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

type ActiveCard =
  | { type: "gallery"; image: string }
  | { type: "teacher"; data: Teacher }
  | { type: "support"; data: SupportStaff }
  | { type: "post"; data: Post }
  | { type: "result"; data: Result }
  | { type: "post"; data: Post }
  | { type: "result"; data: Result };

const chunkArray = <T,>(items: T[], size: number): T[][] => {
  if (size <= 0) return [];
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
};

const isImageUrl = (url: string) =>
  url?.startsWith("data:image/") ||
  /\.(jpe?g|png|gif|webp|bmp|svg)$/i.test(url || "");

type CarouselHandlers = {
  index: number;
  goToNext: () => void;
  goToPrevious: () => void;
  goToSlide: (target: number) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  handlePointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
  handlePointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
  handlePointerUp: (event: ReactPointerEvent<HTMLDivElement>) => void;
  handlePointerLeave: (event: ReactPointerEvent<HTMLDivElement>) => void;
  handleTouchStart: (event: ReactTouchEvent<HTMLDivElement>) => void;
  handleTouchMove: (event: ReactTouchEvent<HTMLDivElement>) => void;
  handleTouchEnd: () => void;
};

const useCarousel = (
  slideCount: number,
  autoPlay = true,
  intervalMs = 6000
): CarouselHandlers => {
  const [index, setIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const pointerIdRef = useRef<number | null>(null);
  const suppressClickRef = useRef(false);

  useEffect(() => {
    setIndex(0);
  }, [slideCount]);

  const goToSlide = useCallback(
    (target: number) => {
      if (slideCount <= 0) return;
      const normalized = ((target % slideCount) + slideCount) % slideCount;
      setIndex(normalized);
    },
    [slideCount]
  );

  const goToNext = useCallback(() => {
    if (slideCount <= 1) return;
    setIndex((prev) => (prev + 1) % slideCount);
  }, [slideCount]);

  const goToPrevious = useCallback(() => {
    if (slideCount <= 1) return;
    setIndex((prev) => (prev - 1 + slideCount) % slideCount);
  }, [slideCount]);

  useEffect(() => {
    if (!autoPlay || slideCount <= 1) return;
    const interval = window.setInterval(goToNext, intervalMs);
    return () => window.clearInterval(interval);
  }, [autoPlay, goToNext, intervalMs, slideCount]);

  const startDrag = (clientX: number) => {
    if (slideCount <= 1) return;
    isDragging.current = true;
    dragStartX.current = clientX;
    suppressClickRef.current = false;
  };

  const stopDrag = () => {
    isDragging.current = false;
    dragStartX.current = 0;
    pointerIdRef.current = null;
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch" || slideCount <= 1) return;
    event.preventDefault();
    pointerIdRef.current = event.pointerId;
    containerRef.current?.setPointerCapture(event.pointerId);
    startDrag(event.clientX);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (
      event.pointerType === "touch" ||
      !isDragging.current ||
      pointerIdRef.current !== event.pointerId
    ) {
      return;
    }
    event.preventDefault();
    const delta = event.clientX - dragStartX.current;
    if (Math.abs(delta) > 60) {
      suppressClickRef.current = true;
      if (delta < 0) {
        goToNext();
      } else {
        goToPrevious();
      }
      containerRef.current?.releasePointerCapture(event.pointerId);
      stopDrag();
    }
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") return;
    if (pointerIdRef.current === event.pointerId) {
      containerRef.current?.releasePointerCapture(event.pointerId);
    }
    stopDrag();
  };

  const handlePointerLeave = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") return;
    if (pointerIdRef.current === event.pointerId) {
      containerRef.current?.releasePointerCapture(event.pointerId);
    }
    stopDrag();
  };

  const handleTouchStart = (event: ReactTouchEvent<HTMLDivElement>) => {
    if (slideCount <= 1) return;
    const touch = event.touches[0];
    if (!touch) return;
    startDrag(touch.clientX);
  };

  const handleTouchMove = (event: ReactTouchEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    const touch = event.touches[0];
    if (!touch) return;
    const delta = touch.clientX - dragStartX.current;
    if (Math.abs(delta) > 50) {
      suppressClickRef.current = true;
      if (delta < 0) {
        goToNext();
      } else {
        goToPrevious();
      }
      stopDrag();
    }
  };

  const handleTouchEnd = () => {
    stopDrag();
  };

  // Prevent accidental clicks after drag
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const handleClickCapture = (event: MouseEvent) => {
      if (suppressClickRef.current) {
        event.stopPropagation();
        event.preventDefault();
        suppressClickRef.current = false;
      }
    };

    node.addEventListener("click", handleClickCapture, true);
    return () => {
      node.removeEventListener("click", handleClickCapture, true);
    };
  }, []);

  return {
    index,
    goToNext,
    goToPrevious,
    goToSlide,
    containerRef,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerLeave,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
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
  const [activeCard, setActiveCard] = useState<ActiveCard | null>(null);

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

    // Load and subscribe to gallery images from settings_homepage
    const loadGallery = async () => {
      try {
        const homepageData = await getDocument("settings", "homepage") as any;
        if (homepageData?.gallery) {
          setMediaFiles(homepageData.gallery);
        }
      } catch (error) {
        console.error("Gallery load error:", error);
      }
    };

    loadGallery();

    const unsubscribeGallery = subscribeToCollection(
      "settings",
      (docs) => {
        const homepageData = docs.find((doc: any) => doc.id === "homepage");
        if (homepageData?.gallery) {
          setMediaFiles(homepageData.gallery);
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
          ) as Teacher[];
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
          ) as SupportStaff[];
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
      unsubscribeGallery();
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
  const closeCardModal = () => setActiveCard(null);

  const galleryImages = useMemo(
    () => mediaFiles.filter((url) => isImageUrl(url)),
    [mediaFiles]
  );
  const gallerySlides = useMemo(
    () => chunkArray(galleryImages, 4),
    [galleryImages]
  );
  const teacherSlides = useMemo(
    () => chunkArray(teachers, 4),
    [teachers]
  );
  const staffSlides = useMemo(
    () => chunkArray(supportStaff, 4),
    [supportStaff]
  );

  const galleryCarousel = useCarousel(gallerySlides.length);
  const teacherCarousel = useCarousel(teacherSlides.length);
  const supportCarousel = useCarousel(staffSlides.length);

  const renderHeadCard = (variant: "desktop" | "mobile") => {
    if (!headSettings) return null;

    if (variant === "desktop") {
      // Desktop:card with image top-left, text flows properly
      return (
        <div
          className="bg-white rounded-lg shadow-md p-6 h-full flex flex-col cursor-pointer hover:shadow-lg transition-shadow"
          style={{ minHeight: "200px", maxHeight: "500px" }}
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
          <div className="flex items-start gap-4 mb-3 flex-shrink-0">
            {headSettings.photo && (
              <img
                src={headSettings.photo}
                alt={headSettings.name}
                className="w-28 h-28 rounded-xl object-cover flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-gray-800 mb-1">
                {headSettings.name || headSettings.nameBn}
              </h2>
              <p className="text-base text-gray-600 mb-2">
                {headSettings.designation || headSettings.designationBn}
              </p>
            </div>
          </div>
          {headQuote ? (
            <div className="flex-1 flex flex-col min-h-0">
              <p className={`text-sm text-gray-700 leading-relaxed flex-1 ${isHeadQuoteLong ? "line-clamp-5" : ""}`}>
                "{headQuote}"
              </p>
              {isHeadQuoteLong && (
                <div className="mt-2 flex justify-end flex-shrink-0">
                  <Link
                    href="/headmasters-message"
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs text-blue-600 font-semibold hover:text-blue-700"
                  >
                    ... আরও পড়ুন
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
              <p>প্রধান শিক্ষকের বার্তা যোগ করুন</p>
            </div>
          )}
        </div>
      );
    } else {
      // Mobile: Centered layout
      return (
        <div
          className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center gap-4 cursor-pointer hover:shadow-lg transition-shadow"
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
          {headSettings.photo && (
            <img
              src={headSettings.photo}
              alt={headSettings.name}
              className="w-32 h-32 rounded-2xl object-cover"
            />
          )}
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {headSettings.name || headSettings.nameBn}
            </h2>
            <p className="text-lg text-gray-600 mb-2">
              {headSettings.designation || headSettings.designationBn}
            </p>
            {headQuote && (
              <p className="text-gray-700">
                "{headQuote}"
              </p>
            )}
          </div>
        </div>
      );
    }
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
                    <div className="absolute bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                      {sliderImages.map((_, index) => {
                        const isActive = index === currentSlide;
                        return (
                          <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`transition-all ${
                              isActive
                                ? "w-7 h-2 md:w-8 md:h-2 rounded-full bg-white"
                                : "w-2 h-2 md:w-3 md:h-3 rounded-full bg-white/60"
                            }`}
                            aria-label={`Go to slide ${index + 1}`}
                          />
                        );
                      })}
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
            {notices.slice(0, 3).map((notice, index) => {
              const isNoticeLong = (notice.description?.length || 0) > 140;
              // On mobile, only show the first (latest) notice; on desktop show first 3
              const isMobileHidden = index > 0;
              return (
                <div
                  key={notice.id}
                  className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isMobileHidden ? "hidden lg:block" : ""
                  }`}
                  role="button"
                  tabIndex={0}
                  onClick={() => openNoticeModal(notice)}
                  onKeyDown={(event) => handleNoticeKey(event, notice)}
                  aria-label={`${notice.title} বিস্তারিত দেখুন`}
                >
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {notice.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                    {notice.description}
                  </p>
                  <div className="flex items-center justify-between gap-2 mt-auto">
                    <p className="text-xs text-gray-500">
                      {format(notice.createdAt, "dd MMM yyyy")}
                    </p>
                    {isNoticeLong && (
                      <span className="text-[11px] text-blue-600 font-semibold whitespace-nowrap">
                        ... আরও পড়ুন
                      </span>
                    )}
                  </div>
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
            {/* PC: Show 3 cards, Mobile: Show 1 card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {results.slice(0, 1).map((result) => (
                <button
                  key={result.id}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveCard({ type: "result", data: result });
                  }}
                  className="bg-white rounded-lg shadow-md p-6 flex flex-col gap-3 text-left hover:shadow-lg transition-shadow cursor-pointer w-full"
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
                    <span className="mt-auto inline-flex items-center justify-center gap-2 text-sm text-blue-600 font-semibold">
                      ফলাফল ডাউনলোড করুন
                      <ArrowRight size={16} />
                    </span>
                  )}
                </button>
              ))}
              {/* Show 2 more on PC only */}
              {results.slice(1, 3).map((result) => (
                <button
                  key={result.id}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveCard({ type: "result", data: result });
                  }}
                  className="hidden lg:block bg-white rounded-lg shadow-md p-6 flex flex-col gap-3 text-left hover:shadow-lg transition-shadow cursor-pointer w-full"
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
                    <span className="mt-auto inline-flex items-center justify-center gap-2 text-sm text-blue-600 font-semibold">
                      ফলাফল ডাউনলোড করুন
                      <ArrowRight size={16} />
                    </span>
                  )}
                </button>
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
          {/* PC: Show 3 cards, Mobile: Show 2 cards (2 lines) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {posts.slice(0, 2).map((post) => (
              <button
                key={post.id}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveCard({ type: "post", data: post });
                }}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer text-left"
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
              </button>
            ))}
            {/* Show 1 more on PC only */}
            {posts.slice(2, 3).map((post) => (
              <button
                key={post.id}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveCard({ type: "post", data: post });
                }}
                className="hidden lg:block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer text-left"
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
              </button>
            ))}
          </div>
        </section>

        {/* Media Gallery */}
        {galleryImages.length > 0 && (
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
            <div className="relative">
              <div
                className="overflow-hidden"
                ref={galleryCarousel.containerRef}
                onPointerDown={galleryCarousel.handlePointerDown}
                onPointerMove={galleryCarousel.handlePointerMove}
                onPointerUp={galleryCarousel.handlePointerUp}
                onPointerLeave={galleryCarousel.handlePointerLeave}
                onTouchStart={galleryCarousel.handleTouchStart}
                onTouchMove={galleryCarousel.handleTouchMove}
                onTouchEnd={galleryCarousel.handleTouchEnd}
              >
                <div
                  className="flex transition-transform duration-500 ease-out"
                  style={{
                    transform: `translateX(-${galleryCarousel.index * 100}%)`,
                  }}
                >
                  {gallerySlides.map((slide, slideIndex) => (
                    <div
                      key={slideIndex}
                      className="w-full shrink-0 px-1 sm:px-2"
                    >
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {slide.map((url, idx) => (
                          <button
                            type="button"
                            key={`${slideIndex}-${idx}`}
                            className="block rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setActiveCard({ type: "gallery", image: url });
                            }}
                          >
                            <div className="relative w-full pt-[100%] bg-gray-100">
                              <img
                                src={url}
                                alt={`Gallery ${slideIndex * 4 + idx + 1}`}
                                className="absolute inset-0 w-full h-full object-cover"
                                onError={(e) => {
                                  console.error("Gallery image load error:", url);
                                  (e.target as HTMLImageElement).style.display = "none";
                                }}
                              />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {gallerySlides.length > 1 && (
                <>
                  <button
                    type="button"
                    className="absolute left-0 top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full p-2 text-gray-700 hover:bg-gray-100"
                    onClick={galleryCarousel.goToPrevious}
                    aria-label="আগের ছবি"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className="absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full p-2 text-gray-700 hover:bg-gray-100"
                    onClick={galleryCarousel.goToNext}
                    aria-label="পরের ছবি"
                  >
                    ›
                  </button>
                  <div className="mt-4 flex justify-center gap-2">
                    {gallerySlides.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`h-2 rounded-full transition-all ${
                          galleryCarousel.index === idx ? "w-6 bg-blue-600" : "w-2 bg-gray-300"
                        }`}
                        onClick={() => galleryCarousel.goToSlide(idx)}
                        aria-label={`গ্যালারি স্লাইড ${idx + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
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
        {teacherSlides.length > 0 && (
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
            <div className="relative">
              <div
                className="overflow-hidden"
                ref={teacherCarousel.containerRef}
                onPointerDown={teacherCarousel.handlePointerDown}
                onPointerMove={teacherCarousel.handlePointerMove}
                onPointerUp={teacherCarousel.handlePointerUp}
                onPointerLeave={teacherCarousel.handlePointerLeave}
                onTouchStart={teacherCarousel.handleTouchStart}
                onTouchMove={teacherCarousel.handleTouchMove}
                onTouchEnd={teacherCarousel.handleTouchEnd}
              >
                <div
                  className="flex transition-transform duration-500 ease-out"
                  style={{
                    transform: `translateX(-${teacherCarousel.index * 100}%)`,
                  }}
                >
                  {teacherSlides.map((slide, slideIndex) => (
                    <div
                      key={slideIndex}
                      className="w-full shrink-0 px-1 sm:px-2"
                    >
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {slide.map((teacher) => (
                          <button
                            type="button"
                            key={teacher.id}
                            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow flex flex-col h-full min-h-[260px] overflow-hidden"
                            onClick={() => setActiveCard({ type: "teacher", data: teacher })}
                          >
                            <div className="relative w-full pt-[100%] bg-gray-100 overflow-hidden">
                              {teacher.photo ? (
                                <img
                                  src={teacher.photo}
                                  alt={teacher.name}
                                  className="absolute inset-0 w-full h-full object-cover"
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                  <Users size={36} />
                                </div>
                              )}
                            </div>
                            <div className="p-4 text-center flex-1 flex flex-col justify-center bg-white">
                              <h3 className="text-lg font-semibold text-gray-800">
                                {teacher.name || teacher.nameBn}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {teacher.designationBn || teacher.designation}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {teacherSlides.length > 1 && (
                <>
                  <button
                    type="button"
                    className="absolute left-0 top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full p-2 text-gray-700 hover:bg-gray-100"
                    onClick={teacherCarousel.goToPrevious}
                    aria-label="আগের শিক্ষক"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className="absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full p-2 text-gray-700 hover:bg-gray-100"
                    onClick={teacherCarousel.goToNext}
                    aria-label="পরের শিক্ষক"
                  >
                    ›
                  </button>
                  <div className="mt-4 flex justify-center gap-2">
                    {teacherSlides.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`h-2 rounded-full transition-all ${
                          teacherCarousel.index === idx ? "w-6 bg-blue-600" : "w-2 bg-gray-300"
                        }`}
                        onClick={() => teacherCarousel.goToSlide(idx)}
                        aria-label={`শিক্ষক স্লাইড ${idx + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        {/* Support Staff */}
        {staffSlides.length > 0 && (
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
            <div className="relative">
              <div
                className="overflow-hidden"
                ref={supportCarousel.containerRef}
                onPointerDown={supportCarousel.handlePointerDown}
                onPointerMove={supportCarousel.handlePointerMove}
                onPointerUp={supportCarousel.handlePointerUp}
                onPointerLeave={supportCarousel.handlePointerLeave}
                onTouchStart={supportCarousel.handleTouchStart}
                onTouchMove={supportCarousel.handleTouchMove}
                onTouchEnd={supportCarousel.handleTouchEnd}
              >
                <div
                  className="flex transition-transform duration-500 ease-out"
                  style={{
                    transform: `translateX(-${supportCarousel.index * 100}%)`,
                  }}
                >
                  {staffSlides.map((slide, slideIndex) => (
                    <div
                      key={slideIndex}
                      className="w-full shrink-0 px-1 sm:px-2"
                    >
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {slide.map((staff) => (
                          <button
                            type="button"
                            key={staff.id}
                            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow flex flex-col h-full min-h-[260px] overflow-hidden"
                            onClick={() => setActiveCard({ type: "support", data: staff })}
                          >
                            <div className="relative w-full pt-[100%] bg-gray-100 overflow-hidden">
                              {staff.photo ? (
                                <img
                                  src={staff.photo}
                                  alt={staff.name}
                                  className="absolute inset-0 w-full h-full object-cover"
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                  <Users size={36} />
                                </div>
                              )}
                            </div>
                            <div className="p-4 text-center flex-1 flex flex-col justify-center bg-white">
                              <h3 className="text-lg font-semibold text-gray-800">
                                {staff.name || staff.nameBn}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {staff.roleBn || staff.role}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {staffSlides.length > 1 && (
                <>
                  <button
                    type="button"
                    className="absolute left-0 top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full p-2 text-gray-700 hover:bg-gray-100"
                    onClick={supportCarousel.goToPrevious}
                    aria-label="আগের সহায়ক কর্মী"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className="absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full p-2 text-gray-700 hover:bg-gray-100"
                    onClick={supportCarousel.goToNext}
                    aria-label="পরের সহায়ক কর্মী"
                  >
                    ›
                  </button>
                  <div className="mt-4 flex justify-center gap-2">
                    {staffSlides.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`h-2 rounded-full transition-all ${
                          supportCarousel.index === idx ? "w-6 bg-blue-600" : "w-2 bg-gray-300"
                        }`}
                        onClick={() => supportCarousel.goToSlide(idx)}
                        aria-label={`সহায়ক কর্মী স্লাইড ${idx + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
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

      {activeCard && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
          onClick={closeCardModal}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeCardModal}
          />
          <div 
            className="relative bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 z-[10000]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeCardModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold z-[10001]"
              aria-label="Close details"
            >
              ✕
            </button>
            {activeCard.type === "gallery" && (
              <div className="mt-4">
                <img
                  src={activeCard.image}
                  alt="পূর্ণ আকারের ছবি"
                  className="w-full h-auto rounded-lg object-contain"
                  onError={(e) => {
                    console.error("Modal image load error:", activeCard.image);
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}
            {activeCard.type === "teacher" && (
              <div className="mt-2 space-y-4">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-36 h-36 md:w-48 md:h-48 rounded-2xl overflow-hidden bg-gray-100">
                    {activeCard.data.photo ? (
                      <img
                        src={activeCard.data.photo}
                        alt={activeCard.data.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Users size={40} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <h3 className="text-2xl font-bold text-gray-800">
                      {activeCard.data.name || activeCard.data.nameBn}
                    </h3>
                    {activeCard.data.nameBn && (
                      <p className="text-lg text-gray-600">{activeCard.data.nameBn}</p>
                    )}
                    <p className="text-sm text-gray-700">
                      পদবী: {activeCard.data.designationBn || activeCard.data.designation}
                    </p>
                    {activeCard.data.qualification && (
                      <p className="text-sm text-gray-600">
                        শিক্ষাগত যোগ্যতা: {activeCard.data.qualification}
                      </p>
                    )}
                    {activeCard.data.experience && (
                      <p className="text-sm text-gray-600">
                        অভিজ্ঞতা: {activeCard.data.experience}
                      </p>
                    )}
                    {(activeCard.data.phone || activeCard.data.email) && (
                      <div className="text-sm text-gray-600 space-y-1 pt-2">
                        {activeCard.data.phone && <p>ফোন: {activeCard.data.phone}</p>}
                        {activeCard.data.email && <p>ইমেইল: {activeCard.data.email}</p>}
                      </div>
                    )}
                  </div>
                </div>
                {(activeCard.data.bioBn || activeCard.data.bio) && (
                  <div>
                    <p className="text-sm font-semibold text-gray-800 mb-2">পরিচিতি</p>
                    <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                      {activeCard.data.bioBn || activeCard.data.bio}
                    </p>
                  </div>
                )}
              </div>
            )}
            {activeCard.type === "support" && (
              <div className="mt-2 space-y-4">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-36 h-36 md:w-48 md:h-48 rounded-2xl overflow-hidden bg-gray-100">
                    {activeCard.data.photo ? (
                      <img
                        src={activeCard.data.photo}
                        alt={activeCard.data.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Users size={40} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <h3 className="text-2xl font-bold text-gray-800">
                      {activeCard.data.name || activeCard.data.nameBn}
                    </h3>
                    {activeCard.data.nameBn && (
                      <p className="text-lg text-gray-600">{activeCard.data.nameBn}</p>
                    )}
                    <p className="text-sm text-gray-700">
                      দায়িত্ব: {activeCard.data.roleBn || activeCard.data.role}
                    </p>
                    {(activeCard.data.phone || activeCard.data.email) && (
                      <div className="text-sm text-gray-600 space-y-1 pt-2">
                        {activeCard.data.phone && <p>ফোন: {activeCard.data.phone}</p>}
                        {activeCard.data.email && <p>ইমেইল: {activeCard.data.email}</p>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            {activeCard.type === "post" && (
              <div className="mt-2 space-y-4">
                {activeCard.data.image && (
                  <div className="w-full rounded-lg overflow-hidden">
                    <img
                      src={activeCard.data.image}
                      alt={activeCard.data.title}
                      className="w-full h-auto max-h-96 object-cover"
                    />
                  </div>
                )}
                <div>
                  <span className="text-sm text-blue-600 font-medium">{activeCard.data.category}</span>
                  <h3 className="text-2xl font-bold text-gray-800 mt-2 mb-2">{activeCard.data.title}</h3>
                  {activeCard.data.titleBn && (
                    <p className="text-lg text-gray-600 mb-4">{activeCard.data.titleBn}</p>
                  )}
                  <p className="text-sm text-gray-500 mb-4">
                    {format(activeCard.data.createdAt, "dd MMM yyyy, hh:mm a")}
                  </p>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-line mb-4">{activeCard.data.description}</p>
                    {activeCard.data.descriptionBn && (
                      <p className="text-gray-700 whitespace-pre-line">{activeCard.data.descriptionBn}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            {activeCard.type === "result" && (
              <div className="mt-2 space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-2">
                    {activeCard.data.publishedAt
                      ? format(activeCard.data.publishedAt, "dd MMM yyyy")
                      : activeCard.data.createdAt
                      ? format(activeCard.data.createdAt, "dd MMM yyyy")
                      : ""}
                  </p>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    {activeCard.data.titleBn || activeCard.data.title}
                  </h3>
                  {activeCard.data.examName && (
                    <p className="text-sm text-gray-600 mb-2">
                      পরীক্ষা: {activeCard.data.examNameBn || activeCard.data.examName}
                    </p>
                  )}
                  {activeCard.data.session && (
                    <p className="text-sm text-gray-600 mb-4">শিক্ষাবর্ষ: {activeCard.data.session}</p>
                  )}
                  {(activeCard.data.description || activeCard.data.descriptionBn) && (
                    <div className="prose max-w-none mb-4">
                      <p className="text-gray-700 whitespace-pre-line">
                        {activeCard.data.descriptionBn || activeCard.data.description}
                      </p>
                    </div>
                  )}
                  {activeCard.data.fileUrl && (
                    <a
                      href={activeCard.data.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-200 text-blue-600 font-semibold px-4 py-2 hover:bg-blue-50 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      ফলাফল ডাউনলোড করুন
                      <ArrowRight size={16} />
                    </a>
                  )}
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
    </div>
    </PublicPageShell>
  );
}
