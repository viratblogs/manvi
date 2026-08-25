"use client";

import { useEffect, useState, use } from "react";
import { Loader2 } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { CaseStudyForm } from "@/components/admin/CaseStudyForm";
import { getCaseStudyById, updateCaseStudy } from "@/lib/services/caseStudies.service";
import type { FirestoreCaseStudy } from "@/types";

export default function EditCaseStudyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<FirestoreCaseStudy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getCaseStudyById(id)
      .then((item) => {
        if (!item) setError("Case study not found.");
        else setData(item);
      })
      .catch((err) => {
        console.error("Error loading case study:", err);
        setError("Could not load case study.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <AdminShell>
      {loading ? (
        <div className="flex py-20 items-center justify-center text-ink-muted">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading case study…
        </div>
      ) : error ? (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      ) : data ? (
        <CaseStudyForm
          initialData={data}
          onSave={(patch) => updateCaseStudy(data.id, patch)}
        />
      ) : null}
    </AdminShell>
  );
}
