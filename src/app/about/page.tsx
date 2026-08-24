import type { Metadata } from "next";
import Image from "next/image";
import { SiteShell } from "@/components/site/SiteShell";
import { SectionLabel } from "@/components/site/SectionLabel";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";
import { competencies, profile, timeline } from "@/lib/content";

export const metadata: Metadata = {
  title: "About",
  description:
    "MBA candidate in Hospital & Healthcare Management at Symbiosis International University, focused on healthcare operations, analytics, and strategy.",
};

export default function AboutPage() {
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
              <Image
                src="/m.png"
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

      {/* Timeline — the index here is a real chronology, so numbering carries information. */}
      <section className="border-t border-line py-section dark:border-white/10">
        <div className="shell">
          <SectionLabel>Journey</SectionLabel>
          <h2 className="mb-14 font-display text-section font-semibold">Professional journey</h2>

          <Stagger className="relative">
            <div
              aria-hidden
              className="absolute left-0 top-2 hidden h-[calc(100%-1rem)] w-px bg-line md:left-[168px] md:block dark:bg-white/10"
            />
            {timeline.map((item) => (
              <StaggerItem key={item.title} className="relative grid gap-4 pb-14 last:pb-0 md:grid-cols-[168px_1fr] md:gap-12">
                <div className="font-mono text-xs uppercase tracking-[0.16em] text-ink-muted md:pt-1.5">
                  {item.period}
                </div>
                {/* <div className="relative md:pl-12">
                  <span
                    aria-hidden
                    className="absolute left-[-4.5px] top-2 hidden h-[9px] w-[9px] rounded-full border-2 border-primary bg-surface md:block dark:bg-[#0B0F16]"
                  />
                  <h3 className="font-display text-card font-semibold">{item.title}</h3>
                  <div className="mt-1.5 text-sm text-primary dark:text-[#7FB3E0]">{item.org}</div>
                  <p className="mt-4 max-w-2xl text-[1.0625rem] leading-relaxed text-ink-muted">{item.body}</p>
                </div> */}
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="border-t border-line bg-surface-sub py-section dark:border-white/10 dark:bg-white/[0.02]">
        <div className="shell">
          <SectionLabel>Capability</SectionLabel>
          <h2 className="mb-14 font-display text-section font-semibold">Core competencies</h2>

          <Stagger className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {competencies.map((group) => (
              <StaggerItem key={group.group}>
                <div className="measure mb-5">{group.group}</div>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((item) => <span key={item} className="pill">{item}</span>)}
                </div>
              </StaggerItem>
            ))}
          </Stagger>
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
