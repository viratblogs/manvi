import { NextResponse } from "next/server";
import { serverStore } from "@/lib/services/serverStore";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const settings = serverStore.getSettings();
    return NextResponse.json(
      { success: true, settings },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load settings.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const settings = serverStore.updateSettings(body);

    // Sync to Firestore in background without blocking response
    setDoc(doc(db, "settings", "site"), settings, { merge: true }).catch((e) =>
      console.warn("[API/Settings] Firestore background sync warning:", e)
    );

    return NextResponse.json(
      { success: true, settings },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update settings.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
