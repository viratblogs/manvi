import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { caseStudies as defaultCaseStudies } from "../content";
import type { FirestoreCaseStudy } from "@/types";

function toCaseStudy(id: string, d: Record<string, unknown>): FirestoreCaseStudy {
  return {
    id,
    slug: (d.slug as string) ?? "",
    index: (d.index as string) ?? "01",
    title: (d.title as string) ?? "Untitled",
    summary: (d.summary as string) ?? "",
    coverImage: (d.coverImage as string) ?? "",
    context: (d.context as string) ?? "",
    situation: (d.situation as string) ?? "",
    task: (d.task as string) ?? "",
    action: Array.isArray(d.action) ? (d.action as string[]) : [],
    results: Array.isArray(d.results)
      ? (d.results as FirestoreCaseStudy["results"])
      : [],
    takeaways: Array.isArray(d.takeaways) ? (d.takeaways as string[]) : [],
    createdAt: (d.createdAt as number) ?? Date.now(),
    updatedAt: (d.updatedAt as number) ?? Date.now(),
  };
}

export async function getAllCaseStudies(): Promise<FirestoreCaseStudy[]> {
  // Primary: read directly from Firestore (works in both local and production)
  try {
    const q = query(collection(db, "case-studies"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((s) => toCaseStudy(s.id, s.data()));
    }
  } catch (err) {
    console.warn("[CaseStudiesService] Firestore read error:", err);
  }

  // Fallback: use static content when Firestore has no data yet
  return defaultCaseStudies.map((cs, idx) => ({
    id: `static-${cs.slug}`,
    ...cs,
    coverImage: "",
    createdAt: Date.now() - idx * 1000,
    updatedAt: Date.now() - idx * 1000,
  }));
}

export async function getCaseStudyBySlug(slug: string): Promise<FirestoreCaseStudy | null> {
  const all = await getAllCaseStudies();
  const found = all.find((cs) => cs.slug === slug);
  if (found) return found;

  // Fallback to static content
  const def = defaultCaseStudies.find((c) => c.slug === slug);
  if (def) {
    return {
      id: `static-${def.slug}`,
      ...def,
      coverImage: "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }
  return null;
}

export async function getCaseStudyById(id: string): Promise<FirestoreCaseStudy | null> {
  // Try direct Firestore read first
  try {
    const snap = await getDoc(doc(db, "case-studies", id));
    if (snap.exists()) return toCaseStudy(snap.id, snap.data());
  } catch {
    // fallback
  }
  const all = await getAllCaseStudies();
  return all.find((cs) => cs.id === id) || null;
}

export async function createCaseStudy(data: Partial<FirestoreCaseStudy>): Promise<string> {
  const now = Date.now();
  const ref = await addDoc(collection(db, "case-studies"), {
    ...data,
    createdAt: now,
    updatedAt: now,
  });
  return ref.id;
}

export async function updateCaseStudy(id: string, data: Partial<FirestoreCaseStudy>): Promise<void> {
  await updateDoc(doc(db, "case-studies", id), { ...data, updatedAt: Date.now() });
}

export async function deleteCaseStudy(id: string): Promise<void> {
  await deleteDoc(doc(db, "case-studies", id));
}
