import { NextResponse } from "next/server";
import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { FirestoreCaseStudy } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_CACHE = { "Cache-Control": "no-store, max-age=0" };

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

export async function GET() {
  try {
    const q = query(collection(db, "case-studies"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const caseStudies = snap.docs.map((s) => toCaseStudy(s.id, s.data()));
    return NextResponse.json({ success: true, caseStudies }, { headers: NO_CACHE });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load case studies.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const now = Date.now();
    const data = { ...body, createdAt: now, updatedAt: now };
    const ref = await addDoc(collection(db, "case-studies"), data);
    const caseStudy = toCaseStudy(ref.id, data);
    return NextResponse.json(
      { success: true, id: ref.id, caseStudy },
      { headers: NO_CACHE }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create case study.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
