"use client";

import { useEffect, useState } from "react";
import { SectionLabel } from "@/components/site/SectionLabel";
import { getSiteSettings, DEFAULT_SETTINGS, DEFAULT_COMPETENCIES_GROUPS } from "@/lib/services/settings.service";
import { Tag } from "lucide-react";
import type { CompetencyGroup } from "@/types";

export function CoreCompetencies() {
  const [skills, setSkills] = useState<string[]>(DEFAULT_SETTINGS.skills || []);
  const [groups, setGroups] = useState<CompetencyGroup[]>(DEFAULT_COMPETENCIES_GROUPS);

  useEffect(() => {
    let isMounted = true;
    const fetchSettings = () => {
      getSiteSettings()
        .then((s) => {
          if (!isMounted) return;
          if (s.skills && s.skills.length > 0) {
            setSkills(s.skills);
          }
          if (s.competenciesGroups && s.competenciesGroups.length > 0) {
            setGroups(s.competenciesGroups);
          }
        })
        .catch((err) => console.error("CoreCompetencies load error:", err));
    };

    fetchSettings();

    window.addEventListener("focus", fetchSettings);
    window.addEventListener("visibilitychange", fetchSettings);
    return () => {
      isMounted = false;
      window.removeEventListener("focus", fetchSettings);
      window.removeEventListener("visibilitychange", fetchSettings);
    };
  }, []);

  return (
    <section className="border-t border-line bg-surface-sub py-section dark:border-white/10 dark:bg-white/[0.02]">
      <div className="shell">
        <SectionLabel>Capability</SectionLabel>
        <h2 className="mb-4 font-display text-section font-semibold">Core competencies</h2>
        <p className="mb-10 max-w-xl text-base sm:text-lg text-ink-muted leading-relaxed">
          Dynamic professional skill tags and domain expertise across healthcare strategy, management, and clinical operations.
        </p>

        {/* 1. Dynamic Key Skills Badges */}
        {skills.length > 0 && (
          <div className="mb-12">
            <div className="measure mb-4">Key Skills</div>
            <div className="flex flex-wrap gap-2.5 sm:gap-3">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-medium text-ink shadow-xs transition-all duration-300 hover:border-primary/40 hover:bg-primary/5 hover:shadow-card dark:border-white/10 dark:bg-[#0B0F16] dark:text-white dark:hover:border-white/20"
                >
                  <Tag className="h-3.5 w-3.5 text-primary shrink-0 dark:text-[#7FB3E0]" />
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 2. Dynamic Grouped Subcategories (Strategy, Operations, Analytics, Technology, Quality & Risk, Change) */}
        {groups.length > 0 && (
          <div className="pt-8 border-t border-line/50 dark:border-white/10">
            <div className="measure mb-6">Functional Breakdown</div>
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {groups.map((group) => (
                <div key={group.group}>
                  <div className="measure mb-5">{group.group}</div>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <span key={item} className="pill">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
