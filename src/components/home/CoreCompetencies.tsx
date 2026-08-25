"use client";

import { useEffect, useState } from "react";
import { SectionLabel } from "@/components/site/SectionLabel";
import { Stagger, StaggerItem } from "@/components/site/Reveal";
import { getSiteSettings, DEFAULT_SETTINGS } from "@/lib/services/settings.service";
import { Tag } from "lucide-react";

export function CoreCompetencies() {
  const [skills, setSkills] = useState<string[]>(DEFAULT_SETTINGS.skills || []);

  useEffect(() => {
    const fetchSettings = () => {
      getSiteSettings()
        .then((s) => {
          if (s.skills && s.skills.length > 0) {
            setSkills(s.skills);
          }
        })
        .catch((err) => console.error("CoreCompetencies load error:", err));
    };

    fetchSettings();

    window.addEventListener("focus", fetchSettings);
    window.addEventListener("visibilitychange", fetchSettings);
    return () => {
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

        {/* Dynamic Skill Badges */}
        <Stagger className="flex flex-wrap gap-2.5 sm:gap-3">
          {skills.map((skill) => (
            <StaggerItem key={skill}>
              <span className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-medium text-ink shadow-xs transition-all duration-300 hover:border-primary/40 hover:bg-primary/5 hover:shadow-card dark:border-white/10 dark:bg-[#0B0F16] dark:text-white dark:hover:border-white/20">
                <Tag className="h-3.5 w-3.5 text-primary shrink-0 dark:text-[#7FB3E0]" />
                {skill}
              </span>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
