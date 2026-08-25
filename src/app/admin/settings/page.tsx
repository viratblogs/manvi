"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, ImageIcon, Loader2, Save, Upload } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { MediaPickerModal } from "@/components/admin/MediaPickerModal";
import { getSiteSettings, updateSiteSettings } from "@/lib/services/settings.service";
import { uploadMediaFile } from "@/lib/services/media.service";
import { SafeImage } from "@/components/site/SafeImage";
import type { SiteSettings } from "@/types";

export default function ProfileSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  // Profile Picture File Upload State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    getSiteSettings()
      .then(setSettings)
      .catch((err) => {
        console.error("Failed to load site settings:", err);
        setError("Could not load current settings.");
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleQuickUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setUploadFile(selected);
    setUploading(true);
    setError("");
    setSuccess("");

    try {
      const asset = await uploadMediaFile(selected, "Profile Photo");
      if (settings) {
        setSettings({ ...settings, heroImageUrl: asset.url });
      }
      setSuccess("Image uploaded successfully! Click 'Save Settings' to apply.");
    } catch (err: unknown) {
      console.error("Profile picture upload failed:", err);
      const msg = err instanceof Error ? err.message : "Failed to upload image.";
      setError(msg);
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;

    setBusy(true);
    setError("");
    setSuccess("");

    try {
      const updated = await updateSiteSettings({ heroImageUrl: settings.heroImageUrl });
      setSettings(updated);
      setSuccess("Profile Picture updated successfully! It will now display live on the website homepage and About page.");
    } catch (err: unknown) {
      console.error("Save settings error:", err);
      const msg = err instanceof Error ? err.message : "Failed to save settings.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminShell>
      <div className="max-w-4xl">
        <h1 className="font-display text-2xl font-semibold">Profile Picture &amp; Site Settings</h1>
        <p className="mt-1.5 text-sm text-ink-muted">
          Update your main profile photo displayed across the portfolio homepage and About section.
        </p>

        {error && (
          <div role="alert" className="mt-5 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div role="status" className="mt-5 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900/40 dark:bg-green-950/30 dark:text-green-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-positive" />
            {success}
          </div>
        )}

        {loading ? (
          <div className="py-20 flex justify-center items-center text-ink-muted">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading settings…
          </div>
        ) : (
          <form onSubmit={handleSave} className="mt-7 space-y-6 card">
            <div>
              <h2 className="font-display text-lg font-semibold mb-4 border-b border-line pb-3 dark:border-white/10">
                Homepage Profile Picture
              </h2>

              <div className="grid gap-8 md:grid-cols-[240px_1fr] items-start">
                {/* Profile Picture Live Preview */}
                <div>
                  <span className="block text-xs font-medium text-ink-muted mb-2">Live Preview</span>
                  <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border-2 border-primary/20 bg-surface-sub shadow-md dark:border-white/10">
                    <SafeImage
                      src={settings?.heroImageUrl}
                      fallbackSrc="/m.png"
                      alt="Profile photo preview"
                      fill
                      priority
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Upload & Controls */}
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-medium text-ink-muted mb-1.5">Direct Image URL</label>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={settings?.heroImageUrl || ""}
                        onChange={(e) => setSettings({ ...settings!, heroImageUrl: e.target.value })}
                        placeholder="https://... or upload photo below"
                        className="field flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => setShowMediaPicker(true)}
                        className="btn-ghost shrink-0"
                      >
                        <ImageIcon className="mr-2 h-4 w-4" /> Pick from Media
                      </button>
                    </div>
                  </div>

                  <div className="rounded-xl border border-dashed border-line p-6 bg-surface-sub/50 dark:border-white/10">
                    <span className="block text-sm font-semibold text-ink mb-1">Upload New Profile Photo</span>
                    <span className="block text-xs text-ink-muted mb-4">Select an image file (JPG, PNG, WEBP) to upload directly.</span>

                    <input
                      type="file"
                      id="profile-picture-upload-input"
                      accept="image/*"
                      onChange={handleQuickUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="profile-picture-upload-input"
                      className="btn-primary cursor-pointer inline-flex items-center"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading Photo…
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" /> Upload File from Device
                        </>
                      )}
                    </label>
                    {uploadFile && (
                      <p className="mt-2 text-xs font-medium text-primary">Selected: {uploadFile.name}</p>
                    )}
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button type="submit" disabled={busy} className="btn-primary">
                      {busy ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving Settings…
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" /> Save Profile Picture
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>

      <MediaPickerModal
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelectImage={(url) => {
          if (settings) setSettings({ ...settings, heroImageUrl: url });
        }}
      />
    </AdminShell>
  );
}
