"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { nav, profile } from "@/lib/content";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";

export function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300 ease-premium",
        scrolled
          ? "border-b border-line bg-surface/85 backdrop-blur-xl dark:border-white/10 dark:bg-[#0B0F16]/85"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <nav className="shell flex h-[72px] items-center justify-between" aria-label="Main">
        <Link href="/" className="group flex flex-col leading-none">
          <span className="font-display text-lg font-semibold tracking-tight">{profile.name}</span>
          <span className="mt-1 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-ink-muted">
            Healthcare Strategy &amp; Operations
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {nav.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative rounded-md px-3.5 py-2 text-sm transition-colors duration-200",
                  active ? "text-primary dark:text-[#7FB3E0]" : "text-ink-muted hover:text-ink dark:hover:text-white",
                )}
              >
                {item.label}
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-x-3.5 -bottom-px h-px bg-primary dark:bg-[#7FB3E0]"
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/resume.pdf" className="btn-primary hidden !px-5 !py-2.5 md:inline-flex" download>
            Resume
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-ink md:hidden dark:border-white/10 dark:text-white"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-line bg-surface md:hidden dark:border-white/10 dark:bg-[#0B0F16]"
          >
            <div className="shell flex flex-col py-4">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="border-b border-line py-3.5 text-base last:border-0 dark:border-white/5"
                >
                  {item.label}
                </Link>
              ))}
              <Link href="/resume.pdf" download className="btn-primary mt-4">
                Download resume
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
