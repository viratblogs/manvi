"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowRight, Download } from "lucide-react";
import { profile } from "@/lib/content";

export function Hero() {
  const reduce = useReducedMotion();
  const rise = (delay: number) =>
    reduce
      ? {}
      : {
        initial: { opacity: 0, y: 22 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
      };

  return (
    <section className="relative overflow-hidden">
      {/* Ambient wash — kept below 4% opacity so it reads as paper, not gradient. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-40 h-[560px] w-[560px] rounded-full bg-primary/[0.045] blur-3xl"
      />
      <div className="shell grid min-h-[calc(100vh-72px)] items-center gap-14 py-20 lg:grid-cols-12 lg:gap-20 lg:py-0">
        <div className="lg:col-span-7">
          <motion.div {...rise(0)} className="measure mb-9">
            <span className="measure-index">MBA-HHM</span>
            <span>Symbiosis International University · 2025–2027</span>
          </motion.div>

          <motion.h1 {...rise(0.08)} className="font-display text-hero font-semibold text-ink dark:text-white">
            Driving sustainable healthcare excellence through{" "}
            <span className="text-primary dark:text-[#7FB3E0]">strategy, innovation,</span> and leadership.
          </motion.h1>

          <motion.p
            {...rise(0.16)}
            className="mt-8 max-w-xl text-lg leading-relaxed text-ink-muted"
          >
            {profile.intro}
          </motion.p>

          <motion.div {...rise(0.24)} className="mt-11 flex flex-wrap items-center gap-4">
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
          className="lg:col-span-5"
        >
          <div className="relative mx-auto max-w-md">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-line bg-surface-sub dark:border-white/10">
              <Image
                src="/m.png"
                alt={`${profile.name}, ${profile.role}`}
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 420px"
                className="object-cover"
              />
            </div>
            {/* Credential plate — a hairline-ruled caption, matching the measure system. */}
            <div className="absolute -bottom-6 -left-4 rounded-xl border border-line bg-surface px-6 py-4 shadow-card dark:border-white/10 dark:bg-[#0F1520] sm:-left-8">
              <div className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-ink-muted">Currently</div>
              <div className="mt-1.5 font-display text-lg font-semibold">Healthcare Strategy &amp; Operations</div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="shell hidden pb-10 lg:block">
        {/* <div className="flex items-center gap-3 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-ink-faint">
          <ArrowDown className="h-3.5 w-3.5 animate-bounce" aria-hidden />
          Scroll
        </div> */}
      </div>
    </section>
  );
}
