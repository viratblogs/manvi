"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, ImageIcon, Loader2, Plus, Save, Trash2, Upload, Sparkles, Tag, Milestone, User, FolderPlus } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { MediaPickerModal } from "@/components/admin/MediaPickerModal";
import { getSiteSettings, updateSiteSettings, DEFAULT_SETTINGS, DEFAULT_COMPETENCIES_GROUPS } from "@/lib/services/settings.service";
import { uploadMediaFile } from "@/lib/services/media.service";
import { SafeImage } from "@/components/site/SafeImage";
import type { SiteSettings, CompetencyGroup } from "@/types";

export default function ProfileSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  // Core Competencies tag generator local input state
  const [newSkillInput, setNewSkillInput] = useState("");
  // Subcategory skill inputs
  const [groupSkillInputs, setGroupSkillInputs] = useState<Record<string, string>>({});

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
          competenciesGroups: data.competenciesGroups && data.competenciesGroups.length > 0 ? data.competenciesGroups : DEFAULT_COMPETENCIES_GROUPS,
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
      setSuccess("Image uploaded successfully! Click 'Save All Sections' below to apply.");
    } catch (err: unknown) {
      console.error("Profile picture upload failed:", err);
      const msg = err instanceof Error ? err.message : "Failed to upload image.";
      setError(msg);
    } finally {
      setUploading(false);
    }
  }

  // Key Skills Tag Generator Functions (Top Level)
  async function handleAddSkill() {
    const trimmed = newSkillInput.trim();
    if (!trimmed || !settings) return;
    const currentSkills = settings.skills || [];
    if (currentSkills.includes(trimmed)) {
      setNewSkillInput("");
      return;
    }
    const updatedSkills = [...currentSkills, trimmed];
    const newSettings = {
      ...settings,
      skills: updatedSkills,
    };
    setSettings(newSettings);
    setNewSkillInput("");

    try {
      const updated = await updateSiteSettings(newSettings);
      setSettings((prev) => ({ ...prev, ...updated }));
      router.refresh();
      setSuccess(`Added skill "${trimmed}" and updated website live!`);
    } catch (err) {
      console.error("Auto-save skill error:", err);
    }
  }

  async function handleRemoveSkill(skillToRemove: string) {
    if (!settings) return;
    const currentSkills = settings.skills || [];
    const updatedSkills = currentSkills.filter((s) => s !== skillToRemove);
    const newSettings = {
      ...settings,
      skills: updatedSkills,
    };
    setSettings(newSettings);

    try {
      const updated = await updateSiteSettings(newSettings);
      setSettings((prev) => ({ ...prev, ...updated }));
      router.refresh();
      setSuccess(`Removed skill "${skillToRemove}" and updated website live!`);
    } catch (err) {
      console.error("Auto-save remove skill error:", err);
    }
  }

  // Subcategory Skill Badges Functions (Strategy, Operations, Analytics, Technology, Quality & Risk, Change)
  async function handleAddGroupSkill(groupName: string) {
    const inputVal = (groupSkillInputs[groupName] || "").trim();
    if (!inputVal || !settings) return;

    const currentGroups: CompetencyGroup[] = settings.competenciesGroups && settings.competenciesGroups.length > 0
      ? JSON.parse(JSON.stringify(settings.competenciesGroups))
      : JSON.parse(JSON.stringify(DEFAULT_COMPETENCIES_GROUPS));

    const groupIdx = currentGroups.findIndex((g) => g.group.toLowerCase() === groupName.toLowerCase());
    if (groupIdx !== -1) {
      if (!currentGroups[groupIdx].items.includes(inputVal)) {
        currentGroups[groupIdx].items.push(inputVal);
      }
    } else {
      currentGroups.push({ group: groupName, items: [inputVal] });
    }

    const newSettings = { ...settings, competenciesGroups: currentGroups };
    setSettings(newSettings);
    setGroupSkillInputs((prev) => ({ ...prev, [groupName]: "" }));

    try {
      const updated = await updateSiteSettings(newSettings);
      setSettings((prev) => ({ ...prev, ...updated }));
      router.refresh();
      setSuccess(`Added "${inputVal}" to ${groupName} and updated website live!`);
    } catch (err) {
      console.error("Auto-save group skill error:", err);
    }
  }

  async function handleRemoveGroupSkill(groupName: string, itemToRemove: string) {
    if (!settings) return;

    const currentGroups: CompetencyGroup[] = settings.competenciesGroups && settings.competenciesGroups.length > 0
      ? JSON.parse(JSON.stringify(settings.competenciesGroups))
      : JSON.parse(JSON.stringify(DEFAULT_COMPETENCIES_GROUPS));

    const groupIdx = currentGroups.findIndex((g) => g.group.toLowerCase() === groupName.toLowerCase());
    if (groupIdx !== -1) {
      currentGroups[groupIdx].items = currentGroups[groupIdx].items.filter((item) => item !== itemToRemove);
    }

    const newSettings = { ...settings, competenciesGroups: currentGroups };
    setSettings(newSettings);

    try {
      const updated = await updateSiteSettings(newSettings);
      setSettings((prev) => ({ ...prev, ...updated }));
      router.refresh();
      setSuccess(`Removed "${itemToRemove}" from ${groupName} and updated website live!`);
    } catch (err) {
      console.error("Auto-save remove group skill error:", err);
    }
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
        competenciesGroups: settings.competenciesGroups,
        professionalJourney: settings.professionalJourney,
      });
      setSettings((prev) => ({ ...prev, ...updated }));
      router.refresh();
      setSuccess("Site sections updated successfully! Your changes are now live across the homepage and website.");
    } catch (err: unknown) {
      console.error("Save settings error:", err);
      const msg = err instanceof Error ? err.message : "Failed to save settings.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  // Active Subcategories list
  const activeCompetenciesGroups = settings?.competenciesGroups && settings.competenciesGroups.length > 0
    ? settings.competenciesGroups
    : DEFAULT_COMPETENCIES_GROUPS;

  return (
    <AdminShell>
      <div className="max-w-4xl pb-16">
        <div>
          <h1 className="font-display text-2xl font-semibold">Site Content &amp; Profile Settings</h1>
          <p className="mt-1.5 text-sm text-ink-muted">
            Manage your Executive Snapshot bio statement, Core Competencies subcategories, Professional Journey, and homepage profile photo.
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

            {/* TASK 2: Core Competencies (Key Skills + 6 Subcategories) */}
            <div className="card">
              <div className="flex items-center gap-3 border-b border-line pb-4 mb-6 dark:border-white/10">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Tag className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-semibold">Task 2: Core Competencies</h2>
                  <p className="text-xs text-ink-muted">Manage Key Skills badges and individual subcategories (Strategy, Operations, Analytics, Technology, Quality &amp; Risk, Change).</p>
                </div>
              </div>

              {/* 1. Top Level Key Skills */}
              <div className="mb-8 border-b border-line pb-8 dark:border-white/10">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">Top-Level Key Skills</h3>
                <div className="flex gap-3 mb-4">
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
                    placeholder="Add top-level skill tag (e.g., Hospital Operations, Agile Management)..."
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
                    <span className="text-xs text-ink-muted italic">No top-level skill tags added yet.</span>
                  )}
                </div>
              </div>

              {/* 2. Grouped Subcategories Editor */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-primary mb-5 flex items-center gap-2">
                  <FolderPlus className="h-4 w-4" /> Competency Subcategories Manager
                </h3>

                <div className="grid gap-6 sm:grid-cols-2">
                  {activeCompetenciesGroups.map((group) => (
                    <div key={group.group} className="rounded-xl border border-line p-4 bg-surface dark:border-white/10">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-display font-semibold text-sm uppercase tracking-wide text-ink dark:text-white">
                          {group.group}
                        </span>
                        <span className="text-[0.625rem] font-mono text-ink-muted bg-surface-sub px-2 py-0.5 rounded-md">
                          {group.items.length} skills
                        </span>
                      </div>

                      {/* Input for this group */}
                      <div className="flex gap-2 mb-3">
                        <input
                          type="text"
                          value={groupSkillInputs[group.group] || ""}
                          onChange={(e) => setGroupSkillInputs({ ...groupSkillInputs, [group.group]: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddGroupSkill(group.group);
                            }
                          }}
                          placeholder={`Add ${group.group} skill...`}
                          className="field flex-1 text-xs py-1.5"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddGroupSkill(group.group)}
                          className="btn-primary shrink-0 text-xs px-3 py-1.5"
                        >
                          Add
                        </button>
                      </div>

                      {/* Items inside this group */}
                      <div className="flex flex-wrap gap-1.5">
                        {group.items.map((item) => (
                          <span
                            key={item}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface-sub px-2.5 py-1 text-xs text-ink dark:border-white/10 dark:text-white"
                          >
                            {item}
                            <button
                              type="button"
                              onClick={() => handleRemoveGroupSkill(group.group, item)}
                              className="text-ink-muted hover:text-red-500 transition-colors"
                              title={`Remove ${item}`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
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
