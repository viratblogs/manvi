"use client";

import { useEffect, useState } from "react";
import { Check, Image as ImageIcon, Loader2, Plus, Upload, X } from "lucide-react";
import { getMedia, uploadMediaFile, saveMediaUrl, validateUrl } from "@/lib/services/media.service";
import type { MediaAsset } from "@/types";

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (url: string) => void;
}

export function MediaPickerModal({ isOpen, onClose, onSelectImage }: MediaPickerModalProps) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"library" | "upload" | "url">("library");
  
  // Upload tab state
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // URL tab state
  const [urlInput, setUrlInput] = useState("");
  const [urlNameInput, setUrlNameInput] = useState("");
  const [urlSaving, setUrlSaving] = useState(false);
  const [urlError, setUrlError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getMedia()
        .then(setAssets)
        .catch((err) => console.error("Failed to load media assets:", err))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleFileUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setUploadError("Please select a file first.");
      return;
    }
    setUploadError("");
    setUploading(true);

    try {
      const asset = await uploadMediaFile(file, fileName || undefined);
      setAssets((prev) => [asset, ...prev]);
      onSelectImage(asset.url);
      onClose();
    } catch (err: unknown) {
      console.error("Upload error:", err);
      const msg = err instanceof Error ? err.message : "Failed to upload file.";
      setUploadError(msg);
    } finally {
      setUploading(false);
    }
  }

  async function handleUrlSave(e: React.FormEvent) {
    e.preventDefault();
    const result = validateUrl(urlInput);
    if (!result.ok) {
      setUrlError(result.reason);
      return;
    }
    setUrlError("");
    setUrlSaving(true);

    try {
      const asset = await saveMediaUrl({ url: result.url, name: urlNameInput || "Untitled image" });
      setAssets((prev) => [asset, ...prev]);
      onSelectImage(asset.url);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save URL.";
      setUrlError(msg);
    } finally {
      setUrlSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-2xl border border-line bg-surface shadow-2xl dark:border-white/10 dark:bg-[#0F1520]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-6 py-4 dark:border-white/10">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" />
            <h2 className="font-display text-lg font-semibold">Select or Upload Image</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-surface-sub hover:text-ink dark:hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-line px-6 dark:border-white/10">
          <button
            onClick={() => setTab("library")}
            className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              tab === "library"
                ? "border-primary text-primary"
                : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            Media Library ({assets.length})
          </button>
          <button
            onClick={() => setTab("upload")}
            className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              tab === "upload"
                ? "border-primary text-primary"
                : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            Upload File
          </button>
          <button
            onClick={() => setTab("url")}
            className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              tab === "url"
                ? "border-primary text-primary"
                : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            Add Image URL
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {tab === "library" && (
            <div>
              {loading ? (
                <div className="flex py-16 items-center justify-center text-ink-muted">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading library...
                </div>
              ) : assets.length === 0 ? (
                <div className="py-16 text-center text-ink-muted">
                  <p className="font-medium">No images in your library yet</p>
                  <p className="mt-1 text-sm">Switch to &quot;Upload File&quot; or &quot;Add Image URL&quot; to add one.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {assets.map((asset) => (
                    <button
                      key={asset.id}
                      onClick={() => {
                        onSelectImage(asset.url);
                        onClose();
                      }}
                      className="group relative aspect-square overflow-hidden rounded-xl border border-line bg-surface-sub transition-all hover:border-primary hover:shadow-md dark:border-white/10"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={asset.url}
                        alt={asset.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                        <span className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white">
                          <Check className="h-3.5 w-3.5" /> Select
                        </span>
                      </div>
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-left">
                        <p className="truncate text-xs font-medium text-white">{asset.name}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "upload" && (
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div className="rounded-xl border-2 border-dashed border-line p-8 text-center dark:border-white/10">
                <input
                  type="file"
                  id="media-file-input"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setFile(f);
                      if (!fileName) setFileName(f.name.replace(/\.[^/.]+$/, ""));
                    }
                  }}
                  className="hidden"
                />
                <label
                  htmlFor="media-file-input"
                  className="cursor-pointer inline-flex flex-col items-center justify-center"
                >
                  <Upload className="mb-3 h-10 w-10 text-ink-muted" />
                  <span className="text-sm font-medium text-primary">Click to select an image file</span>
                  <span className="mt-1 text-xs text-ink-muted">JPG, PNG, WEBP, GIF, SVG up to 10MB</span>
                </label>
                {file && (
                  <div className="mt-4 rounded-lg bg-surface-sub px-4 py-2 text-sm font-medium text-ink dark:bg-white/5">
                    Selected file: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-muted mb-1">Image Name (optional)</label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="e.g. Case Study Header Photo"
                  className="field"
                />
              </div>

              {uploadError && (
                <p className="text-sm text-red-600 dark:text-red-400">{uploadError}</p>
              )}

              <button
                type="submit"
                disabled={!file || uploading}
                className="btn-primary w-full"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" /> Upload & Use Image
                  </>
                )}
              </button>
            </form>
          )}

          {tab === "url" && (
            <form onSubmit={handleUrlSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-ink-muted mb-1">Direct Image URL</label>
                <input
                  type="url"
                  required
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="field"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-muted mb-1">Image Name</label>
                <input
                  type="text"
                  value={urlNameInput}
                  onChange={(e) => setUrlNameInput(e.target.value)}
                  placeholder="e.g. Hospital Ward"
                  className="field"
                />
              </div>

              {urlError && (
                <p className="text-sm text-red-600 dark:text-red-400">{urlError}</p>
              )}

              <button
                type="submit"
                disabled={!urlInput || urlSaving}
                className="btn-primary w-full"
              >
                {urlSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" /> Save & Use Image
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
