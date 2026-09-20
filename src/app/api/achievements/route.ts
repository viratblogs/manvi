import { NextResponse } from "next/server";
import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Achievement } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_CACHE = { "Cache-Control": "no-store, max-age=0" };

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

export async function GET() {
  try {
    const q = query(collection(db, "achievements"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const achievements = snap.docs.map((s) => toAchievement(s.id, s.data()));
    return NextResponse.json({ success: true, achievements }, { headers: NO_CACHE });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch achievements.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const now = Date.now();
    const data = { ...body, createdAt: now, updatedAt: now };
    const ref = await addDoc(collection(db, "achievements"), data);
    const achievement = toAchievement(ref.id, data);
    return NextResponse.json(
      { success: true, id: ref.id, achievement },
      { headers: NO_CACHE }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create achievement.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
