"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { BlogForm } from "@/components/admin/BlogForm";
import { getBlogById } from "@/lib/blogs";
import type { Blog } from "@/types";

export default function EditBlogPage() {
  const { id } = useParams<{ id: string }>();
  const [blog, setBlog] = useState<Blog | null | undefined>(undefined);

  useEffect(() => { getBlogById(id).then(setBlog).catch(() => setBlog(null)); }, [id]);

  if (blog === undefined) {
    return <AdminShell><p className="py-20 text-center text-sm text-ink-muted">Loading post…</p></AdminShell>;
  }
  if (blog === null) {
    return (
      <AdminShell>
        <div className="py-20 text-center">
          <p className="font-medium">Post not found</p>
          <p className="mt-1.5 text-sm text-ink-muted">It may have been deleted.</p>
          <Link href="/admin/blogs" className="btn-ghost mt-6">Back to all posts</Link>
        </div>
      </AdminShell>
    );
  }

  return <AdminShell><BlogForm existing={blog} /></AdminShell>;
}
