import { NextResponse } from "next/server";
import { serverStore } from "@/lib/services/serverStore";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const list = serverStore.getAchievements();
    const item = list.find((a) => a.id === id);
    if (!item) {
      return NextResponse.json({ error: "Achievement not found." }, { status: 404 });
    }
    return NextResponse.json(
      { success: true, achievement: item },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
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
    const updated = serverStore.saveAchievement({ ...body, id });

    if (!id.startsWith("static-")) {
      updateDoc(doc(db, "achievements", id), { ...body, updatedAt: Date.now() }).catch((e) =>
        console.warn("[API/Achievements/[id]] Firestore update sync warning:", e)
      );
    }

    return NextResponse.json(
      { success: true, achievement: updated },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
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
    serverStore.deleteAchievement(id);

    if (!id.startsWith("static-")) {
      deleteDoc(doc(db, "achievements", id)).catch((e) =>
        console.warn("[API/Achievements/[id]] Firestore delete sync warning:", e)
      );
    }

    return NextResponse.json(
      { success: true },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete achievement.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
