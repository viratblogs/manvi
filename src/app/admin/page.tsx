"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertCircle, FileCheck2, FilePen, FileText, Mail, Plus, Upload } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatusPill } from "@/components/admin/StatusPill";
import { getAllBlogs } from "@/lib/blogs";
import { getLeads } from "@/lib/contacts";
import { formatShortDate } from "@/lib/utils";
import type { Blog, ContactLead } from "@/types";

export default function AdminDashboard() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [leads, setLeads] = useState<ContactLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    Promise.all([getAllBlogs(), getLeads()])
      .then(([b, l]) => { setBlogs(b); setLeads(l); })
      .catch((err) => {
        // Firestore rules may block reads until the admin UID env var is set.
        // Log for debugging without exposing raw Firebase errors to the UI.
        console.error("[AdminDashboard] Failed to load dashboard data:", err);
        setFetchError(
          "Could not load dashboard data. Check that your Firestore rules allow this admin UID to read."
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: "Total blogs", value: blogs.length, icon: FileText },
    { label: "Published", value: blogs.filter((b) => b.status === "published").length, icon: FileCheck2 },
    { label: "Drafts", value: blogs.filter((b) => b.status === "draft").length, icon: FilePen },
    { label: "New leads", value: leads.filter((l) => l.status === "new").length, icon: Mail },
  ];

  return (
    <AdminShell>
      <h1 className="font-display text-2xl font-semibold">Dashboard</h1>
      <p className="mt-1.5 text-sm text-ink-muted">
        {loading ? "Loading…" : `${blogs.length} posts · ${leads.length} enquiries`}
      </p>

      {fetchError && (
        <div
          role="alert"
          className="mt-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          {fetchError}
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card !p-6">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-ink-muted">{s.label}</span>
              <s.icon className="h-4 w-4 text-ink-faint" />
            </div>
            <div className="mt-4 font-display text-4xl font-semibold tabular-nums text-primary dark:text-[#7FB3E0]">
              {loading ? "—" : s.value}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/admin/blogs/new" className="btn-primary"><Plus className="h-4 w-4" /> Write a post</Link>
        <Link href="/admin/media" className="btn-ghost"><Upload className="h-4 w-4" /> Upload media</Link>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section className="card !p-0">
          <div className="flex items-center justify-between border-b border-line px-6 py-4 dark:border-white/10">
            <h2 className="font-medium">Recent posts</h2>
            <Link href="/admin/blogs" className="text-sm text-primary">View all</Link>
          </div>
          {blogs.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-ink-muted">
              {loading ? "Loading…" : "No posts yet. Write your first one."}
            </p>
          ) : (
            <ul className="divide-y divide-line dark:divide-white/10">
              {blogs.slice(0, 5).map((b) => (
                <li key={b.id}>
                  <Link href={`/admin/blogs/${b.id}`} className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-surface-sub dark:hover:bg-white/[0.03]">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{b.title || "Untitled"}</div>
                      <div className="mt-0.5 text-xs text-ink-muted">{b.category} · {formatShortDate(b.updatedAt)}</div>
                    </div>
                    <StatusPill status={b.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card !p-0">
          <div className="flex items-center justify-between border-b border-line px-6 py-4 dark:border-white/10">
            <h2 className="font-medium">Recent enquiries</h2>
            <Link href="/admin/leads" className="text-sm text-primary">View all</Link>
          </div>
          {leads.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-ink-muted">
              {loading ? "Loading…" : "No enquiries yet."}
            </p>
          ) : (
            <ul className="divide-y divide-line dark:divide-white/10">
              {leads.slice(0, 5).map((l) => (
                <li key={l.id} className="px-6 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate text-sm font-medium">{l.name}</span>
                    <span className="shrink-0 text-xs text-ink-muted">{formatShortDate(l.createdAt)}</span>
                  </div>
                  <p className="mt-1 truncate text-xs text-ink-muted">{l.subject}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AdminShell>
  );
}

