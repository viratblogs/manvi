"use client";

import { useState } from "react";
import { Check, Link2, Linkedin, Twitter } from "lucide-react";

export function ShareBar({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-ink-muted">Share</span>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`}
        target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-ink-muted transition-colors hover:border-primary/40 hover:text-primary dark:border-white/10"
      >
        <Linkedin className="h-4 w-4" />
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${encoded}&text=${encodedTitle}`}
        target="_blank" rel="noopener noreferrer" aria-label="Share on X"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-ink-muted transition-colors hover:border-primary/40 hover:text-primary dark:border-white/10"
      >
        <Twitter className="h-4 w-4" />
      </a>
      <button
        onClick={copy}
        aria-label={copied ? "Link copied" : "Copy link"}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-ink-muted transition-colors hover:border-primary/40 hover:text-primary dark:border-white/10"
      >
        {copied ? <Check className="h-4 w-4 text-positive" /> : <Link2 className="h-4 w-4" />}
      </button>
    </div>
  );
}
