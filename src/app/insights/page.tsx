"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Search } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { SectionLabel } from "@/components/site/SectionLabel";
import { BlogCard } from "@/components/blog/BlogCard";
import { Stagger, StaggerItem } from "@/components/site/Reveal";
import { getPublishedBlogs } from "@/lib/blogs";
import { categories } from "@/lib/content";
import { cn, formatShortDate } from "@/lib/utils";
import type { Blog } from "@/types";

const PER_PAGE = 6;

export default function InsightsPage() {
  const [blogs, setBlogs] = useState<Blog[] | null>(null);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => { getPublishedBlogs().then(setBlogs).catch(() => setBlogs([])); }, []);
  useEffect(() => { setPage(1); }, [category, search]);

  const filtered = useMemo(() => {
    if (!blogs) return [];
    const q = search.trim().toLowerCase();
    return blogs.filter((b) => {
      const matchesCategory = category === "All" || b.category === category;
      const matchesSearch =
        !q ||
        b.title.toLowerCase().includes(q) ||
        b.excerpt.toLowerCase().includes(q) ||
        b.tags.some((t) => t.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [blogs, category, search]);

  const isDefaultView = category === "All" && !search.trim();
  const featured = isDefaultView ? filtered[0] : undefined;
  const list = featured ? filtered.slice(1) : filtered;
  const pageCount = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const visible = list.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <SiteShell>
      <section className="py-section">
        <div className="shell">
          <SectionLabel>Insights</SectionLabel>
          <h1 className="max-w-3xl font-display text-section font-semibold">
            Notes on healthcare operations, analytics, and the systems in between.
          </h1>

          <div className="mt-12 flex flex-col gap-6 border-b border-line pb-8 lg:flex-row lg:items-center lg:justify-between dark:border-white/10">
            <div className="flex flex-wrap gap-2">
              {["All", ...categories].map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  aria-pressed={category === c}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm transition-all duration-200",
                    category === c
                      ? "border-primary bg-primary text-white"
                      : "border-line text-ink-muted hover:border-primary/40 hover:text-primary dark:border-white/10",
                  )}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="relative lg:w-72">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search articles"
                aria-label="Search articles"
                className="field !py-2.5 !pl-10"
              />
            </div>
          </div>

          {blogs === null ? (
            <div className="py-24 text-center text-ink-muted">Loading articles…</div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-line py-24 text-center dark:border-white/10">
              <p className="font-display text-xl">
                {blogs.length === 0 ? "No articles published yet." : "Nothing matches that filter."}
              </p>
              <p className="mt-2 text-ink-muted">
                {blogs.length === 0
                  ? "Publish the first post from the admin dashboard."
                  : "Try a different category or clear the search."}
              </p>
            </div>
          ) : (
            <>
              {featured && (
                <Link href={`/blog/${featured.slug}`} className="group mt-14 grid gap-10 lg:grid-cols-2 lg:gap-16">
                  <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-line bg-surface-sub dark:border-white/10">
                    {featured.featuredImage && (
                      <Image
                        src={featured.featuredImage}
                        alt=""
                        fill
                        priority
                        sizes="(max-width: 1024px) 100vw, 600px"
                        className="object-cover transition-transform duration-500 ease-premium group-hover:scale-[1.03]"
                      />
                    )}
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="measure mb-6"><span className="measure-index">Featured</span></div>
                    <div className="flex items-center gap-3 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-ink-muted">
                      <span className="text-primary dark:text-[#7FB3E0]">{featured.category}</span>
                      <span className="h-px w-4 bg-line" aria-hidden />
                      <span>{formatShortDate(featured.publishedAt)}</span>
                      <span className="h-px w-4 bg-line" aria-hidden />
                      <span>{featured.readingTime} min</span>
                    </div>
                    <h2 className="mt-4 font-display text-section font-semibold leading-tight transition-colors group-hover:text-primary dark:group-hover:text-[#7FB3E0]">
                      {featured.title}
                    </h2>
                    <p className="mt-5 text-[1.0625rem] leading-relaxed text-ink-muted">{featured.excerpt}</p>
                    <span className="mt-7 inline-flex items-center gap-1.5 text-sm font-medium text-primary dark:text-[#7FB3E0]">
                      Read article
                      <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </div>
                </Link>
              )}

              {visible.length > 0 && (
                <Stagger className="mt-20 grid gap-12 md:grid-cols-2 lg:grid-cols-3">
                  {visible.map((b) => (
                    <StaggerItem key={b.id}><BlogCard blog={b} /></StaggerItem>
                  ))}
                </Stagger>
              )}

              {pageCount > 1 && (
                <nav aria-label="Pagination" className="mt-20 flex items-center justify-center gap-2">
                  {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      onClick={() => { setPage(n); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      aria-current={page === n ? "page" : undefined}
                      className={cn(
                        "h-10 w-10 rounded-lg border font-mono text-sm tabular-nums transition-all duration-200",
                        page === n
                          ? "border-primary bg-primary text-white"
                          : "border-line text-ink-muted hover:border-primary/40 hover:text-primary dark:border-white/10",
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </nav>
              )}
            </>
          )}
        </div>
      </section>
    </SiteShell>
  );
}
