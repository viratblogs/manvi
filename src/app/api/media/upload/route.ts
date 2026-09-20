import { NextResponse } from "next/server";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { MediaAsset } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_CACHE = { "Cache-Control": "no-store, max-age=0" };

function toMediaAsset(id: string, d: Record<string, unknown>): MediaAsset {
  return {
    id,
    url: (d.url as string) ?? "",
    name: (d.name as string) ?? "Untitled Asset",
    fileType: (d.fileType as string) ?? "image/unknown",
    createdAt: (d.createdAt as number) ?? Date.now(),
  };
}

export async function GET() {
  try {
    const q = query(collection(db, "media"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const media = snap.docs.map((s) => toMediaAsset(s.id, s.data()));
    return NextResponse.json({ success: true, media }, { headers: NO_CACHE });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load media assets.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let url = "";
    let name = "Untitled image";
    let fileType = "image/jpeg";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      const customName = formData.get("name") as string | null;

      if (!file) {
        return NextResponse.json({ error: "No file uploaded in form data." }, { status: 400 });
      }

      // Convert file to base64 data URL for storage (for files uploaded directly)
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const mimeType = file.type || "image/png";
      url = `data:${mimeType};base64,${buffer.toString("base64")}`;
      name = customName || file.name;
      fileType = mimeType;
    } else if (contentType.includes("application/json")) {
      const body = await request.json();
      if (!body.url) {
        return NextResponse.json({ error: "URL is required." }, { status: 400 });
      }
      url = body.url;
      name = body.name || "Untitled image";
      fileType = body.fileType || "image/jpeg";
    } else {
      return NextResponse.json(
        { error: "Unsupported Content-Type. Send multipart/form-data or application/json." },
        { status: 400 }
      );
    }

    const now = Date.now();
    const data = { url, name, fileType, createdAt: now };
    const ref = await addDoc(collection(db, "media"), data);
    const asset = toMediaAsset(ref.id, data);

    return NextResponse.json({ success: true, asset }, { headers: NO_CACHE });
  } catch (err: unknown) {
    console.error("[API/MediaUpload] Upload error:", err);
    const message = err instanceof Error ? err.message : "Failed to upload image.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Media ID required." }, { status: 400 });
    }
    await deleteDoc(doc(db, "media", id));
    return NextResponse.json({ success: true }, { headers: NO_CACHE });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete media asset.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
