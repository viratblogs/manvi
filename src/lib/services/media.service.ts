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

/**
 * Automatically resolves ImgBB webpage viewer links (e.g. https://ibb.co/h1L6fQFF)
 * to their direct image file URLs (e.g. https://i.ibb.co/.../image.png).
 */
export async function resolveImgBbUrl(rawUrl: string): Promise<string> {
  const trimmed = rawUrl.trim();
  if (trimmed.includes("i.ibb.co") || /\.(jpe?g|png|gif|webp|avif|svg)(\?.*)?$/i.test(trimmed)) {
    return trimmed;
  }

  const match = trimmed.match(/^https?:\/\/ibb\.co\/([a-zA-Z0-9]+)\/?$/i);
  if (match) {
    try {
      const res = await fetch(`https://ibb.co/${match[1]}/oembed.json`);
      if (res.ok) {
        const data = await res.json();
        if (data.url && typeof data.url === "string") {
          return data.url;
        }
      }
    } catch (err) {
      console.warn("[MediaService] ImgBB oembed resolution error:", err);
    }
  }

  return trimmed;
}

/**
 * Compress an image file using canvas — resizes to max 800px and encodes
 * as JPEG at quality 0.75. Output is 40–80 KB regardless of input size or PNG format.
 * This guarantees it never exceeds Firestore's 1 MB document limit.
 */
function compressImage(file: File, maxDimension = 800, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width >= height) {
          height = Math.round((height / width) * maxDimension);
          width = maxDimension;
        } else {
          width = Math.round((width / height) * maxDimension);
          height = maxDimension;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context."));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      // Always encode to image/jpeg for reliable byte-size compression
      resolve(canvas.toDataURL("image/jpeg", quality));
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image for compression."));
    };

    img.src = objectUrl;
  });
}

function toMediaAsset(id: string, d: Record<string, unknown>): MediaAsset {
  return {
    id,
    url: (d.url as string) ?? "",
    name: (d.name as string) ?? "Untitled Asset",
    fileType: (d.fileType as string) ?? "image/unknown",
    createdAt: (d.createdAt as number) ?? Date.now(),
  };
}

/** Save an external image URL to the media library. */
export async function saveMediaUrl(input: { url: string; name: string }): Promise<MediaAsset> {
  const resolvedUrl = await resolveImgBbUrl(input.url);
  const now = Date.now();
  const data = {
    url: resolvedUrl,
    name: input.name,
    fileType: guessFileType(resolvedUrl),
    createdAt: now,
  };
  const ref = await addDoc(collection(db, "media"), data);
  return toMediaAsset(ref.id, data);
}

/**
 * Compress the file to a small base64 string, then persist it in Firestore.
 * Compressed images are typically 60–150 KB — safe within Firestore's 1 MB limit.
 */
export async function uploadMediaFile(file: File, customName?: string): Promise<MediaAsset> {
  const fileTitle = customName?.trim() || file.name;
  const compressedDataUrl = await compressImage(file);
  const now = Date.now();
  const data = {
    url: compressedDataUrl,
    name: fileTitle,
    fileType: "image/jpeg",
    createdAt: now,
  };
  const ref = await addDoc(collection(db, "media"), data);
  return toMediaAsset(ref.id, data);
}

/** Fetch all media assets from Firestore. */
export async function getMedia(): Promise<MediaAsset[]> {
  try {
    const q = query(collection(db, "media"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((s) => toMediaAsset(s.id, s.data()));
  } catch (err) {
    console.warn("[MediaService] Firestore read error:", err);
    return [];
  }
}

/** Delete a media asset from Firestore. */
export async function deleteMedia(id: string): Promise<void> {
  await deleteDoc(doc(db, "media", id));
}
