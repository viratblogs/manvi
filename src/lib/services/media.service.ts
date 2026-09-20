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

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
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
  const now = Date.now();
  const data = {
    url: input.url,
    name: input.name,
    fileType: guessFileType(input.url),
    createdAt: now,
  };
  const ref = await addDoc(collection(db, "media"), data);
  return toMediaAsset(ref.id, data);
}

/** Convert a File to a data URL and store it in the media library. */
export async function uploadMediaFile(file: File, customName?: string): Promise<MediaAsset> {
  const fileTitle = customName?.trim() || file.name;
  const dataUrl = await fileToDataUrl(file);
  const now = Date.now();
  const data = {
    url: dataUrl,
    name: fileTitle,
    fileType: file.type || "image/unknown",
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
