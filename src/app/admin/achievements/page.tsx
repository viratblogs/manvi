"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, ExternalLink, Pencil, Plus, Search, Trash2, Award } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { AchievementForm } from "@/components/admin/AchievementForm";
import {
  getAchievements,
  createAchievement,
  updateAchievement,
  deleteAchievement,
} from "@/lib/services/achievements.service";
import type { Achievement } from "@/types";

export default function AdminAchievementsPage() {
  const [items, setItems] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Achievement | null>(null);

  useEffect(() => {
    getAchievements()
      .then(setItems)
      .catch((err) => {
        console.error("Failed to load achievements:", err);
        setFetchError("Could not load certifications. Check your network or Firestore rules.");
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter(
      (a) =>
        (categoryFilter === "all" || a.category === categoryFilter) &&
        (!q || a.title.toLowerCase().includes(q) || a.organisation.toLowerCase().includes(q))
    );
  }, [items, search, categoryFilter]);

  function handleAddNew() {
    setEditingItem(null);
    setIsFormOpen(true);
  }

  function handleEdit(item: Achievement) {
    setEditingItem(item);
    setIsFormOpen(true);
  }

  async function handleRemove(item: Achievement) {
    if (!confirm(`Delete certification "${item.title}"?`)) return;
    await deleteAchievement(item.id);
    setItems((list) => list.filter((i) => i.id !== item.id));
  }

  async function handleSave(data: Partial<Achievement>) {
    if (editingItem) {
      await updateAchievement(editingItem.id, data);
      setItems((list) =>
        list.map((i) => (i.id === editingItem.id ? { ...i, ...data } as Achievement : i))
      );
    } else {
      const newId = await createAchievement(data as Omit<Achievement, "id" | "createdAt" | "updatedAt">);
      const created: Achievement = {
        id: newId,
        title: data.title || "",
        organisation: data.organisation || "",
        year: data.year || new Date().getFullYear(),
        category: data.category || "Certification",
        description: data.description || "",
        imageUrl: data.imageUrl || "",
        credentialUrl: data.credentialUrl || "",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setItems((list) => [created, ...list]);
    }
  }

  return (
    <AdminShell>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">Certifications &amp; Achievements</h1>
          <p className="mt-1.5 text-sm text-ink-muted">
            Manage your professional credentials, awards, and certifications ({filtered.length} total)
          </p>
        </div>
        <button onClick={handleAddNew} className="btn-primary">
          <Plus className="h-4 w-4 mr-1.5" /> Add Certification
        </button>
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
            placeholder="Search by certification name or organization..."
            className="field !py-2.5 !pl-10"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="field !w-auto !py-2.5"
        >
          <option value="all">All Categories</option>
          <option value="Certification">Certification</option>
          <option value="Award">Award</option>
          <option value="Recognition">Recognition</option>
          <option value="Academic">Academic</option>
        </select>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-line bg-surface dark:border-white/10 dark:bg-white/[0.03]">
        {loading ? (
          <p className="py-16 text-center text-sm text-ink-muted">Loading certifications…</p>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-medium">No certifications found</p>
            <p className="mt-1.5 text-sm text-ink-muted">
              {items.length === 0 ? "Add your first professional certification or achievement." : "No credentials match your search criteria."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="border-b border-line bg-surface-sub text-left dark:border-white/10 dark:bg-white/[0.03]">
                <tr className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-ink-muted">
                  <th className="px-5 py-3 font-normal">Certification Title</th>
                  <th className="px-5 py-3 font-normal">Organisation</th>
                  <th className="px-5 py-3 font-normal">Year</th>
                  <th className="px-5 py-3 font-normal">Category</th>
                  <th className="px-5 py-3 text-right font-normal">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line dark:divide-white/10">
                {filtered.map((a) => (
                  <tr key={a.id} className="transition-colors hover:bg-surface-sub dark:hover:bg-white/[0.03]">
                    <td className="max-w-xs px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <Award className="h-4 w-4 text-primary shrink-0" />
                        <span className="font-medium truncate">{a.title}</span>
                      </div>
                      {a.description && (
                        <p className="mt-0.5 text-xs text-ink-muted line-clamp-1">{a.description}</p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-ink-muted">{a.organisation}</td>
                    <td className="px-5 py-4 font-mono text-xs text-primary font-semibold">{a.year}</td>
                    <td className="px-5 py-4">
                      <span className="inline-block rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                        {a.category}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        {a.credentialUrl && (
                          <a
                            href={a.credentialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Verify ${a.title}`}
                            className="flex h-8 w-8 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-surface-sub hover:text-primary dark:hover:bg-white/10"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                        <button
                          onClick={() => handleEdit(a)}
                          aria-label={`Edit ${a.title}`}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-surface-sub hover:text-primary dark:hover:bg-white/10"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleRemove(a)}
                          aria-label={`Delete ${a.title}`}
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

      <AchievementForm
        isOpen={isFormOpen}
        initialData={editingItem}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
      />
    </AdminShell>
  );
}
