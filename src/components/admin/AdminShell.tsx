"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FileText, Image as ImageIcon, LayoutDashboard, LogOut, Mail, Menu, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/blogs", label: "Blogs", icon: FileText },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
  { href: "/admin/leads", label: "Leads", icon: Mail },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!loading && !isAdmin) router.replace("/admin/login");
  }, [loading, isAdmin, router]);

  useEffect(() => { setOpen(false); }, [pathname]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-ink-muted">Checking session…</div>;
  }
  if (!isAdmin) return null;

  return (
    <div className="flex min-h-screen bg-surface-sub dark:bg-[#0B0F16]">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[#0F1520] text-white transition-transform duration-300 ease-premium lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="border-b border-white/10 px-6 py-6">
          <div className="font-display text-lg font-semibold">Manvi Gurjar</div>
          <div className="mt-1 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-white/40">
            Content dashboard
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4" aria-label="Admin">
          {links.map((link) => {
            const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm transition-colors duration-200",
                  active ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white",
                )}
              >
                <link.icon className="h-4 w-4" /> {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="truncate px-3.5 pb-3 text-xs text-white/40">{user?.email}</div>
          <button
            onClick={async () => { await logout(); router.replace("/admin/login"); }}
            className="flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-ink/40 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-line bg-surface/85 px-5 backdrop-blur-xl lg:px-8 dark:border-white/10 dark:bg-[#0B0F16]/85">
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close navigation" : "Open navigation"}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-line lg:hidden dark:border-white/10"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
          <Link href="/" className="ml-auto text-sm text-ink-muted transition-colors hover:text-primary">
            View site →
          </Link>
        </header>

        <div className="flex-1 p-5 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
