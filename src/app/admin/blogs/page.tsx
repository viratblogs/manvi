"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatusPill } from "@/components/admin/StatusPill";
import { deleteBlog, getAllBlogs } from "@/lib/blogs";
import { categories } from "@/lib/content";
import { formatShortDate } from "@/lib/utils";
import type { Blog } from "@/types";

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    getAllBlogs()
      .then(setBlogs)
      .catch((err) => {
        console.error("[AdminBlogsPage] Failed to load blogs:", err);
        setFetchError(
          "Could not load posts. Check that your Firestore rules allow this admin UID to read."
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return blogs.filter((b) =>
      (status === "all" || b.status === status) &&
      (category === "all" || b.category === category) &&
      (!q || b.title.toLowerCase().includes(q) || b.slug.includes(q)),
    );
  }, [blogs, search, status, category]);

  async function remove(blog: Blog) {
    if (!confirm(`Delete "${blog.title}"? This can't be undone.`)) return;
    await deleteBlog(blog.id);
    setBlogs((list) => list.filter((b) => b.id !== blog.id));
  }

  return (
    <AdminShell>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">Blogs</h1>
          <p className="mt-1.5 text-sm text-ink-muted">{filtered.length} of {blogs.length} posts</p>
        </div>
        <Link href="/admin/blogs/new" className="btn-primary"><Plus className="h-4 w-4" /> New post</Link>
      </div>

      {fetchError && (
        <div
          role="alert"
          className="mt-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          {fetchError}
        </div>
      )}

      <div className="mt-7 flex flex-wrap gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <input
            type="search" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or slug" aria-label="Search posts" className="field !py-2.5 !pl-10"
          />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status" className="field !w-auto !py-2.5">
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category" className="field !w-auto !py-2.5">
          <option value="all">All categories</option>
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-line bg-surface dark:border-white/10 dark:bg-white/[0.03]">
        {loading ? (
          <p className="py-16 text-center text-sm text-ink-muted">Loading posts…</p>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-medium">{blogs.length === 0 ? "No posts yet" : "Nothing matches those filters"}</p>
            <p className="mt-1.5 text-sm text-ink-muted">
              {blogs.length === 0 ? "Write your first post to get started." : "Clear the search or pick a different status."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="border-b border-line bg-surface-sub text-left dark:border-white/10 dark:bg-white/[0.03]">
                <tr className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-ink-muted">
                  <th className="px-5 py-3 font-normal">Title</th>
                  <th className="px-5 py-3 font-normal">Category</th>
                  <th className="px-5 py-3 font-normal">Status</th>
                  <th className="px-5 py-3 font-normal">Updated</th>
                  <th className="px-5 py-3 text-right font-normal">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line dark:divide-white/10">
                {filtered.map((b) => (
                  <tr key={b.id} className="transition-colors hover:bg-surface-sub dark:hover:bg-white/[0.03]">
                    <td className="max-w-xs px-5 py-4">
                      <Link href={`/admin/blogs/${b.id}`} className="block truncate font-medium hover:text-primary">
                        {b.title || "Untitled"}
                      </Link>
                      <span className="mt-0.5 block truncate font-mono text-xs text-ink-muted">/{b.slug}</span>
                    </td>
                    <td className="px-5 py-4 text-ink-muted">{b.category}</td>
                    <td className="px-5 py-4"><StatusPill status={b.status} /></td>
                    <td className="px-5 py-4 text-ink-muted">{formatShortDate(b.updatedAt)}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        {b.status === "published" && (
                          <Link href={`/blog/${b.slug}`} target="_blank" aria-label={`View ${b.title}`} className="flex h-8 w-8 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-surface-sub hover:text-primary dark:hover:bg-white/10">
                            <Eye className="h-4 w-4" />
                          </Link>
                        )}
                        <Link href={`/admin/blogs/${b.id}`} aria-label={`Edit ${b.title}`} className="flex h-8 w-8 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-surface-sub hover:text-primary dark:hover:bg-white/10">
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button onClick={() => remove(b)} aria-label={`Delete ${b.title}`} className="flex h-8 w-8 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
