import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "./firebase";
import type { MediaAsset } from "@/types";

/* This project does not use Cloud Storage — that would require a billing account.
   Instead, images are hosted on a free service (Cloudinary, ImgBB, or similar) and
   only the link is saved here, in Firestore, which stays on the no-cost plan. */

const COL = "media";

const IMAGE_EXT = /\.(jpe?g|png|gif|webp|avif|svg)(\?.*)?$/i;

/** Rejects anything that isn't a fetchable https link. */
export function validateUrl(raw: string): { ok: true; url: string } | { ok: false; reason: string } {
  const url = raw.trim();
  if (!url) return { ok: false, reason: "Paste an image link first." };
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { ok: false, reason: "That doesn't look like a link. It should start with https://" };
  }
  if (parsed.protocol !== "https:") {
    return { ok: false, reason: "Use an https:// link. Images on http:// won't load on your site." };
  }
  return { ok: true, url };
}

/** Best guess at the file type from the link, for display only. */
export function guessFileType(url: string) {
  const match = url.match(IMAGE_EXT);
  if (match) return `image/${match[1].toLowerCase().replace("jpg", "jpeg")}`;
  if (/\.pdf(\?.*)?$/i.test(url)) return "application/pdf";
  return "image/unknown";
}

export async function saveMediaUrl(input: { url: string; name: string }): Promise<MediaAsset> {
  const record = {
    url: input.url,
    name: input.name.trim() || "Untitled image",
    fileType: guessFileType(input.url),
    createdAt: Date.now(),
  };
  const added = await addDoc(collection(db, COL), record);
  return { id: added.id, ...record };
}

export async function getMedia(): Promise<MediaAsset[]> {
  const snap = await getDocs(query(collection(db, COL), orderBy("createdAt", "desc")));
  return snap.docs.map((s) => ({ id: s.id, ...(s.data() as Omit<MediaAsset, "id">) }));
}

export async function deleteMedia(id: string) {
  // Removes the saved link only. The image itself stays on whichever host you used.
  await deleteDoc(doc(db, COL, id));
}
