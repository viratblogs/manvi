"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { Editor } from "./Editor";
import { createBlog, deleteBlog, updateBlog } from "@/lib/blogs";
import { validateUrl } from "@/lib/media";
import { categories, profile } from "@/lib/content";
import { readingTime, slugify } from "@/lib/utils";
import type { Blog, BlogStatus } from "@/types";

const empty: Partial<Blog> = {
  title: "", slug: "", excerpt: "", content: "", featuredImage: "",
  author: profile.name, category: categories[0], tags: [], status: "draft",
  seoTitle: "", seoDescription: "", keywords: [], canonicalUrl: "", ogImage: "",
};

export function BlogForm({ existing }: { existing?: Blog }) {
  const router = useRouter();
  const [form, setForm] = useState<Partial<Blog>>(existing ?? empty);
  const [tagsText, setTagsText] = useState((existing?.tags ?? []).join(", "));
  const [keywordsText, setKeywordsText] = useState((existing?.keywords ?? []).join(", "));
  const [slugTouched, setSlugTouched] = useState(!!existing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Slug auto-follows the title until the author edits it themselves.
  useEffect(() => {
    if (!slugTouched && form.title) set("slug", slugify(form.title));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.title, slugTouched]);

  function set<K extends keyof Blog>(key: K, value: Blog[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save(status: BlogStatus) {
    setError("");
    if (!form.title?.trim()) { setError("Add a title before saving."); return; }
    if (!form.slug?.trim()) { setError("Add a URL slug before saving."); return; }

    setSaving(true);
    const payload: Partial<Blog> = {
      ...form,
      status,
      tags: tagsText.split(",").map((t) => t.trim()).filter(Boolean),
      keywords: keywordsText.split(",").map((k) => k.trim()).filter(Boolean),
      readingTime: readingTime(form.content ?? ""),
      seoTitle: form.seoTitle || form.title,
      seoDescription: form.seoDescription || form.excerpt || "",
      ogImage: form.ogImage || form.featuredImage || "",
    };

    try {
      if (existing) await updateBlog(existing.id, payload);
      else await createBlog(payload);
      router.push("/admin/blogs");
      router.refresh();
    } catch {
      setError("Save failed. Confirm your Firestore rules allow this admin UID to write.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!existing) return;
    if (!confirm(`Delete "${existing.title}"? This can't be undone.`)) return;
    await deleteBlog(existing.id);
    router.push("/admin/blogs");
  }

  return (
    <div>
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <Link href="/admin/blogs" className="inline-flex items-center gap-2 text-sm text-ink-muted transition-colors hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> All posts
        </Link>
        <div className="flex flex-wrap gap-3">
          {existing && (
            <button onClick={remove} className="btn-ghost !text-red-600 hover:!border-red-300">
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          )}
          <button onClick={() => save("draft")} disabled={saving} className="btn-ghost">
            Save draft
          </button>
          <button onClick={() => save("published")} disabled={saving} className="btn-primary">
            <Save className="h-4 w-4" /> {saving ? "Saving…" : "Publish"}
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="grid gap-7 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <input
            value={form.title ?? ""}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Post title"
            className="w-full border-0 bg-transparent p-0 font-display text-3xl font-semibold tracking-tight placeholder:text-ink-faint focus:outline-none focus:ring-0"
          />

          <textarea
            value={form.excerpt ?? ""}
            onChange={(e) => set("excerpt", e.target.value)}
            rows={2}
            placeholder="Short description shown on cards and in search results"
            className="field resize-none"
          />

          <Editor value={form.content ?? ""} onChange={(html) => set("content", html)} />
        </div>

        <aside className="space-y-5">
          <Panel title="Publishing">
            <Field label="URL slug">
              <input
                value={form.slug ?? ""}
                onChange={(e) => { setSlugTouched(true); set("slug", slugify(e.target.value)); }}
                className="field !py-2 font-mono text-xs"
              />
              <span className="mt-1.5 block text-xs text-ink-muted">/blog/{form.slug || "…"}</span>
            </Field>
            <Field label="Category">
              <select value={form.category} onChange={(e) => set("category", e.target.value)} className="field !py-2">
                {categories.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Author">
              <input value={form.author ?? ""} onChange={(e) => set("author", e.target.value)} className="field !py-2" />
            </Field>
            <Field label="Tags">
              <input
                value={tagsText} onChange={(e) => setTagsText(e.target.value)}
                placeholder="comma, separated" className="field !py-2"
              />
            </Field>
            <p className="text-xs text-ink-muted">
              Reading time is calculated automatically: {readingTime(form.content ?? "")} min.
            </p>
          </Panel>

          <Panel title="Featured image">
            {form.featuredImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.featuredImage}
                alt=""
                onError={(e) => { e.currentTarget.style.opacity = "0.25"; }}
                className="aspect-[16/10] w-full rounded-lg border border-line object-cover dark:border-white/10"
              />
            ) : (
              <div className="flex aspect-[16/10] items-center justify-center rounded-lg border border-dashed border-line text-center text-xs text-ink-muted dark:border-white/10">
                Paste a link below to preview
              </div>
            )}
            <Field label="Image link">
              <input
                value={form.featuredImage ?? ""}
                onChange={(e) => set("featuredImage", e.target.value.trim())}
                onBlur={(e) => {
                  if (!e.target.value) return;
                  const result = validateUrl(e.target.value);
                  if (!result.ok) setError(result.reason);
                }}
                placeholder="https://res.cloudinary.com/..."
                className="field !py-2 text-xs"
              />
            </Field>
            <p className="text-xs text-ink-muted">
              Upload to Cloudinary or ImgBB, then paste the link here. Saved links are on the
              Media page.
            </p>
            {form.featuredImage && (
              <button onClick={() => set("featuredImage", "")} className="text-xs text-red-600">
                Clear image
              </button>
            )}
          </Panel>

          <Panel title="SEO">
            <Field label="Meta title">
              <input value={form.seoTitle ?? ""} onChange={(e) => set("seoTitle", e.target.value)} placeholder="Defaults to the post title" className="field !py-2" />
            </Field>
            <Field label="Meta description">
              <textarea value={form.seoDescription ?? ""} onChange={(e) => set("seoDescription", e.target.value)} rows={3} placeholder="Defaults to the excerpt" className="field resize-none !py-2" />
            </Field>
            <Field label="Keywords">
              <input value={keywordsText} onChange={(e) => setKeywordsText(e.target.value)} placeholder="comma, separated" className="field !py-2" />
            </Field>
            <Field label="Canonical URL">
              <input value={form.canonicalUrl ?? ""} onChange={(e) => set("canonicalUrl", e.target.value)} placeholder="Only if republished elsewhere" className="field !py-2" />
            </Field>
          </Panel>
        </aside>
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card !p-5">
      <h2 className="measure mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-ink-muted">{label}</span>
      {children}
    </label>
  );
}
