import { NextResponse } from "next/server";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { SiteSettings } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_CACHE = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  "Pragma": "no-cache",
  "Expires": "0",
};

export async function GET() {
  try {
    const snap = await getDoc(doc(db, "settings", "site"));
    const settings: Partial<SiteSettings> = snap.exists() ? (snap.data() as Partial<SiteSettings>) : {};
    return NextResponse.json({ success: true, settings }, { headers: NO_CACHE });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load settings.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const patch: Partial<SiteSettings> = { ...body, updatedAt: Date.now() };
    await setDoc(doc(db, "settings", "site"), patch, { merge: true });
    return NextResponse.json({ success: true, settings: patch }, { headers: NO_CACHE });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update settings.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
