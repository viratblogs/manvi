"use client";

import { useEffect, useState } from "react";
import { ExternalLink, ShieldCheck, Tag } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { SectionLabel } from "@/components/site/SectionLabel";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";
import { SafeImage } from "@/components/site/SafeImage";
import { competencies, profile, timeline as staticTimeline } from "@/lib/content";
import { getSiteSettings, DEFAULT_SETTINGS, DEFAULT_COMPETENCIES_GROUPS } from "@/lib/services/settings.service";
import { getAchievements } from "@/lib/services/achievements.service";
import type { Achievement, SiteSettings } from "@/types";

export default function AboutPage() {
  const [profileImage, setProfileImage] = useState<string>("/m.png");
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    const fetchSettings = () => {
      getSiteSettings()
        .then((s) => {
          setSiteSettings(s);
          if (s.heroImageUrl) setProfileImage(s.heroImageUrl);
        })
        .catch((e) => console.error(e));
    };

    fetchSettings();

    getAchievements()
      .then(setAchievements)
      .catch((e) => console.error(e));

    window.addEventListener("focus", fetchSettings);
    window.addEventListener("visibilitychange", fetchSettings);
    return () => {
      window.removeEventListener("focus", fetchSettings);
      window.removeEventListener("visibilitychange", fetchSettings);
    };
  }, []);

  // Helper to parse Professional Journey text into timeline blocks
  const journeyContent = siteSettings?.professionalJourney || DEFAULT_SETTINGS.professionalJourney;
  const journeyBlocks = (journeyContent || "")
    .split(/\n\n+/)
    .map((block) => block.trim())
    .filter(Boolean);

  // Dynamic Skill Tags for Core Competencies
  const dynamicSkills = siteSettings?.skills && siteSettings.skills.length > 0
    ? siteSettings.skills
    : DEFAULT_SETTINGS.skills || [];

  return (
    <SiteShell>
      <section className="py-section">
        <div className="shell grid gap-14 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-7">
            <SectionLabel>About</SectionLabel>
            <h1 className="font-display text-section font-semibold">
              I work on the gap between how a hospital is supposed to run and how it actually runs.
            </h1>

            <div className="mt-9 max-w-xl space-y-5 text-[1.0625rem] leading-relaxed text-ink-muted">
              <p>
                I am an MBA candidate in Hospital &amp; Healthcare Management at Symbiosis International
                University, Pune. My interest is narrower than &ldquo;healthcare management&rdquo; in general — it is
                the operational layer where clinical intent meets scheduling, staffing, records, and cost.
              </p>
              <p>
                That interest came out of research work rather than a lecture hall. Interviewing front-desk
                staff, nurses, and referring physicians for market studies taught me that the people closest
                to a process usually know exactly what is broken about it, and are rarely asked.
              </p>
              <p>
                My approach starts with a measured baseline. An engagement that cannot say what changed
                against what number is a story, not a result. Everything on the case studies page is
                structured that way deliberately.
              </p>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-line bg-surface-sub lg:sticky lg:top-28 dark:border-white/10">
              <SafeImage
                src={profileImage}
                fallbackSrc="/m.png"
                alt={profile.name}
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 420px"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Certifications & Achievements Section */}
      <section className="border-t border-line py-section dark:border-white/10">
        <div className="shell">
          <SectionLabel>Credentials</SectionLabel>
          <h2 className="mb-4 font-display text-section font-semibold">Certifications &amp; Professional Recognition</h2>
          <p className="mb-14 max-w-xl text-lg text-ink-muted leading-relaxed">
            Rigorous certifications and academic credentials in hospital operations, healthcare analytics, and quality management.
          </p>

          <Stagger className="grid gap-6 sm:grid-cols-2">
            {achievements.map((item) => (
              <StaggerItem key={item.id}>
                <div className="group relative flex flex-col justify-between rounded-xl border border-line bg-surface p-7 transition-all duration-300 hover:border-primary/50 hover:shadow-card dark:border-white/10 dark:bg-white/[0.02]">
                  <div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        {item.category}
                      </span>
                      <span className="font-mono text-xs text-ink-muted">{item.year}</span>
                    </div>

                    <h3 className="mt-5 font-display text-lg font-semibold leading-snug group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-xs font-medium text-ink-muted">{item.organisation}</p>

                    {item.imageUrl && (
                      <div className="relative mt-4 aspect-video w-full overflow-hidden rounded-lg border border-line bg-surface-sub dark:border-white/10">
                        <SafeImage
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 400px"
                          className="object-cover"
                        />
                      </div>
                    )}

                    {item.description && (
                      <p className="mt-4 text-sm leading-relaxed text-ink-muted">{item.description}</p>
                    )}
                  </div>

                  {item.credentialUrl && (
                    <div className="mt-6 pt-4 border-t border-line dark:border-white/10">
                      <a
                        href={item.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                      >
                        Verify Credential <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Dynamic Professional Journey Section */}
      <section className="border-t border-line py-section dark:border-white/10">
        <div className="shell">
          <SectionLabel>Journey</SectionLabel>
          <h2 className="mb-14 font-display text-section font-semibold">Professional journey</h2>

          {journeyBlocks.length > 0 ? (
            <Stagger className="relative">
              <div
                aria-hidden
                className="absolute left-0 top-2 hidden h-[calc(100%-1rem)] w-px bg-line md:left-[168px] md:block dark:bg-white/10"
              />
              {journeyBlocks.map((block, idx) => {
                const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
                if (lines.length === 0) return null;

                let period = `0${idx + 1}`;
                let title = lines[0];
                let org = "";
                let description = "";

                if (lines[0].includes("|")) {
                  const parts = lines[0].split("|");
                  period = parts[0].trim();
                  title = parts.slice(1).join("|").trim();
                  if (lines.length > 1) {
                    org = lines[1];
                    description = lines.slice(2).join(" ");
                  }
                } else if (/^\d{4}/.test(lines[0])) {
                  period = lines[0];
                  title = lines.length > 1 ? lines[1] : lines[0];
                  org = lines.length > 2 ? lines[2] : "";
                  description = lines.slice(lines.length > 2 ? 3 : 2).join(" ");
                } else {
                  title = lines[0];
                  description = lines.slice(1).join(" ");
                }

                return (
                  <StaggerItem key={`journey-${idx}`} className="relative grid gap-4 pb-14 last:pb-0 md:grid-cols-[168px_1fr] md:gap-12">
                    <div className="font-mono text-xs uppercase tracking-[0.16em] text-ink-muted md:pt-1.5">
                      {period}
                    </div>
                    <div className="relative md:pl-12">
                      <span
                        aria-hidden
                        className="absolute left-[-4.5px] top-2 hidden h-[9px] w-[9px] rounded-full border-2 border-primary bg-surface md:block dark:bg-[#0B0F16]"
                      />
                      <h3 className="font-display text-card font-semibold">{title}</h3>
                      {org && <div className="mt-1.5 text-sm text-primary dark:text-[#7FB3E0]">{org}</div>}
                      {description && (
                        <p className="mt-4 max-w-2xl text-[1.0625rem] leading-relaxed text-ink-muted">
                          {description}
                        </p>
                      )}
                    </div>
                  </StaggerItem>
                );
              })}
            </Stagger>
          ) : (
            <Stagger className="relative">
              <div
                aria-hidden
                className="absolute left-0 top-2 hidden h-[calc(100%-1rem)] w-px bg-line md:left-[168px] md:block dark:bg-white/10"
              />
              {staticTimeline.map((item) => (
                <StaggerItem key={item.title} className="relative grid gap-4 pb-14 last:pb-0 md:grid-cols-[168px_1fr] md:gap-12">
                  <div className="font-mono text-xs uppercase tracking-[0.16em] text-ink-muted md:pt-1.5">
                    {item.period}
                  </div>
                  <div className="relative md:pl-12">
                    <span
                      aria-hidden
                      className="absolute left-[-4.5px] top-2 hidden h-[9px] w-[9px] rounded-full border-2 border-primary bg-surface md:block dark:bg-[#0B0F16]"
                    />
                    <h3 className="font-display text-card font-semibold">{item.title}</h3>
                    <div className="mt-1.5 text-sm text-primary dark:text-[#7FB3E0]">{item.org}</div>
                    <p className="mt-4 max-w-2xl text-[1.0625rem] leading-relaxed text-ink-muted">{item.body}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </div>
      </section>

      {/* Dynamic Core Competencies Section */}
      <section className="border-t border-line bg-surface-sub py-section dark:border-white/10 dark:bg-white/[0.02]">
        <div className="shell">
          <SectionLabel>Capability</SectionLabel>
          <h2 className="mb-6 font-display text-section font-semibold">Core competencies</h2>

          {/* Dynamic Core Competency Badges */}
          {dynamicSkills.length > 0 && (
            <div className="mb-12">
              <div className="measure mb-4">Key Skills</div>
              <div className="flex flex-wrap gap-2.5 sm:gap-3">
                {dynamicSkills.map((skill) => (
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

          {/* Functional Breakdown Groups */}
          <div className="pt-8 border-t border-line/50 dark:border-white/10">
            <div className="measure mb-6">Functional Breakdown</div>
            <Stagger className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {(siteSettings?.competenciesGroups && siteSettings.competenciesGroups.length > 0
                ? siteSettings.competenciesGroups
                : DEFAULT_COMPETENCIES_GROUPS
              ).map((group) => (
                <StaggerItem key={group.group}>
                  <div className="measure mb-5">{group.group}</div>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <span key={item} className="pill">
                        {item}
                      </span>
                    ))}
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      </section>

      <section className="border-t border-line py-section dark:border-white/10">
        <div className="shell">
          <Reveal>
            <blockquote className="mx-auto max-w-3xl text-center">
              <p className="font-display text-section font-medium leading-tight">
                &ldquo;{profile.statement}&rdquo;
              </p>
              <footer className="mt-8 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-ink-muted">
                {profile.name} — {profile.title}
              </footer>
            </blockquote>
          </Reveal>
        </div>
      </section>
    </SiteShell>
  );
}
