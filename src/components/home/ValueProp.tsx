import { SectionLabel } from "@/components/site/SectionLabel";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";
import { values } from "@/lib/content";

export function ValueProp() {
  return (
    <section className="border-t border-line bg-surface-sub py-section dark:border-white/10 dark:bg-white/[0.02]">
      <div className="shell">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-5">
            <SectionLabel>How I work</SectionLabel>
            <Reveal>
              <h2 className="font-display text-section font-semibold">
                Three principles that hold across every engagement.
              </h2>
            </Reveal>
          </div>

          <Stagger className="lg:col-span-7">
            {values.map((value) => (
              <StaggerItem
                key={value.index}
                className="group border-t border-line py-9 first:border-t-0 first:pt-0 dark:border-white/10"
              >
                <div className="flex gap-7">
                  <span className="mt-1.5 font-mono text-xs tabular-nums text-ink-faint transition-colors duration-300 group-hover:text-primary">
                    {value.index}
                  </span>
                  <div>
                    <h3 className="font-display text-card font-semibold">{value.title}</h3>
                    <p className="mt-3 max-w-lg text-[1.0625rem] leading-relaxed text-ink-muted">
                      {value.body}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}
