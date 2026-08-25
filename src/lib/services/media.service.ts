import type { MediaAsset } from "@/types";

const IMAGE_EXT = /\.(jpe?g|png|gif|webp|avif|svg)(\?.*)?$/i;

export function validateUrl(raw: string): { ok: true; url: string } | { ok: false; reason: string } {
  const url = raw.trim();
  if (!url) return { ok: false, reason: "Paste or enter an image link first." };
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { ok: false, reason: "Invalid link format. Must start with http:// or https://" };
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return { ok: false, reason: "Use an HTTP or HTTPS link for web compatibility." };
  }
  return { ok: true, url };
}

export function guessFileType(filenameOrUrl: string) {
  const match = filenameOrUrl.match(IMAGE_EXT);
  if (match) return `image/${match[1].toLowerCase().replace("jpg", "jpeg")}`;
  if (/\.pdf(\?.*)?$/i.test(filenameOrUrl)) return "application/pdf";
  return "image/unknown";
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export async function saveMediaUrl(input: { url: string; name: string }): Promise<MediaAsset> {
  const origin = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");
  const res = await fetch(`${origin}/api/media/upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const json = await res.json();
  if (!res.ok || json.error) {
    throw new Error(json.error || "Failed to save media link.");
  }
  return json.asset;
}

export async function uploadMediaFile(file: File, customName?: string): Promise<MediaAsset> {
  const fileTitle = customName?.trim() || file.name;
  const dataUrl = await fileToDataUrl(file);

  const origin = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");
  const res = await fetch(`${origin}/api/media/upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: dataUrl, name: fileTitle }),
  });

  const json = await res.json();
  if (!res.ok || json.error) {
    throw new Error(json.error || "Failed to upload image file.");
  }
  return json.asset;
}

export async function getMedia(): Promise<MediaAsset[]> {
  try {
    const origin = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");
    const res = await fetch(`${origin}/api/media/upload`, { cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.media)) return json.media;
    }
  } catch {
    // fallback
  }
  return [];
}

export async function deleteMedia(id: string) {
  const origin = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");
  const res = await fetch(`${origin}/api/media/upload?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  const json = await res.json();
  if (!res.ok || json.error) {
    throw new Error(json.error || "Failed to delete media asset.");
  }
}
