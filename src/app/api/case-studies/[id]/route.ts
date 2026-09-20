import { NextResponse } from "next/server";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const snap = await getDoc(doc(db, "case-studies", id));
    if (!snap.exists()) {
      return NextResponse.json({ error: "Case study not found." }, { status: 404 });
    }
    return NextResponse.json(
      { success: true, caseStudy: toCaseStudy(snap.id, snap.data()) },
      { headers: NO_CACHE }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch case study.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const patch = { ...body, updatedAt: Date.now() };
    await updateDoc(doc(db, "case-studies", id), patch);
    return NextResponse.json(
      { success: true, caseStudy: { id, ...patch } },
      { headers: NO_CACHE }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update case study.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteDoc(doc(db, "case-studies", id));
    return NextResponse.json({ success: true }, { headers: NO_CACHE });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete case study.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
