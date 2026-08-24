"use client";

import { useEffect, useState } from "react";
import { Check, Copy, ExternalLink, Plus, Trash2 } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { deleteMedia, getMedia, saveMediaUrl, validateUrl } from "@/lib/media";
import { formatShortDate } from "@/lib/utils";
import type { MediaAsset } from "@/types";

export default function MediaPage() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState("");

  useEffect(() => { getMedia().then(setAssets).catch(() => {}).finally(() => setLoading(false)); }, []);

  async function save() {
    const result = validateUrl(url);
    if (!result.ok) { setError(result.reason); return; }
    setError(""); setSaving(true);
    try {
      const asset = await saveMediaUrl({ url: result.url, name });
      setAssets((list) => [asset, ...list]);
      setUrl(""); setName("");
    } catch {
      setError("Couldn't save. Check that your Firestore rules allow this admin UID to write.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(asset: MediaAsset) {
    if (!confirm(`Remove "${asset.name}" from the library? The image itself stays where you uploaded it.`)) return;
    await deleteMedia(asset.id);
    setAssets((list) => list.filter((a) => a.id !== asset.id));
  }

  async function copyUrl(asset: MediaAsset) {
    await navigator.clipboard.writeText(asset.url);
    setCopied(asset.id);
    setTimeout(() => setCopied(""), 2000);
  }

  return (
    <AdminShell>
      <h1 className="font-display text-2xl font-semibold">Media</h1>
      <p className="mt-1.5 text-sm text-ink-muted">
        Your saved image links, ready to paste into any post.
      </p>

      <section className="mt-7 rounded-xl border border-line bg-surface p-6 dark:border-white/10 dark:bg-white/[0.03]">
        <h2 className="measure mb-5">Save a new link</h2>
        <div className="grid gap-4 sm:grid-cols-[1fr_240px_auto] sm:items-end">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-ink-muted">Image link</span>
            <input
              value={url}
              onChange={(e) => { setUrl(e.target.value); setError(""); }}
              onKeyDown={(e) => { if (e.key === "Enter") save(); }}
              placeholder="https://res.cloudinary.com/..."
              className="field !py-2.5 text-sm"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-ink-muted">Name it</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") save(); }}
              placeholder="Hospital ward photo"
              className="field !py-2.5 text-sm"
            />
          </label>
          <button onClick={save} disabled={saving} className="btn-primary !py-2.5">
            <Plus className="h-4 w-4" /> {saving ? "Saving…" : "Save"}
          </button>
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </p>
        )}

        <div className="mt-5 rounded-lg border border-line bg-surface-sub p-4 text-sm text-ink-muted dark:border-white/10 dark:bg-white/[0.03]">
          <p className="font-medium text-ink dark:text-white">Where to upload your images</p>
          <p className="mt-2">
            Use <a href="https://cloudinary.com" target="_blank" rel="noopener noreferrer" className="link-underline">Cloudinary</a>{" "}
            or <a href="https://imgbb.com" target="_blank" rel="noopener noreferrer" className="link-underline">ImgBB</a> — both
            are free and neither asks for a card. Upload your image there, copy the direct link
            it gives you, and paste it above.
          </p>
        </div>
      </section>

      {loading ? (
        <p className="py-16 text-center text-sm text-ink-muted">Loading library…</p>
      ) : assets.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-line py-16 text-center dark:border-white/10">
          <p className="font-medium">No images saved yet</p>
          <p className="mt-1.5 text-sm text-ink-muted">Paste your first image link above.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {assets.map((a) => (
            <figure key={a.id} className="group overflow-hidden rounded-xl border border-line bg-surface dark:border-white/10 dark:bg-white/[0.03]">
              <div className="relative aspect-square bg-surface-sub dark:bg-white/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={a.url}
                  alt={a.name}
                  loading="lazy"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-ink/60 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <button onClick={() => copyUrl(a)} aria-label="Copy link" className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-ink">
                    {copied === a.id ? <Check className="h-4 w-4 text-positive" /> : <Copy className="h-4 w-4" />}
                  </button>
                  <a href={a.url} target="_blank" rel="noopener noreferrer" aria-label="Open image" className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-ink">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <button onClick={() => remove(a)} aria-label="Remove from library" className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <figcaption className="p-3">
                <p className="truncate text-xs font-medium">{a.name}</p>
                <p className="mt-0.5 text-xs text-ink-muted">{formatShortDate(a.createdAt)}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
