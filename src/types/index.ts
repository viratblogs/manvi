export type BlogStatus = "draft" | "published" | "scheduled";

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
