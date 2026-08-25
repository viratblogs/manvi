"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Archive, Mail, MailOpen, Trash2 } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { deleteLead, getLeads, setLeadStatus } from "@/lib/contacts";
import { cn, formatDate } from "@/lib/utils";
import type { ContactLead, ContactStatus } from "@/types";

const filters: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "read", label: "Read" },
  { value: "archived", label: "Archived" },
];

export default function LeadsPage() {
  const [leads, setLeads] = useState<ContactLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [filter, setFilter] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    getLeads()
      .then(setLeads)
      .catch((err) => {
        console.error("[LeadsPage] Failed to load enquiries:", err);
        setFetchError(
          "Could not load enquiries. Check that your Firestore rules allow this admin UID to read."
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () => (filter === "all" ? leads : leads.filter((l) => l.status === filter)),
    [leads, filter],
  );

  async function update(lead: ContactLead, status: ContactStatus) {
    await setLeadStatus(lead.id, status);
    setLeads((list) => list.map((l) => (l.id === lead.id ? { ...l, status } : l)));
  }

  async function remove(lead: ContactLead) {
    if (!confirm(`Delete the enquiry from ${lead.name}?`)) return;
    await deleteLead(lead.id);
    setLeads((list) => list.filter((l) => l.id !== lead.id));
  }

  function toggle(lead: ContactLead) {
    const next = openId === lead.id ? null : lead.id;
    setOpenId(next);
    if (next && lead.status === "new") update(lead, "read");
  }

  return (
    <AdminShell>
      <h1 className="font-display text-2xl font-semibold">Enquiries</h1>
      <p className="mt-1.5 text-sm text-ink-muted">
        {leads.filter((l) => l.status === "new").length} unread of {leads.length} total
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

      <div className="mt-7 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            aria-pressed={filter === f.value}
            className={cn(
              "rounded-full border px-4 py-2 text-sm transition-colors duration-200",
              filter === f.value
                ? "border-primary bg-primary text-white"
                : "border-line text-ink-muted hover:border-primary/40 hover:text-primary dark:border-white/10",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-line bg-surface dark:border-white/10 dark:bg-white/[0.03]">
        {loading ? (
          <p className="py-16 text-center text-sm text-ink-muted">Loading enquiries…</p>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-medium">{leads.length === 0 ? "No enquiries yet" : "Nothing in this view"}</p>
            <p className="mt-1.5 text-sm text-ink-muted">
              {leads.length === 0 ? "Messages from the contact form will appear here." : "Try a different filter."}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-line dark:divide-white/10">
            {filtered.map((lead) => (
              <li key={lead.id}>
                <button
                  onClick={() => toggle(lead)}
                  aria-expanded={openId === lead.id}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-surface-sub dark:hover:bg-white/[0.03]"
                >
                  {lead.status === "new"
                    ? <Mail className="h-4 w-4 shrink-0 text-primary" />
                    : <MailOpen className="h-4 w-4 shrink-0 text-ink-faint" />}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-3">
                      <span className={cn("truncate", lead.status === "new" ? "font-semibold" : "font-medium")}>
                        {lead.name}
                      </span>
                      {lead.organization && <span className="truncate text-xs text-ink-muted">{lead.organization}</span>}
                    </div>
                    <p className="mt-0.5 truncate text-sm text-ink-muted">{lead.subject}</p>
                  </div>
                  <span className="shrink-0 text-xs text-ink-muted">{formatDate(lead.createdAt)}</span>
                </button>

                {openId === lead.id && (
                  <div className="border-t border-line bg-surface-sub px-5 py-5 dark:border-white/10 dark:bg-white/[0.02]">
                    <p className="whitespace-pre-wrap text-[0.9375rem] leading-relaxed">{lead.message}</p>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <a href={`mailto:${lead.email}?subject=Re: ${encodeURIComponent(lead.subject)}`} className="btn-primary !py-2 !text-xs">
                        Reply to {lead.email}
                      </a>
                      <button onClick={() => update(lead, "archived")} className="btn-ghost !py-2 !text-xs">
                        <Archive className="h-3.5 w-3.5" /> Archive
                      </button>
                      <button onClick={() => remove(lead)} className="btn-ghost !py-2 !text-xs !text-red-600">
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </AdminShell>
  );
}
