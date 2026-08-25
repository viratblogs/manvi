export type BlogStatus = "draft" | "published" | "scheduled";

// ---------------------------------------------------------------------------
// Achievement
// ---------------------------------------------------------------------------

export type AchievementCategory = "Award" | "Certification" | "Recognition" | "Academic";

export interface Achievement {
  id: string;
  title: string;
  organisation: string;
  year: number;
  category: AchievementCategory;
  description: string;
  imageUrl?: string;
  credentialUrl?: string;
  createdAt: number;
  updatedAt: number;
}

// ---------------------------------------------------------------------------
// Site Settings
// ---------------------------------------------------------------------------

export interface SiteSettings {
  /** URL of the hero / profile photo shown on the homepage and About page. */
  heroImageUrl: string;
  /** High-impact 1-2 sentence bio statement (Executive Snapshot). */
  bioStatement?: string;
  /** Dynamic array of professional skill tags (Core Competencies). */
  skills?: string[];
  /** Chronological career narrative and milestones text (Professional Journey). */
  professionalJourney?: string;
  updatedAt: number;
}

// ---------------------------------------------------------------------------
// Case Study (Firestore version — mirrors the static CaseStudy in content.ts)
// ---------------------------------------------------------------------------

export interface CaseStudyResult {
  value: string;
  label: string;
  note: string;
}

export interface FirestoreCaseStudy {
  id: string;
  slug: string;
  index: string;
  title: string;
  summary: string;
  coverImage?: string;
  context: string;
  situation: string;
  task: string;
  action: string[];
  results: CaseStudyResult[];
  takeaways: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;           // TipTap HTML
  featuredImage: string;
  author: string;
  category: string;
  tags: string[];
  status: BlogStatus;
  readingTime: number;       // minutes
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  canonicalUrl: string;
  ogImage: string;
  createdAt: number;
  updatedAt: number;
  publishedAt: number | null;
}

export type ContactStatus = "new" | "read" | "archived";

export interface ContactLead {
  id: string;
  name: string;
  email: string;
  organization: string;
  subject: string;
  message: string;
  status: ContactStatus;
  createdAt: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt: number;
}

export interface MediaAsset {
  id: string;
  url: string;
  name: string;
  fileType: string;
  createdAt: number;
}
