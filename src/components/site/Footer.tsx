import Link from "next/link";
import { Linkedin, Mail, MapPin } from "lucide-react";
import { nav, profile } from "@/lib/content";
import { ThemeToggle } from "./ThemeToggle";

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface-sub dark:border-white/10 dark:bg-white/[0.02]">
      <div className="shell py-16">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="font-display text-2xl font-semibold tracking-tight">{profile.name}</div>
            <p className="mt-3 max-w-sm text-[0.9375rem] leading-relaxed text-ink-muted">
              {profile.statement}
            </p>
          </div>

          <div className="md:col-span-3">
            <div className="measure mb-5">Pages</div>
            <ul className="space-y-2.5">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-[0.9375rem] text-ink-muted transition-colors hover:text-primary">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4">
            <div className="measure mb-5">Contact</div>
            <ul className="space-y-3 text-[0.9375rem] text-ink-muted">
              <li>
                <a href={`mailto:${profile.email}`} className="inline-flex items-center gap-2.5 transition-colors hover:text-primary">
                  <Mail className="h-4 w-4 shrink-0" /> {profile.email}
                </a>
              </li>
              <li>
                <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 transition-colors hover:text-primary">
                  <Linkedin className="h-4 w-4 shrink-0" /> LinkedIn
                </a>
              </li>
              <li className="inline-flex items-center gap-2.5">
                <MapPin className="h-4 w-4 shrink-0" /> {profile.location}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-line pt-7 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
          <span>© {new Date().getFullYear()} {profile.name}. All rights reserved.</span>
          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
}
