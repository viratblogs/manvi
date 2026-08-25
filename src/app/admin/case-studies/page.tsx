"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { deleteCaseStudy, getAllCaseStudies } from "@/lib/services/caseStudies.service";
import { formatShortDate } from "@/lib/utils";
import type { FirestoreCaseStudy } from "@/types";

export default function AdminCaseStudiesPage() {
  const [items, setItems] = useState<FirestoreCaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    getAllCaseStudies()
      .then(setItems)
      .catch((err) => {
        console.error("[AdminCaseStudiesPage] Failed to load case studies:", err);
        setFetchError(
          "Could not load case studies. Check your network or Firestore rules."
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter(
      (cs) => !q || cs.title.toLowerCase().includes(q) || cs.slug.toLowerCase().includes(q)
    );
  }, [items, search]);

  async function remove(cs: FirestoreCaseStudy) {
    if (!confirm(`Delete "${cs.title}"? This cannot be undone.`)) return;
    await deleteCaseStudy(cs.id);
    setItems((list) => list.filter((i) => i.id !== cs.id));
  }

  return (
    <AdminShell>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">Case Studies</h1>
          <p className="mt-1.5 text-sm text-ink-muted">
            Manage portfolio case studies displayed on your site ({filtered.length} total)
          </p>
        </div>
        <Link href="/admin/case-studies/new" className="btn-primary">
          <Plus className="h-4 w-4 mr-1.5" /> New Case Study
        </Link>
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
        <div className="relative min-w-[240px] flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or slug..."
            aria-label="Search case studies"
            className="field !py-2.5 !pl-10"
          />
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-line bg-surface dark:border-white/10 dark:bg-white/[0.03]">
        {loading ? (
          <p className="py-16 text-center text-sm text-ink-muted">Loading case studies…</p>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-medium">No case studies found</p>
            <p className="mt-1.5 text-sm text-ink-muted">
              {items.length === 0 ? "Create your first case study to showcase your work." : "No case study matches your search query."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="border-b border-line bg-surface-sub text-left dark:border-white/10 dark:bg-white/[0.03]">
                <tr className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-ink-muted">
                  <th className="px-5 py-3 font-normal">Index</th>
                  <th className="px-5 py-3 font-normal">Title</th>
                  <th className="px-5 py-3 font-normal">Context</th>
                  <th className="px-5 py-3 font-normal">Updated</th>
                  <th className="px-5 py-3 text-right font-normal">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line dark:divide-white/10">
                {filtered.map((cs) => (
                  <tr key={cs.id} className="transition-colors hover:bg-surface-sub dark:hover:bg-white/[0.03]">
                    <td className="px-5 py-4 font-mono text-xs font-semibold text-primary">{cs.index}</td>
                    <td className="max-w-xs px-5 py-4">
                      <Link href={`/admin/case-studies/${cs.id}`} className="block truncate font-medium hover:text-primary">
                        {cs.title}
                      </Link>
                      <span className="mt-0.5 block truncate font-mono text-xs text-ink-muted">/{cs.slug}</span>
                    </td>
                    <td className="px-5 py-4 text-ink-muted text-xs">{cs.context || "—"}</td>
                    <td className="px-5 py-4 text-ink-muted">{formatShortDate(cs.updatedAt)}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        <Link
                          href={`/case-studies#${cs.slug}`}
                          target="_blank"
                          aria-label={`View ${cs.title}`}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-surface-sub hover:text-primary dark:hover:bg-white/10"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/case-studies/${cs.id}`}
                          aria-label={`Edit ${cs.title}`}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-surface-sub hover:text-primary dark:hover:bg-white/10"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => remove(cs)}
                          aria-label={`Delete ${cs.title}`}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                        >
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
