"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertCircle, Award, Briefcase, FileCheck2, FileText, Mail, Plus, Upload, User } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatusPill } from "@/components/admin/StatusPill";
import { getAllBlogs } from "@/lib/services/blogs.service";
import { getLeads } from "@/lib/services/contacts.service";
import { getAllCaseStudies } from "@/lib/services/caseStudies.service";
import { getAchievements } from "@/lib/services/achievements.service";
import { formatShortDate } from "@/lib/utils";
import type { Blog, ContactLead, FirestoreCaseStudy, Achievement } from "@/types";

export default function AdminDashboard() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [leads, setLeads] = useState<ContactLead[]>([]);
  const [caseStudies, setCaseStudies] = useState<FirestoreCaseStudy[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    Promise.all([getAllBlogs(), getLeads(), getAllCaseStudies(), getAchievements()])
      .then(([b, l, cs, ach]) => {
        setBlogs(b);
        setLeads(l);
        setCaseStudies(cs);
        setAchievements(ach);
      })
      .catch((err) => {
        console.error("[AdminDashboard] Failed to load dashboard data:", err);
        setFetchError(
          "Could not load dashboard data. Check that your Firestore rules allow access."
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: "Case Studies", value: caseStudies.length, icon: Briefcase },
    { label: "Certifications", value: achievements.length, icon: Award },
    { label: "Total blogs", value: blogs.length, icon: FileText },
    { label: "New leads", value: leads.filter((l) => l.status === "new").length, icon: Mail },
  ];

  return (
    <AdminShell>
      <h1 className="font-display text-2xl font-semibold">Dashboard</h1>
      <p className="mt-1.5 text-sm text-ink-muted">
        {loading ? "Loading…" : `${caseStudies.length} case studies · ${achievements.length} certifications · ${blogs.length} posts`}
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
        <Link href="/admin/settings" className="btn-primary"><User className="h-4 w-4 mr-1" /> Update profile photo</Link>
        <Link href="/admin/case-studies/new" className="btn-ghost"><Plus className="h-4 w-4 mr-1" /> New case study</Link>
        <Link href="/admin/achievements" className="btn-ghost"><Award className="h-4 w-4 mr-1" /> Manage certifications</Link>
        <Link href="/admin/media" className="btn-ghost"><Upload className="h-4 w-4 mr-1" /> Upload media</Link>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {/* Case Studies */}
        <section className="card !p-0">
          <div className="flex items-center justify-between border-b border-line px-6 py-4 dark:border-white/10">
            <h2 className="font-medium">Recent case studies</h2>
            <Link href="/admin/case-studies" className="text-sm text-primary">View all</Link>
          </div>
          {caseStudies.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-ink-muted">
              {loading ? "Loading…" : "No case studies yet. Create your first one."}
            </p>
          ) : (
            <ul className="divide-y divide-line dark:divide-white/10">
              {caseStudies.slice(0, 5).map((cs) => (
                <li key={cs.id}>
                  <Link href={`/admin/case-studies/${cs.id}`} className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-surface-sub dark:hover:bg-white/[0.03]">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{cs.title}</div>
                      <div className="mt-0.5 text-xs text-ink-muted">{cs.context || `Index ${cs.index}`} · {formatShortDate(cs.updatedAt)}</div>
                    </div>
                    <span className="font-mono text-xs font-semibold text-primary">{cs.index}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Certifications */}
        <section className="card !p-0">
          <div className="flex items-center justify-between border-b border-line px-6 py-4 dark:border-white/10">
            <h2 className="font-medium">Certifications</h2>
            <Link href="/admin/achievements" className="text-sm text-primary">View all</Link>
          </div>
          {achievements.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-ink-muted">
              {loading ? "Loading…" : "No certifications yet."}
            </p>
          ) : (
            <ul className="divide-y divide-line dark:divide-white/10">
              {achievements.slice(0, 5).map((a) => (
                <li key={a.id} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{a.title}</div>
                    <div className="mt-0.5 text-xs text-ink-muted">{a.organisation} · {a.year}</div>
                  </div>
                  <span className="shrink-0 text-xs rounded-full bg-primary/10 px-2 py-0.5 font-semibold text-primary">
                    {a.category}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AdminShell>
  );
}
