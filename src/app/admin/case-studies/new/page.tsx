"use client";

import { AdminShell } from "@/components/admin/AdminShell";
import { CaseStudyForm } from "@/components/admin/CaseStudyForm";
import { createCaseStudy } from "@/lib/services/caseStudies.service";

export default function NewCaseStudyPage() {
  return (
    <AdminShell>
      <CaseStudyForm isNew onSave={createCaseStudy} />
    </AdminShell>
  );
}
