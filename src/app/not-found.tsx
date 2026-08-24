import Link from "next/link";
import { SiteShell } from "@/components/site/SiteShell";

export default function NotFound() {
  return (
    <SiteShell>
      <div className="shell flex min-h-[60vh] flex-col items-center justify-center py-section text-center">
        <span className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-ink-muted">404</span>
        <h1 className="mt-5 font-display text-section font-semibold">This page doesn&rsquo;t exist.</h1>
        <p className="mt-4 max-w-md text-ink-muted">
          The link may be outdated, or the page may have moved.
        </p>
        <Link href="/" className="btn-primary mt-9">Back to home</Link>
      </div>
    </SiteShell>
  );
}
