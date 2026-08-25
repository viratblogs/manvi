import { NextResponse } from "next/server";
import { serverStore } from "@/lib/services/serverStore";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const list = serverStore.getAchievements();
    return NextResponse.json(
      { success: true, achievements: list },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch achievements.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const saved = serverStore.saveAchievement(body);

    addDoc(collection(db, "achievements"), {
      ...body,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    }).catch((e) => console.warn("[API/Achievements] Firestore sync warning:", e));

    return NextResponse.json(
      { success: true, id: saved.id, achievement: saved },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create achievement.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
