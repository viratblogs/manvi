"use client";

import { useState } from "react";
import { ImageIcon, Loader2, Save, Trash2, X } from "lucide-react";
import { MediaPickerModal } from "./MediaPickerModal";
import type { Achievement, AchievementCategory } from "@/types";

interface AchievementFormProps {
  initialData?: Achievement | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Achievement>) => Promise<void | string>;
}

const CATEGORIES: AchievementCategory[] = ["Certification", "Award", "Recognition", "Academic"];

export function AchievementForm({ initialData, isOpen, onClose, onSave }: AchievementFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [organisation, setOrganisation] = useState(initialData?.organisation || "");
  const [year, setYear] = useState<number>(initialData?.year || new Date().getFullYear());
  const [category, setCategory] = useState<AchievementCategory>(initialData?.category || "Certification");
  const [description, setDescription] = useState(initialData?.description || "");
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "");
  const [credentialUrl, setCredentialUrl] = useState(initialData?.credentialUrl || "");
  
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!organisation.trim()) {
      setError("Organisation is required.");
      return;
    }

    setError("");
    setBusy(true);

    try {
      await onSave({
        title,
        organisation,
        year: Number(year),
        category,
        description,
        imageUrl,
        credentialUrl,
      });
      onClose();
    } catch (err: unknown) {
      console.error("Achievement save error:", err);
      const msg = err instanceof Error ? err.message : "Failed to save achievement.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-line bg-surface shadow-2xl dark:border-white/10 dark:bg-[#0F1520]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-6 py-4 dark:border-white/10">
          <h2 className="font-display text-lg font-semibold">
            {initialData ? "Edit Certification / Achievement" : "Add Certification / Achievement"}
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-surface-sub hover:text-ink dark:hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-ink-muted mb-1">Title / Certification Name *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. NABH Hospital Accreditation & Quality Management"
              className="field"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-ink-muted mb-1">Issuing Organisation *</label>
              <input
                type="text"
                required
                value={organisation}
                onChange={(e) => setOrganisation(e.target.value)}
                placeholder="e.g. Symbiosis Institute of Health Sciences"
                className="field"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-muted mb-1">Year</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="field"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-muted mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as AchievementCategory)}
              className="field"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-muted mb-1">Description / Key Highlights</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of skills, modules covered, or recognition criteria..."
              className="field"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-muted mb-1">Credential URL (optional link)</label>
            <input
              type="url"
              value={credentialUrl}
              onChange={(e) => setCredentialUrl(e.target.value)}
              placeholder="https://coursera.org/verify/... or certificate link"
              className="field"
            />
          </div>

          {/* Certificate Image */}
          <div>
            <label className="block text-xs font-medium text-ink-muted mb-1">Certificate Image / Badge</label>
            <div className="flex gap-3">
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Image URL or upload certificate..."
                className="field flex-1"
              />
              <button
                type="button"
                onClick={() => setShowMediaPicker(true)}
                className="btn-ghost shrink-0"
              >
                <ImageIcon className="mr-2 h-4 w-4" /> Upload / Select
              </button>
            </div>
            {imageUrl && (
              <div className="mt-3 relative aspect-video max-w-xs overflow-hidden rounded-xl border border-line bg-surface-sub dark:border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="Badge preview" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="absolute top-2 right-2 rounded-lg bg-black/60 p-1 text-white hover:bg-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-line dark:border-white/10">
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancel
            </button>
            <button type="submit" disabled={busy} className="btn-primary">
              {busy ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Save Achievement
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <MediaPickerModal
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelectImage={(url) => setImageUrl(url)}
      />
    </div>
  );
}
