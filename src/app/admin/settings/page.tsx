"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, ImageIcon, Loader2, Plus, Save, Trash2, Upload, Sparkles, Tag, Milestone, User } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { MediaPickerModal } from "@/components/admin/MediaPickerModal";
import { getSiteSettings, updateSiteSettings, DEFAULT_SETTINGS } from "@/lib/services/settings.service";
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

  // Core Competencies tag generator local input state
  const [newSkillInput, setNewSkillInput] = useState("");

  // Profile Picture File Upload State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    getSiteSettings()
      .then((data) => {
        setSettings({
          ...DEFAULT_SETTINGS,
          ...data,
          skills: data.skills && data.skills.length > 0 ? data.skills : DEFAULT_SETTINGS.skills,
          bioStatement: data.bioStatement || DEFAULT_SETTINGS.bioStatement,
          professionalJourney: data.professionalJourney || DEFAULT_SETTINGS.professionalJourney,
        });
      })
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
      setSuccess("Image uploaded successfully! Click 'Save All Changes' below to apply.");
    } catch (err: unknown) {
      console.error("Profile picture upload failed:", err);
      const msg = err instanceof Error ? err.message : "Failed to upload image.";
      setError(msg);
    } finally {
      setUploading(false);
    }
  }

  // Tag Generator Functions (Task 2)
  function handleAddSkill() {
    const trimmed = newSkillInput.trim();
    if (!trimmed || !settings) return;
    const currentSkills = settings.skills || [];
    if (currentSkills.includes(trimmed)) {
      setNewSkillInput("");
      return;
    }
    setSettings({
      ...settings,
      skills: [...currentSkills, trimmed],
    });
    setNewSkillInput("");
  }

  function handleRemoveSkill(skillToRemove: string) {
    if (!settings) return;
    const currentSkills = settings.skills || [];
    setSettings({
      ...settings,
      skills: currentSkills.filter((s) => s !== skillToRemove),
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;

    setBusy(true);
    setError("");
    setSuccess("");

    try {
      const updated = await updateSiteSettings({
        heroImageUrl: settings.heroImageUrl,
        bioStatement: settings.bioStatement,
        skills: settings.skills,
        professionalJourney: settings.professionalJourney,
      });
      setSettings((prev) => ({ ...prev, ...updated }));
      setSuccess("Site sections updated successfully! Your changes are now live across the homepage and website.");
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
      <div className="max-w-4xl pb-16">
        <div>
          <h1 className="font-display text-2xl font-semibold">Site Content &amp; Profile Settings</h1>
          <p className="mt-1.5 text-sm text-ink-muted">
            Manage your Executive Snapshot bio statement, Core Competencies skill tags, Professional Journey, and homepage profile photo.
          </p>
        </div>

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
          <form onSubmit={handleSave} className="mt-7 space-y-8">
            {/* TASK 1: Executive Snapshot */}
            <div className="card">
              <div className="flex items-center gap-3 border-b border-line pb-4 mb-6 dark:border-white/10">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-semibold">Task 1: Executive Snapshot</h2>
                  <p className="text-xs text-ink-muted">High-impact 1-2 sentence bio statement displayed prominently as your primary elevator pitch.</p>
                </div>
              </div>

              <div>
                <label htmlFor="bio-statement" className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">
                  Executive Bio Statement (Elevator Pitch)
                </label>
                <textarea
                  id="bio-statement"
                  rows={3}
                  value={settings?.bioStatement || ""}
                  onChange={(e) => setSettings({ ...settings!, bioStatement: e.target.value })}
                  placeholder="e.g., Bridging healthcare excellence, strategic leadership, and data-driven decision making..."
                  className="field w-full leading-relaxed"
                />
                <p className="mt-2 text-xs text-ink-muted">
                  Tip: Keep this concise (1-2 sentences) and punchy for maximum visual impact on the homepage.
                </p>
              </div>
            </div>

            {/* TASK 2: Core Competencies */}
            <div className="card">
              <div className="flex items-center gap-3 border-b border-line pb-4 mb-6 dark:border-white/10">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Tag className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-semibold">Task 2: Core Competencies</h2>
                  <p className="text-xs text-ink-muted">Dynamic tag generator to add, edit, and delete individual professional skill tags.</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">
                  Add New Skill Tag
                </label>
                <div className="flex gap-3 mb-5">
                  <input
                    type="text"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    placeholder="e.g., Hospital Operations, Agile Management, Market Research..."
                    className="field flex-1"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="btn-primary shrink-0 inline-flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" /> Add Tag
                  </button>
                </div>

                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-3">
                  Current Skills ({settings?.skills?.length || 0})
                </label>
                <div className="flex flex-wrap gap-2.5 rounded-xl border border-line p-4 bg-surface-sub/50 dark:border-white/10">
                  {settings?.skills && settings.skills.length > 0 ? (
                    settings.skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1.5 text-xs font-medium text-primary shadow-xs dark:border-white/10 dark:text-white"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="rounded-full p-0.5 hover:bg-primary/20 text-primary hover:text-red-500 transition-colors"
                          title={`Remove ${skill}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-ink-muted italic">No skill tags added yet. Use the input above to add your skills.</span>
                  )}
                </div>
              </div>
            </div>

            {/* TASK 3: Professional Journey */}
            <div className="card">
              <div className="flex items-center gap-3 border-b border-line pb-4 mb-6 dark:border-white/10">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Milestone className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-semibold">Task 3: Professional Journey</h2>
                  <p className="text-xs text-ink-muted">Career narrative, timeline milestones, and background stories formatted with line breaks or paragraphs.</p>
                </div>
              </div>

              <div>
                <label htmlFor="professional-journey" className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">
                  Chronological Narrative &amp; Milestones
                </label>
                <textarea
                  id="professional-journey"
                  rows={8}
                  value={settings?.professionalJourney || ""}
                  onChange={(e) => setSettings({ ...settings!, professionalJourney: e.target.value })}
                  placeholder="Format with timeline entries (e.g. 2025 - 2027 | Title) or structured paragraphs..."
                  className="field w-full leading-relaxed font-mono text-xs"
                />
                <p className="mt-2 text-xs text-ink-muted">
                  Tip: Separate distinct milestones or paragraphs with a blank line. Use line breaks or structured blocks for clear timeline rendering.
                </p>
              </div>
            </div>

            {/* Homepage Profile Picture */}
            <div className="card">
              <div className="flex items-center gap-3 border-b border-line pb-4 mb-6 dark:border-white/10">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-semibold">Homepage Profile Picture</h2>
                  <p className="text-xs text-ink-muted">Update your main hero profile photo.</p>
                </div>
              </div>

              <div className="grid gap-8 md:grid-cols-[200px_1fr] items-start">
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
                        <ImageIcon className="mr-2 h-4 w-4" /> Media Library
                      </button>
                    </div>
                  </div>

                  <div className="rounded-xl border border-dashed border-line p-5 bg-surface-sub/50 dark:border-white/10">
                    <span className="block text-sm font-semibold text-ink mb-1">Upload New Profile Photo</span>
                    <span className="block text-xs text-ink-muted mb-3">Select an image file (JPG, PNG, WEBP) from your device.</span>

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
                          <Upload className="mr-2 h-4 w-4" /> Upload File
                        </>
                      )}
                    </label>
                    {uploadFile && (
                      <p className="mt-2 text-xs font-medium text-primary">Selected: {uploadFile.name}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button Bar */}
            <div className="sticky bottom-6 z-20 flex justify-end rounded-2xl border border-line bg-surface/90 p-4 backdrop-blur-md shadow-lg dark:border-white/10 dark:bg-[#0F1520]/90">
              <button type="submit" disabled={busy} className="btn-primary px-6 py-2.5 text-sm font-semibold">
                {busy ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving All Changes…
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save All Sections
                  </>
                )}
              </button>
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
