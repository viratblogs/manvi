"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Check, Copy, ExternalLink, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { deleteMedia, getMedia, saveMediaUrl, uploadMediaFile, validateUrl } from "@/lib/services/media.service";
import { formatShortDate } from "@/lib/utils";
import type { MediaAsset } from "@/types";

export default function MediaPage() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [activeTab, setActiveTab] = useState<"upload" | "url">("upload");

  // File Upload State
  const [file, setFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // URL State
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [urlError, setUrlError] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    getMedia()
      .then(setAssets)
      .catch((err) => {
        console.error("[MediaPage] Failed to load media library:", err);
        setFetchError(
          "Could not load the media library. Check that your Firestore rules allow this admin UID to read."
        );
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleFileUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setUploadError("Please select a file to upload.");
      return;
    }
    setUploadError("");
    setUploading(true);

    try {
      const asset = await uploadMediaFile(file, uploadName || undefined);
      setAssets((list) => [asset, ...list]);
      setFile(null);
      setUploadName("");
    } catch (err: unknown) {
      console.error("[MediaPage] Upload failed:", err);
      const msg = err instanceof Error ? err.message : "Couldn't upload file.";
      setUploadError(msg);
    } finally {
      setUploading(false);
    }
  }

  async function saveUrl() {
    const result = validateUrl(url);
    if (!result.ok) { setUrlError(result.reason); return; }
    setUrlError(""); setSaving(true);
    try {
      const asset = await saveMediaUrl({ url: result.url, name });
      setAssets((list) => [asset, ...list]);
      setUrl(""); setName("");
    } catch {
      setUrlError("Couldn't save link. Check your network or Firestore rules.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(asset: MediaAsset) {
    if (!confirm(`Remove "${asset.name}" from the library?`)) return;
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
      <h1 className="font-display text-2xl font-semibold">Media Library</h1>
      <p className="mt-1.5 text-sm text-ink-muted">
        Upload images directly from your device or save external links for use across your site.
      </p>

      {fetchError && (
        <div
          role="alert"
          className="mt-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          {fetchError}
        </div>
      )}

      {/* Tabs / Adding Controls */}
      <section className="mt-7 rounded-xl border border-line bg-surface p-6 dark:border-white/10 dark:bg-white/[0.03]">
        <div className="flex border-b border-line pb-4 mb-6 dark:border-white/10 gap-4">
          <button
            onClick={() => setActiveTab("upload")}
            className={`font-medium text-sm px-4 py-2 rounded-lg transition-colors ${
              activeTab === "upload"
                ? "bg-primary text-white"
                : "text-ink-muted hover:bg-surface-sub hover:text-ink dark:hover:bg-white/5"
            }`}
          >
            <Upload className="inline-block mr-2 h-4 w-4" /> Upload Media File
          </button>
          <button
            onClick={() => setActiveTab("url")}
            className={`font-medium text-sm px-4 py-2 rounded-lg transition-colors ${
              activeTab === "url"
                ? "bg-primary text-white"
                : "text-ink-muted hover:bg-surface-sub hover:text-ink dark:hover:bg-white/5"
            }`}
          >
            <Plus className="inline-block mr-2 h-4 w-4" /> Save External Link
          </button>
        </div>

        {activeTab === "upload" ? (
          <form onSubmit={handleFileUpload} className="space-y-4">
            <div className="rounded-xl border-2 border-dashed border-line p-8 text-center dark:border-white/10 bg-surface-sub/50 dark:bg-white/[0.01]">
              <input
                type="file"
                id="admin-media-file-input"
                accept="image/*"
                onChange={(e) => {
                  const selected = e.target.files?.[0];
                  if (selected) {
                    setFile(selected);
                    if (!uploadName) setUploadName(selected.name.replace(/\.[^/.]+$/, ""));
                  }
                }}
                className="hidden"
              />
              <label
                htmlFor="admin-media-file-input"
                className="cursor-pointer inline-flex flex-col items-center justify-center"
              >
                <Upload className="mb-3 h-10 w-10 text-ink-muted" />
                <span className="text-sm font-semibold text-primary">Click or drag image file to upload</span>
                <span className="mt-1 text-xs text-ink-muted">PNG, JPG, WEBP, GIF, SVG up to 10MB</span>
              </label>
              {file && (
                <div className="mt-4 inline-block rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                  Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-[1fr_auto] items-end">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-ink-muted">Asset Title / Name</span>
                <input
                  type="text"
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  placeholder="e.g. Case Study EHR Banner"
                  className="field !py-2.5 text-sm"
                />
              </label>
              <button
                type="submit"
                disabled={!file || uploading}
                className="btn-primary !py-2.5"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading…
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" /> Upload Image
                  </>
                )}
              </button>
            </div>

            {uploadError && (
              <p role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
                {uploadError}
              </p>
            )}
          </form>
        ) : (
          <div>
            <div className="grid gap-4 sm:grid-cols-[1fr_240px_auto] sm:items-end">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-ink-muted">Image URL</span>
                <input
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); setUrlError(""); }}
                  onKeyDown={(e) => { if (e.key === "Enter") saveUrl(); }}
                  placeholder="https://images.unsplash.com/..."
                  className="field !py-2.5 text-sm"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-ink-muted">Name / Label</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") saveUrl(); }}
                  placeholder="Hospital ward photo"
                  className="field !py-2.5 text-sm"
                />
              </label>
              <button onClick={saveUrl} disabled={saving} className="btn-primary !py-2.5">
                <Plus className="h-4 w-4" /> {saving ? "Saving…" : "Save Link"}
              </button>
            </div>

            {urlError && (
              <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
                {urlError}
              </p>
            )}
          </div>
        )}
      </section>

      {/* Media Grid */}
      {loading ? (
        <p className="py-16 text-center text-sm text-ink-muted">Loading media library…</p>
      ) : assets.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-line py-16 text-center dark:border-white/10">
          <p className="font-medium">No images uploaded or saved yet</p>
          <p className="mt-1.5 text-sm text-ink-muted">Upload an image file or paste an image link above.</p>
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
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <button onClick={() => copyUrl(a)} title="Copy URL" aria-label="Copy link" className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-ink shadow">
                    {copied === a.id ? <Check className="h-4 w-4 text-positive" /> : <Copy className="h-4 w-4" />}
                  </button>
                  <a href={a.url} target="_blank" rel="noopener noreferrer" title="View Image" aria-label="Open image" className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-ink shadow">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <button onClick={() => remove(a)} title="Delete Asset" aria-label="Remove from library" className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-red-600 shadow">
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
