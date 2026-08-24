"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { BlogCard } from "@/components/blog/BlogCard";
import { SectionLabel } from "@/components/site/SectionLabel";
import { Stagger, StaggerItem } from "@/components/site/Reveal";
import { getPublishedBlogs } from "@/lib/blogs";
import type { Blog } from "@/types";

export function FeaturedInsights() {
  const [blogs, setBlogs] = useState<Blog[] | null>(null);

  useEffect(() => {
    getPublishedBlogs(3).then(setBlogs).catch(() => setBlogs([]));
  }, []);

  return (
    <section className="border-t border-line py-section dark:border-white/10">
      <div className="shell">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div className="flex-1 min-w-[280px]">
            <SectionLabel>Insights</SectionLabel>
            <h2 className="font-display text-section font-semibold">Writing on healthcare operations</h2>
          </div>
          <Link href="/insights" className="link-underline text-sm font-medium">
            All articles <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {blogs === null ? (
          <div className="grid gap-10 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[16/10] rounded-xl bg-surface-sub dark:bg-white/5" />
                <div className="mt-5 h-3 w-24 rounded bg-surface-sub dark:bg-white/5" />
                <div className="mt-4 h-5 w-full rounded bg-surface-sub dark:bg-white/5" />
              </div>
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line py-16 text-center dark:border-white/10">
            <p className="text-ink-muted">No articles published yet.</p>
            <Link href="/admin/blogs/new" className="link-underline mt-3 inline-flex text-sm">
              Write the first one
            </Link>
          </div>
        ) : (
          <Stagger className="grid gap-10 md:grid-cols-3">
            {blogs.map((blog) => (
              <StaggerItem key={blog.id}><BlogCard blog={blog} /></StaggerItem>
            ))}
          </Stagger>
        )}
      </div>
    </section>
  );
}
