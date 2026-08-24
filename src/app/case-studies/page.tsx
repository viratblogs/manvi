import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { SectionLabel } from "@/components/site/SectionLabel";
import { Metric } from "@/components/site/Metric";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";
import { caseStudies } from "@/lib/content";

export const metadata: Metadata = {
  title: "Case Studies",
  description:
    "Consulting-style case studies in EHR implementation, hospital operational restructuring, and healthcare market entry — each with a measured baseline and quantified results.",
};

export default function CaseStudiesPage() {
  return (
    <SiteShell>
      <section className="py-section">
        <div className="shell">
          <SectionLabel>Case studies</SectionLabel>
          <h1 className="max-w-4xl font-display text-section font-semibold">
            Three engagements, each written the way a consulting team would hand it over.
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-ink-muted">
            Situation, task, action, results, and what I would carry into the next engagement. Every number
            below is stated against a measured baseline rather than an impression.
          </p>

          <nav aria-label="Case studies" className="mt-14 grid gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-3 dark:border-white/10 dark:bg-white/10">
            {caseStudies.map((cs) => (
              <a
                key={cs.slug}
                href={`#${cs.slug}`}
                className="group bg-surface p-7 transition-colors duration-300 hover:bg-surface-sub dark:bg-[#0B0F16] dark:hover:bg-white/[0.03]"
              >
                <span className="font-mono text-[0.625rem] tabular-nums text-primary dark:text-[#7FB3E0]">{cs.index}</span>
                <h2 className="mt-4 font-display text-lg font-semibold leading-snug">{cs.title}</h2>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors group-hover:text-primary">
                  Read <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </a>
            ))}
          </nav>
        </div>
      </section>

      {caseStudies.map((cs) => (
        <article key={cs.slug} id={cs.slug} className="scroll-mt-24 border-t border-line py-section dark:border-white/10">
          <div className="shell">
            <Reveal>
              <div className="measure mb-9">
                <span className="measure-index">{cs.index}</span>
                <span>{cs.context}</span>
              </div>
              <h2 className="max-w-4xl font-display text-section font-semibold">{cs.title}</h2>
              <p className="mt-7 max-w-2xl text-lg leading-relaxed text-ink-muted">{cs.summary}</p>
            </Reveal>

            <div className="mt-16 grid gap-12 lg:grid-cols-12 lg:gap-20">
              <div className="space-y-12 lg:col-span-7">
                <Reveal>
                  <h3 className="measure mb-5">Situation</h3>
                  <p className="text-[1.0625rem] leading-relaxed text-ink-muted">{cs.situation}</p>
                </Reveal>

                <Reveal>
                  <h3 className="measure mb-5">Task</h3>
                  <p className="text-[1.0625rem] leading-relaxed text-ink-muted">{cs.task}</p>
                </Reveal>

                <div>
                  <h3 className="measure mb-6">Action</h3>
                  <Stagger className="space-y-5" step={0.06}>
                    {cs.action.map((step, i) => (
                      <StaggerItem key={step} className="flex gap-5">
                        <span className="mt-1 shrink-0 font-mono text-xs tabular-nums text-ink-faint">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <p className="text-[1.0625rem] leading-relaxed text-ink-muted">{step}</p>
                      </StaggerItem>
                    ))}
                  </Stagger>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="lg:sticky lg:top-28">
                  <h3 className="measure mb-9">Results</h3>
                  <Stagger className="grid gap-10 sm:grid-cols-2">
                    {cs.results.map((r) => (
                      <StaggerItem key={r.label}>
                        <Metric value={r.value} label={r.label} note={r.note} />
                      </StaggerItem>
                    ))}
                  </Stagger>
                </div>
              </div>
            </div>

            <Reveal className="mt-16">
              <div className="rounded-xl border border-line bg-surface-sub p-9 dark:border-white/10 dark:bg-white/[0.03]">
                <h3 className="measure mb-6">Key takeaways</h3>
                <ul className="space-y-4">
                  {cs.takeaways.map((t) => (
                    <li key={t} className="flex gap-4 text-[1.0625rem] leading-relaxed">
                      <span aria-hidden className="mt-[0.7em] h-px w-5 shrink-0 bg-primary" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </article>
      ))}

      <section className="border-t border-line bg-surface-sub py-section dark:border-white/10 dark:bg-white/[0.02]">
        <div className="shell text-center">
          <h2 className="mx-auto max-w-2xl font-display text-section font-semibold">
            Working on something similar?
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-lg text-ink-muted">
            I am open to consulting projects, internships, and research collaboration in healthcare operations.
          </p>
          <Link href="/contact" className="btn-primary mt-9 group">
            Start a conversation
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}
