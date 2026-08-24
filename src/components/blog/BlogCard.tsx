import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Blog } from "@/types";
import { formatShortDate } from "@/lib/utils";

export function BlogCard({ blog, priority = false }: { blog: Blog; priority?: boolean }) {
  return (
    <article className="group">
      <Link href={`/blog/${blog.slug}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-line bg-surface-sub dark:border-white/10">
          {blog.featuredImage ? (
            <Image
              src={blog.featuredImage}
              alt=""
              fill
              priority={priority}
              sizes="(max-width: 768px) 100vw, 400px"
              className="object-cover transition-transform duration-500 ease-premium group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center font-display text-4xl text-ink-faint">
              {blog.title.charAt(0)}
            </div>
          )}
        </div>

        <div className="mt-5 flex items-center gap-3 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-ink-muted">
          <span className="text-primary dark:text-[#7FB3E0]">{blog.category}</span>
          <span className="h-px w-4 bg-line dark:bg-white/15" aria-hidden />
          <time dateTime={new Date(blog.publishedAt ?? blog.createdAt).toISOString()}>
            {formatShortDate(blog.publishedAt ?? blog.createdAt)}
          </time>
        </div>

        <h3 className="mt-3 font-display text-card font-semibold leading-snug transition-colors duration-200 group-hover:text-primary dark:group-hover:text-[#7FB3E0]">
          {blog.title}
        </h3>

        {blog.excerpt && (
          <p className="mt-3 line-clamp-2 text-[0.9375rem] leading-relaxed text-ink-muted">{blog.excerpt}</p>
        )}

        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary dark:text-[#7FB3E0]">
          Read article
          <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </Link>
    </article>
  );
}
