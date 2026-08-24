import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

/** Strips HTML and counts words at 200 wpm — the rate most reading-time tools assume. */
export function readingTime(html: string) {
  const words = html.replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function formatDate(ts: number | null | undefined) {
  if (!ts) return "";
  return new Date(ts).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatShortDate(ts: number | null | undefined) {
  if (!ts) return "";
  return new Date(ts).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

/** Injects stable ids into h2/h3 so the table of contents can link to them. */
export function withHeadingIds(html: string) {
  let i = 0;
  return html.replace(/<(h[23])([^>]*)>(.*?)<\/\1>/gi, (_m, tag, attrs, inner) => {
    const text = inner.replace(/<[^>]*>/g, "");
    const id = `${slugify(text) || "section"}-${i++}`;
    return `<${tag}${attrs} id="${id}">${inner}</${tag}>`;
  });
}

export function extractHeadings(html: string) {
  const out: { id: string; text: string; level: number }[] = [];
  const re = /<(h[23])[^>]*id="([^"]+)"[^>]*>(.*?)<\/\1>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    out.push({ level: Number(m[1][1]), id: m[2], text: m[3].replace(/<[^>]*>/g, "") });
  }
  return out;
}
