"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Download } from "lucide-react";
import { profile } from "@/lib/content";
import { getSiteSettings } from "@/lib/services/settings.service";
import { SafeImage } from "@/components/site/SafeImage";

export function Hero() {
  const reduce = useReducedMotion();
  const [heroImage, setHeroImage] = useState<string>("/m.png");
  const [bioStatement, setBioStatement] = useState<string>("");

  useEffect(() => {
    getSiteSettings()
      .then((s) => {
        if (s.heroImageUrl) setHeroImage(s.heroImageUrl);
        if (s.bioStatement) setBioStatement(s.bioStatement);
      })
      .catch((err) => console.error("Hero settings load error:", err));
  }, []);

  const rise = (delay: number) =>
    reduce
      ? {}
      : {
        initial: { opacity: 0, y: 22 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
      };

  return (
    <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-28">
      {/* Ambient wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-40 h-[560px] w-[560px] rounded-full bg-primary/[0.045] blur-3xl"
      />
      <div className="shell grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <motion.div {...rise(0)} className="measure mb-6 sm:mb-9">
            <span className="measure-index">MBA-HHM</span>
            <span className="text-xs sm:text-sm">Symbiosis International University · 2025–2027</span>
          </motion.div>

          <motion.h1 {...rise(0.08)} className="font-display text-hero font-semibold text-ink dark:text-white">
            Driving sustainable healthcare excellence through{" "}
            <span className="text-primary dark:text-[#7FB3E0]">strategy, innovation,</span> and leadership.
          </motion.h1>

          <motion.p
            {...rise(0.16)}
            className="mt-6 sm:mt-8 max-w-xl text-base sm:text-lg leading-relaxed text-ink-muted"
          >
            {bioStatement || profile.intro}
          </motion.p>

          <motion.div {...rise(0.24)} className="mt-8 sm:mt-11 flex flex-wrap items-center gap-4">
            <Link href="/case-studies" className="btn-primary group">
              View case studies
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
            <Link href="/resume.pdf" download className="btn-ghost">
              <Download className="h-4 w-4" />
              Download resume
            </Link>
          </motion.div>
        </div>

        <motion.div
          {...(reduce ? {} : {
            initial: { opacity: 0, scale: 0.97 },
            animate: { opacity: 1, scale: 1 },
            transition: { duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] as const },
          })}
          className="lg:col-span-5 pb-6 lg:pb-0"
        >
          <div className="relative mx-auto max-w-md">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-line bg-surface-sub dark:border-white/10">
              <SafeImage
                src={heroImage}
                fallbackSrc="/m.png"
                alt={`${profile.name}, ${profile.role}`}
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 420px"
                className="object-cover"
              />
            </div>
            {/* Credential plate */}
            <div className="absolute -bottom-6 left-2 sm:-left-6 rounded-xl border border-line bg-surface px-5 py-3.5 sm:px-6 sm:py-4 shadow-card dark:border-white/10 dark:bg-[#0F1520]">
              <div className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-ink-muted">Currently</div>
              <div className="mt-1 font-display text-sm sm:text-lg font-semibold">Healthcare Strategy &amp; Operations</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
