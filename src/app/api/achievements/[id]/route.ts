import { NextResponse } from "next/server";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const snap = await getDoc(doc(db, "achievements", id));
    if (!snap.exists()) {
      return NextResponse.json({ error: "Achievement not found." }, { status: 404 });
    }
    return NextResponse.json(
      { success: true, achievement: toAchievement(snap.id, snap.data()) },
      { headers: NO_CACHE }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch achievement.";
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
    await updateDoc(doc(db, "achievements", id), patch);
    return NextResponse.json(
      { success: true, achievement: { id, ...patch } },
      { headers: NO_CACHE }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update achievement.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteDoc(doc(db, "achievements", id));
    return NextResponse.json({ success: true }, { headers: NO_CACHE });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete achievement.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
