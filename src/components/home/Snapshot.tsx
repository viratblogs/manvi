import { SectionLabel } from "@/components/site/SectionLabel";
import { Stagger, StaggerItem } from "@/components/site/Reveal";
import { snapshot } from "@/lib/content";

export function Snapshot() {
  return (
    <section className="border-t border-line py-section dark:border-white/10">
      <div className="shell">
        <SectionLabel>Executive snapshot</SectionLabel>

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
