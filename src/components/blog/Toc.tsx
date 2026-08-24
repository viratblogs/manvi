"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function Toc({ headings }: { headings: { id: string; text: string; level: number }[] }) {
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    if (headings.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) setActive(visible[0].target.id);
      },
      { rootMargin: "-88px 0px -70% 0px", threshold: 0 },
    );
    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <nav aria-label="On this page" className="lg:sticky lg:top-28">
      <div className="measure mb-5">On this page</div>
      <ul className="space-y-2.5 border-l border-line dark:border-white/10">
        {headings.map((h) => (
          <li key={h.id} style={{ paddingLeft: h.level === 3 ? "1.75rem" : "1rem" }}>
            <a
              href={`#${h.id}`}
              className={cn(
                "-ml-px block border-l-2 py-0.5 text-sm leading-snug transition-colors duration-200",
                active === h.id
                  ? "border-primary pl-3 text-primary dark:text-[#7FB3E0]"
                  : "border-transparent pl-3 text-ink-muted hover:text-ink dark:hover:text-white",
              )}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
