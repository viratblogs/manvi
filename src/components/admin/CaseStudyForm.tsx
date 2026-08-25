"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImageIcon, Plus, Trash2, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { MediaPickerModal } from "./MediaPickerModal";
import type { FirestoreCaseStudy, CaseStudyResult } from "@/types";

interface CaseStudyFormProps {
  initialData?: FirestoreCaseStudy;
  onSave: (data: Partial<FirestoreCaseStudy>) => Promise<void | string>;
  isNew?: boolean;
}

export function CaseStudyForm({ initialData, onSave, isNew = false }: CaseStudyFormProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  // Form State
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [index, setIndex] = useState(initialData?.index || "01");
  const [summary, setSummary] = useState(initialData?.summary || "");
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || "");
  const [context, setContext] = useState(initialData?.context || "");
  const [situation, setSituation] = useState(initialData?.situation || "");
  const [task, setTask] = useState(initialData?.task || "");

  // Dynamic Action items array
  const [actions, setActions] = useState<string[]>(
    initialData?.action && initialData.action.length > 0
      ? initialData.action
      : [""]
  );

  // Dynamic Results array
  const [results, setResults] = useState<CaseStudyResult[]>(
    initialData?.results && initialData.results.length > 0
      ? initialData.results
      : [{ value: "", label: "", note: "" }]
  );

  // Dynamic Takeaways array
  const [takeaways, setTakeaways] = useState<string[]>(
    initialData?.takeaways && initialData.takeaways.length > 0
      ? initialData.takeaways
      : [""]
  );

  // Auto-generate slug from title
  function handleTitleChange(val: string) {
    setTitle(val);
    if (isNew && !slug) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
      );
    }
  }

  // Action Items Helper
  function addAction() {
    setActions([...actions, ""]);
  }
  function updateAction(idx: number, val: string) {
    const copy = [...actions];
    copy[idx] = val;
    setActions(copy);
  }
  function removeAction(idx: number) {
    setActions(actions.filter((_, i) => i !== idx));
  }

  // Results Helper
  function addResult() {
    setResults([...results, { value: "", label: "", note: "" }]);
  }
  function updateResult(idx: number, field: keyof CaseStudyResult, val: string) {
    const copy = [...results];
    copy[idx] = { ...copy[idx], [field]: val };
    setResults(copy);
  }
  function removeResult(idx: number) {
    setResults(results.filter((_, i) => i !== idx));
  }

  // Takeaways Helper
  function addTakeaway() {
    setTakeaways([...takeaways, ""]);
  }
  function updateTakeaway(idx: number, val: string) {
    const copy = [...takeaways];
    copy[idx] = val;
    setTakeaways(copy);
  }
  function removeTakeaway(idx: number) {
    setTakeaways(takeaways.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!slug.trim()) {
      setError("Slug is required.");
      return;
    }

    setError("");
    setBusy(true);

    try {
      await onSave({
        title,
        slug,
        index,
        summary,
        coverImage,
        context,
        situation,
        task,
        action: actions.filter((a) => a.trim().length > 0),
        results: results.filter((r) => r.value.trim().length > 0 || r.label.trim().length > 0),
        takeaways: takeaways.filter((t) => t.trim().length > 0),
      });
      router.push("/admin/case-studies");
    } catch (err: unknown) {
      console.error("Save case study error:", err);
      const msg = err instanceof Error ? err.message : "Failed to save case study.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl pb-16">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/case-studies"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-ink-muted transition-colors hover:bg-surface-sub hover:text-ink dark:border-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="font-display text-2xl font-semibold">
            {isNew ? "New Case Study" : `Edit Case Study: ${initialData?.title}`}
          </h1>
        </div>
        <button type="submit" disabled={busy} className="btn-primary">
          {busy ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> Save Case Study
            </>
          )}
        </button>
      </div>

      {error && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Card 1: Overview & Meta */}
      <section className="card space-y-5">
        <h2 className="font-display text-lg font-semibold border-b border-line pb-3 dark:border-white/10">
          Overview &amp; Identification
        </h2>

        <div className="grid gap-5 sm:grid-cols-12">
          <div className="sm:col-span-3">
            <label className="block text-xs font-medium text-ink-muted mb-1.5">Index Number</label>
            <input
              type="text"
              value={index}
              onChange={(e) => setIndex(e.target.value)}
              placeholder="e.g. 01"
              className="field"
            />
          </div>
          <div className="sm:col-span-9">
            <label className="block text-xs font-medium text-ink-muted mb-1.5">Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Digital health transformation and EHR implementation"
              className="field"
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-ink-muted mb-1.5">URL Slug *</label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="ehr-implementation"
              className="field"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-muted mb-1.5">Context Badge / Tag</label>
            <input
              type="text"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="e.g. 300-bed hospital · 9-month engagement"
              className="field"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-ink-muted mb-1.5">Executive Summary</label>
          <textarea
            rows={3}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="A short overview explaining the baseline challenge and high-level outcome..."
            className="field"
          />
        </div>

        {/* Cover Image Selector */}
        <div>
          <label className="block text-xs font-medium text-ink-muted mb-1.5">Cover Image</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://... or select from Media Library"
              className="field flex-1"
            />
            <button
              type="button"
              onClick={() => setShowMediaPicker(true)}
              className="btn-ghost shrink-0"
            >
              <ImageIcon className="mr-2 h-4 w-4" /> Select / Upload Image
            </button>
          </div>
          {coverImage && (
            <div className="mt-3 relative aspect-video max-w-md overflow-hidden rounded-xl border border-line bg-surface-sub dark:border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverImage} alt="Cover Preview" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => setCoverImage("")}
                className="absolute top-2 right-2 rounded-lg bg-black/60 p-1.5 text-white hover:bg-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Card 2: STAR Framework — Situation & Task */}
      <section className="card space-y-5">
        <h2 className="font-display text-lg font-semibold border-b border-line pb-3 dark:border-white/10">
          Situation &amp; Task
        </h2>
        <div>
          <label className="block text-xs font-medium text-ink-muted mb-1.5">Situation</label>
          <textarea
            rows={4}
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            placeholder="Detailed description of the initial problem, legacy processes, operational friction..."
            className="field"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-ink-muted mb-1.5">Task / Objective</label>
          <textarea
            rows={4}
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="The core objective or assignment given to turn around the situation..."
            className="field"
          />
        </div>
      </section>

      {/* Card 3: Action / Approach Steps */}
      <section className="card space-y-5">
        <div className="flex items-center justify-between border-b border-line pb-3 dark:border-white/10">
          <h2 className="font-display text-lg font-semibold">Approach &amp; Action Steps</h2>
          <button type="button" onClick={addAction} className="btn-ghost !py-1.5 !text-xs">
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Step
          </button>
        </div>

        <div className="space-y-3">
          {actions.map((act, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="mt-2.5 font-mono text-xs text-ink-muted shrink-0 w-6">
                {String(i + 1).padStart(2, "0")}
              </span>
              <textarea
                rows={2}
                value={act}
                onChange={(e) => updateAction(i, e.target.value)}
                placeholder="Describe action taken..."
                className="field flex-1"
              />
              {actions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeAction(i)}
                  className="mt-2 text-ink-muted hover:text-red-600 p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Card 4: Quantified Results */}
      <section className="card space-y-5">
        <div className="flex items-center justify-between border-b border-line pb-3 dark:border-white/10">
          <h2 className="font-display text-lg font-semibold">Quantified Results / Metrics</h2>
          <button type="button" onClick={addResult} className="btn-ghost !py-1.5 !text-xs">
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Metric
          </button>
        </div>

        <div className="space-y-4">
          {results.map((res, i) => (
            <div key={i} className="rounded-lg border border-line p-4 space-y-3 dark:border-white/10 bg-surface-sub/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-ink-muted uppercase">Metric #{i + 1}</span>
                {results.length > 1 && (
                  <button type="button" onClick={() => removeResult(i)} className="text-red-600 hover:opacity-80 text-xs flex items-center">
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                  </button>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs text-ink-muted mb-1">Value (e.g. 32%)</label>
                  <input
                    type="text"
                    value={res.value}
                    onChange={(e) => updateResult(i, "value", e.target.value)}
                    placeholder="32%"
                    className="field"
                  />
                </div>
                <div>
                  <label className="block text-xs text-ink-muted mb-1">Label (e.g. Registration time)</label>
                  <input
                    type="text"
                    value={res.label}
                    onChange={(e) => updateResult(i, "label", e.target.value)}
                    placeholder="Registration time"
                    className="field"
                  />
                </div>
                <div>
                  <label className="block text-xs text-ink-muted mb-1">Note (e.g. 14 min to 9.5 min avg)</label>
                  <input
                    type="text"
                    value={res.note}
                    onChange={(e) => updateResult(i, "note", e.target.value)}
                    placeholder="14 min to 9.5 min average"
                    className="field"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Card 5: Key Takeaways */}
      <section className="card space-y-5">
        <div className="flex items-center justify-between border-b border-line pb-3 dark:border-white/10">
          <h2 className="font-display text-lg font-semibold">Key Takeaways</h2>
          <button type="button" onClick={addTakeaway} className="btn-ghost !py-1.5 !text-xs">
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Takeaway
          </button>
        </div>

        <div className="space-y-3">
          {takeaways.map((take, i) => (
            <div key={i} className="flex items-center gap-3">
              <input
                type="text"
                value={take}
                onChange={(e) => updateTakeaway(i, e.target.value)}
                placeholder="Key insight or principle learned..."
                className="field flex-1"
              />
              {takeaways.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTakeaway(i)}
                  className="text-ink-muted hover:text-red-600 p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-end gap-3 pt-4">
        <Link href="/admin/case-studies" className="btn-ghost">
          Cancel
        </Link>
        <button type="submit" disabled={busy} className="btn-primary">
          {busy ? "Saving…" : "Save Case Study"}
        </button>
      </div>

      {/* Image Picker Modal */}
      <MediaPickerModal
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelectImage={(url) => setCoverImage(url)}
      />
    </form>
  );
}
