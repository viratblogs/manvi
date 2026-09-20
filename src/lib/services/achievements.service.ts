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
import type { Achievement } from "@/types";

// Default achievements shown as fallback when Firestore is empty or unreachable
export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: "static-cert-1",
    title: "NABH Hospital Accreditation & Quality Management",
    organisation: "Symbiosis Institute of Health Sciences",
    year: 2025,
    category: "Certification",
    description: "Quality standards, clinical audits, patient safety protocols, and hospital compliance framework.",
    imageUrl: "",
    credentialUrl: "",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "static-cert-2",
    title: "Healthcare Analytics & Data-Driven Operations",
    organisation: "Healthcare Executive Education",
    year: 2024,
    category: "Academic",
    description: "Statistical modeling for bed turnaround time, staffing capacity planning, and outpatient bottleneck analysis.",
    imageUrl: "",
    credentialUrl: "",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

function toAchievement(id: string, d: Record<string, unknown>): Achievement {
  return {
    id,
    title: (d.title as string) ?? "",
    organisation: (d.organisation as string) ?? "",
    year: (d.year as number) ?? new Date().getFullYear(),
    category: (d.category as Achievement["category"]) ?? "Certification",
    description: (d.description as string) ?? "",
    imageUrl: (d.imageUrl as string) ?? "",
    credentialUrl: (d.credentialUrl as string) ?? "",
    createdAt: (d.createdAt as number) ?? Date.now(),
    updatedAt: (d.updatedAt as number) ?? Date.now(),
  };
}

export async function getAchievements(): Promise<Achievement[]> {
  // Primary: read directly from Firestore (works in both local and production)
  try {
    const q = query(collection(db, "achievements"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((s) => toAchievement(s.id, s.data()));
    }
  } catch (err) {
    console.warn("[AchievementsService] Firestore read error:", err);
  }

  // Fallback: show default achievements when Firestore has no data yet
  return DEFAULT_ACHIEVEMENTS;
}

export async function getAchievementById(id: string): Promise<Achievement | null> {
  try {
    const snap = await getDoc(doc(db, "achievements", id));
    if (snap.exists()) return toAchievement(snap.id, snap.data());
  } catch {
    // fallback to list scan
  }
  const all = await getAchievements();
  return all.find((a) => a.id === id) || null;
}

export async function createAchievement(
  data: Omit<Achievement, "id" | "createdAt" | "updatedAt">,
): Promise<string> {
  const now = Date.now();
  const ref = await addDoc(collection(db, "achievements"), {
    ...data,
    createdAt: now,
    updatedAt: now,
  });
  return ref.id;
}

export async function updateAchievement(
  id: string,
  data: Partial<Omit<Achievement, "id" | "createdAt">>,
): Promise<void> {
  await updateDoc(doc(db, "achievements", id), { ...data, updatedAt: Date.now() });
}

export async function deleteAchievement(id: string): Promise<void> {
  await deleteDoc(doc(db, "achievements", id));
}
