import { NextResponse } from "next/server";
import { serverStore } from "@/lib/services/serverStore";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { SiteSettings } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const localSettings = serverStore.getSettings();
    let finalSettings: SiteSettings = { ...localSettings };

    // Query Firestore document 'settings/site' only to merge if remote is strictly newer
    try {
      const snap = await getDoc(doc(db, "settings", "site"));
      if (snap.exists()) {
        const remoteData = snap.data() as Partial<SiteSettings>;
        const remoteTime = remoteData.updatedAt || 0;
        const localTime = localSettings.updatedAt || 0;

        // Prevent stale Firestore reads from overwriting newer local serverStore settings
        if (remoteTime > localTime) {
          finalSettings = {
            ...localSettings,
            ...remoteData,
          };
          serverStore.updateSettings(finalSettings);
        }
      }
    } catch (e) {
      console.warn("[API/Settings] Firestore read fallback to serverStore:", e);
    }

    return NextResponse.json(
      { success: true, settings: finalSettings },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      }
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

    // Sync to Firestore synchronously
    try {
      await setDoc(doc(db, "settings", "site"), settings, { merge: true });
    } catch (e) {
      console.warn("[API/Settings] Firestore sync warning:", e);
    }

    return NextResponse.json(
      { success: true, settings },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update settings.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
