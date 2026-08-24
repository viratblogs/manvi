import {
  addDoc, collection, deleteDoc, doc, getDoc, getDocs, limit as fbLimit,
  orderBy, query, updateDoc, where,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Blog } from "@/types";

const COL = "blogs";

function toBlog(id: string, d: Record<string, unknown>): Blog {
  return {
    id,
    title: (d.title as string) ?? "",
    slug: (d.slug as string) ?? "",
    excerpt: (d.excerpt as string) ?? "",
    content: (d.content as string) ?? "",
    featuredImage: (d.featuredImage as string) ?? "",
    author: (d.author as string) ?? "Manvi Gurjar",
    category: (d.category as string) ?? "Healthcare Strategy",
    tags: (d.tags as string[]) ?? [],
    status: (d.status as Blog["status"]) ?? "draft",
    readingTime: (d.readingTime as number) ?? 5,
    seoTitle: (d.seoTitle as string) ?? "",
    seoDescription: (d.seoDescription as string) ?? "",
    keywords: (d.keywords as string[]) ?? [],
    canonicalUrl: (d.canonicalUrl as string) ?? "",
    ogImage: (d.ogImage as string) ?? "",
    createdAt: (d.createdAt as number) ?? Date.now(),
    updatedAt: (d.updatedAt as number) ?? Date.now(),
    publishedAt: (d.publishedAt as number) ?? null,
  };
}

/** Published posts only, newest first. Safe to call from public pages. */
export async function getPublishedBlogs(max?: number): Promise<Blog[]> {
  const clauses = [where("status", "==", "published"), orderBy("publishedAt", "desc")];
  const q = max ? query(collection(db, COL), ...clauses, fbLimit(max)) : query(collection(db, COL), ...clauses);
  const snap = await getDocs(q);
  return snap.docs.map((s) => toBlog(s.id, s.data()));
}

export async function getAllBlogs(): Promise<Blog[]> {
  const q = query(collection(db, COL), orderBy("updatedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((s) => toBlog(s.id, s.data()));
}

export async function getBlogBySlug(slug: string): Promise<Blog | null> {
  const q = query(collection(db, COL), where("slug", "==", slug), fbLimit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return toBlog(d.id, d.data());
}

export async function getBlogById(id: string): Promise<Blog | null> {
  const snap = await getDoc(doc(db, COL, id));
  return snap.exists() ? toBlog(snap.id, snap.data()) : null;
}

export async function createBlog(data: Partial<Blog>) {
  const now = Date.now();
  const ref = await addDoc(collection(db, COL), {
    ...data,
    createdAt: now,
    updatedAt: now,
    publishedAt: data.status === "published" ? (data.publishedAt ?? now) : null,
  });
  return ref.id;
}

export async function updateBlog(id: string, data: Partial<Blog>) {
  const patch: Record<string, unknown> = { ...data, updatedAt: Date.now() };
  if (data.status === "published" && !data.publishedAt) patch.publishedAt = Date.now();
  if (data.status === "draft") patch.publishedAt = null;
  await updateDoc(doc(db, COL, id), patch);
}

export async function deleteBlog(id: string) {
  await deleteDoc(doc(db, COL, id));
}

/** Same category first, then any other recent post, capped at `max`. */
export async function getRelatedBlogs(current: Blog, max = 3): Promise<Blog[]> {
  const all = await getPublishedBlogs(30);
  const others = all.filter((b) => b.id !== current.id);
  const sameCategory = others.filter((b) => b.category === current.category);
  const rest = others.filter((b) => b.category !== current.category);
  return [...sameCategory, ...rest].slice(0, max);
}
