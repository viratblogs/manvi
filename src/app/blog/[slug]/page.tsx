"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Toc } from "@/components/blog/Toc";
import { ShareBar } from "@/components/blog/ShareBar";
import { BlogCard } from "@/components/blog/BlogCard";
import { SectionLabel } from "@/components/site/SectionLabel";
import { getBlogBySlug, getRelatedBlogs } from "@/lib/blogs";
import { extractHeadings, formatDate, withHeadingIds } from "@/lib/utils";
import { profile } from "@/lib/content";
import type { Blog } from "@/types";

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<Blog | null | undefined>(undefined);
  const [related, setRelated] = useState<Blog[]>([]);
  const [html, setHtml] = useState("");

  useEffect(() => {
    let cancelled = false;
    getBlogBySlug(slug)
      .then(async (b) => {
        if (cancelled) return;
        if (!b || b.status !== "published") { setBlog(null); return; }
        const processed = withHeadingIds(b.content);
        setHtml(processed);
        setBlog(b);
        setRelated(await getRelatedBlogs(b));
      })
      .catch(() => { if (!cancelled) setBlog(null); });
    return () => { cancelled = true; };
  }, [slug]);

  // Title and description are set client-side because this page reads from Firestore
  // at runtime. For crawler-visible metadata, see the note in README on ISR.
  useEffect(() => {
    if (blog) document.title = `${blog.seoTitle || blog.title} · ${profile.name}`;
  }, [blog]);

  if (blog === undefined) {
    return <SiteShell><div className="shell py-40 text-center text-ink-muted">Loading article…</div></SiteShell>;
  }

  if (blog === null) {
    return (
      <SiteShell>
        <div className="shell py-40 text-center">
          <h1 className="font-display text-section font-semibold">Article not found</h1>
          <p className="mt-4 text-ink-muted">This post may have been unpublished or the link may be wrong.</p>
          <Link href="/insights" className="btn-primary mt-8">Browse all insights</Link>
        </div>
      </SiteShell>
    );
  }

  const headings = extractHeadings(html);
  const url = typeof window !== "undefined" ? window.location.href : "";

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    description: blog.seoDescription || blog.excerpt,
    image: blog.featuredImage,
    datePublished: blog.publishedAt ? new Date(blog.publishedAt).toISOString() : undefined,
    dateModified: new Date(blog.updatedAt).toISOString(),
    author: { "@type": "Person", name: blog.author },
    keywords: blog.keywords.join(", "),
  };

  return (
    <SiteShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      <article className="py-section">
        <div className="shell">
          <Link href="/insights" className="mb-12 inline-flex items-center gap-2 text-sm text-ink-muted transition-colors hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> All insights
          </Link>

          <header className="mx-auto max-w-read">
            <div className="measure mb-7">
              <span className="measure-index">{blog.category}</span>
              <span>{blog.readingTime} min read</span>
            </div>
            <h1 className="font-display text-section font-semibold leading-tight">{blog.title}</h1>
            {blog.excerpt && <p className="mt-7 text-lg leading-relaxed text-ink-muted">{blog.excerpt}</p>}

            <div className="mt-9 flex flex-wrap items-center justify-between gap-5 border-y border-line py-5 dark:border-white/10">
              <div className="text-sm">
                <span className="font-medium">{blog.author}</span>
                <span className="mx-2 text-ink-faint" aria-hidden>·</span>
                <time dateTime={new Date(blog.publishedAt ?? blog.createdAt).toISOString()} className="text-ink-muted">
                  {formatDate(blog.publishedAt ?? blog.createdAt)}
                </time>
              </div>
              <ShareBar title={blog.title} url={url} />
            </div>
          </header>

          {blog.featuredImage && (
            <div className="relative mx-auto mt-14 aspect-[16/9] max-w-4xl overflow-hidden rounded-xl border border-line bg-surface-sub dark:border-white/10">
              <Image src={blog.featuredImage} alt="" fill priority sizes="(max-width: 1024px) 100vw, 900px" className="object-cover" />
            </div>
          )}

          <div className="mt-16 grid gap-14 lg:grid-cols-[1fr_minmax(0,800px)_1fr]">
            <aside className="hidden lg:block"><Toc headings={headings} /></aside>

            <div
              className="prose prose-manvi dark:prose-invert mx-auto w-full max-w-read"
              dangerouslySetInnerHTML={{ __html: html }}
            />

            <div className="hidden lg:block" />
          </div>

          {blog.tags.length > 0 && (
            <div className="mx-auto mt-16 flex max-w-read flex-wrap gap-2 border-t border-line pt-9 dark:border-white/10">
              {blog.tags.map((t) => <span key={t} className="pill !py-1.5 !text-xs">{t}</span>)}
            </div>
          )}
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t border-line bg-surface-sub py-section dark:border-white/10 dark:bg-white/[0.02]">
          <div className="shell">
            <SectionLabel>Continue reading</SectionLabel>
            <h2 className="mb-14 font-display text-section font-semibold">Related articles</h2>
            <div className="grid gap-12 md:grid-cols-3">
              {related.map((r) => <BlogCard key={r.id} blog={r} />)}
            </div>
          </div>
        </section>
      )}
    </SiteShell>
  );
}
