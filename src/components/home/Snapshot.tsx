"use client";

import { useEffect, useState } from "react";
import { SectionLabel } from "@/components/site/SectionLabel";
import { Stagger, StaggerItem } from "@/components/site/Reveal";
import { snapshot } from "@/lib/content";
import { getSiteSettings } from "@/lib/services/settings.service";

export function Snapshot() {
  const [bioStatement, setBioStatement] = useState<string>("");

  useEffect(() => {
    getSiteSettings()
      .then((s) => {
        if (s.bioStatement) setBioStatement(s.bioStatement);
      })
      .catch((err) => console.error("Snapshot settings load error:", err));
  }, []);

  return (
    <section className="border-t border-line py-section dark:border-white/10">
      <div className="shell">
        <SectionLabel>Executive snapshot</SectionLabel>

        {bioStatement && (
          <p className="mb-10 max-w-3xl font-display text-xl sm:text-2xl font-medium leading-relaxed text-ink dark:text-white">
            {bioStatement}
          </p>
        )}

        <Stagger className="grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4 dark:border-white/10 dark:bg-white/10">
          {snapshot.map((item) => (
            <StaggerItem
              key={item.index}
              className="group bg-surface p-8 transition-colors duration-300 hover:bg-surface-sub dark:bg-[#0B0F16] dark:hover:bg-white/[0.03]"
            >
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-[0.625rem] tabular-nums text-primary dark:text-[#7FB3E0]">
                  {item.index}
                </span>
                <span className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-ink-muted">
                  {item.label}
                </span>
              </div>
              <h3 className="mt-6 font-display text-xl font-semibold leading-snug tracking-tight">
                {item.heading}
              </h3>
              <ul className="mt-4 space-y-1 text-sm text-ink-muted">
                {item.lines.map((line) => <li key={line}>{line}</li>)}
              </ul>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
