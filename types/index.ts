export interface User {
  id: string;
  email: string;
  role: "super_admin" | "admin";
  permissions?: string[];
  createdAt: Date;
}

export interface Notice {
  id: string;
  title: string;
  description: string;
  attachments?: string[];
  scheduledTime?: Date;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Student {
  id: string;
  name: string;
  nameBn: string;
  photo?: string;
  class: string;
  roll: string;
  admissionYear: string;
  admissionRoll?: string;
  fatherName?: string;
  motherName?: string;
  address?: string;
  phone?: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdmissionApplication {
  id: string;
  studentName: string;
  studentNameBn: string;
  fatherName: string;
  motherName: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  phone: string;
  email?: string;
  previousSchool?: string;
  previousClass?: string;
  appliedClass: string;
  status: "pending" | "approved" | "cancelled";
  admissionRoll?: string;
  assignedClass?: string;
  assignedTextbooks?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Class {
  id: string;
  name: string;
  nameBn: string;
  capacity: number;
  status: "active" | "inactive";
  subjects: Subject[];
  sections?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Subject {
  id: string;
  name: string;
  nameBn: string;
  textbooks: Textbook[];
}

export interface Textbook {
  id: string;
  name: string;
  nameBn: string;
  author?: string;
  publisher?: string;
}

export interface Routine {
  id: string;
  title: string;
  titleBn: string;
  type: "class" | "exam";
  class?: string;
  table?: any; // For structured table data
  image?: string;
  pdf?: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Teacher {
  id: string;
  name: string;
  nameBn: string;
  photo?: string;
  designation: string;
  designationBn: string;
  qualification?: string;
  experience?: string;
  email?: string;
  phone?: string;
  bio?: string;
  bioBn?: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupportStaff {
  id: string;
  name: string;
  nameBn: string;
  photo?: string;
  role: string;
  roleBn: string;
  phone?: string;
  email?: string;
  bio?: string;
  bioBn?: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommitteeMember {
  id: string;
  name: string;
  nameBn: string;
  photo?: string;
  designation: string;
  designationBn: string;
  bio?: string;
  bioBn?: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Alumni {
  id: string;
  name: string;
  nameBn: string;
  photo?: string;
  graduationYear: string;
  currentPosition?: string;
  currentPositionBn?: string;
  achievement?: string;
  achievementBn?: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Post {
  id: string;
  title: string;
  titleBn: string;
  description: string;
  descriptionBn: string;
  category: string;
  categoryBn: string;
  image?: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Result {
  id: string;
  title: string;
  titleBn: string;
  description?: string;
  descriptionBn?: string;
  examName?: string;
  examNameBn?: string;
  session?: string;
  fileUrl?: string;
  published: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface WebPage {
  id: string;
  title: string;
  titleBn: string;
  description: string;
  descriptionBn: string;
  image?: string;
  url: string; // unique
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// General Settings Document
export interface GeneralSettings {
  id: "general";
  schoolName: string;
  schoolNameBn: string;
  schoolCode: string;
  websiteInfo?: string;
  websiteInfoBn?: string;
  logo?: string;
}

// Institute Head Settings Document
export interface HeadSettings {
  id: "head";
  name: string;
  nameBn: string;
  designation: string;
  designationBn: string;
  photo?: string;
  quote?: string;
  quoteBn?: string;
  teacherProfileLink?: string;
}

// Homepage Settings Document
export interface HomepageSettings {
  id: "homepage";
  sliderImages: string[]; // 3 images
  featuredSections: string[];
  gallery: string[];
}

// Combined Settings interface for backward compatibility
export interface Settings {
  schoolName: string;
  schoolNameBn: string;
  schoolCode: string;
  websiteInfo?: string;
  websiteInfoBn?: string;
  logo?: string;
  instituteHead: {
    name: string;
    nameBn: string;
    designation: string;
    designationBn: string;
    photo?: string;
    quote?: string;
    quoteBn?: string;
    teacherProfileLink?: string;
  };
  homepage: {
    sliderImages: string[]; // 3 images
    featuredSections: string[];
    gallery: string[];
  };
}

