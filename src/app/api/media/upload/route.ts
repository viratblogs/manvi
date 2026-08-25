import { NextResponse } from "next/server";
import { serverStore } from "@/lib/services/serverStore";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const list = serverStore.getMedia();
    return NextResponse.json(
      { success: true, media: list },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load media assets.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      const customName = formData.get("name") as string | null;

      if (!file) {
        return NextResponse.json({ error: "No file uploaded in form data." }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const mimeType = file.type || "image/png";
      const base64 = `data:${mimeType};base64,${buffer.toString("base64")}`;

      const asset = serverStore.saveMedia({
        url: base64,
        name: customName || file.name,
        fileType: mimeType,
      });

      return NextResponse.json(
        { success: true, asset },
        { headers: { "Cache-Control": "no-store, max-age=0" } }
      );
    }

    if (contentType.includes("application/json")) {
      const body = await request.json();
      const { url, name, fileType } = body;

      if (!url) {
        return NextResponse.json({ error: "URL is required." }, { status: 400 });
      }

      const asset = serverStore.saveMedia({
        url,
        name: name || "Untitled image",
        fileType: fileType || "image/jpeg",
      });

      return NextResponse.json(
        { success: true, asset },
        { headers: { "Cache-Control": "no-store, max-age=0" } }
      );
    }

    return NextResponse.json(
      { error: "Unsupported Content-Type. Send multipart/form-data or application/json." },
      { status: 400 }
    );
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
    serverStore.deleteMedia(id);
    return NextResponse.json(
      { success: true },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete media asset.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
