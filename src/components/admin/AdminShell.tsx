/**
 * AdminShell
 *
 * The persistent layout wrapper for every admin page. Renders the sidebar,
 * header, mobile nav overlay, and the sign-out button.
 *
 * Route protection is delegated entirely to `useAdminGuard` — a single shared
 * hook that handles the loading state and the redirect-if-not-admin logic.
 * This eliminates the previous duplication with login/page.tsx and ensures there
 * is only ONE place that can call router.replace("/admin/login").
 */

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  Loader2,
  LogOut,
  Mail,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { cn } from "@/lib/utils";
import { profile } from "@/lib/content";

// ---------------------------------------------------------------------------
// Navigation config — add new admin sections here only.
// ---------------------------------------------------------------------------

interface NavLink {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  /** When true, the link is only active on an exact pathname match. */
  exact?: boolean;
}

const NAV_LINKS: NavLink[] = [
  { href: "/admin",        label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/blogs",  label: "Blogs",     icon: FileText },
  { href: "/admin/media",  label: "Media",     icon: ImageIcon },
  { href: "/admin/leads",  label: "Leads",     icon: Mail },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const { user, logout } = useAuth();
  const { ready, loading } = useAdminGuard();
  const router = useRouter();
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);

  // Close the mobile nav on route change.
  useEffect(() => { setNavOpen(false); }, [pathname]);

  // ---------------------------------------------------------------------------
  // Loading / redirect states
  // ---------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-ink-muted">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Checking session…
      </div>
    );
  }

  // useAdminGuard is already redirecting to /admin/login; render nothing to avoid flash.
  if (!ready) return null;

  // ---------------------------------------------------------------------------
  // Sign-out handler
  // ---------------------------------------------------------------------------

  async function handleSignOut() {
    await logout();
    router.replace("/admin/login");
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex min-h-screen bg-surface-sub dark:bg-[#0B0F16]">
      {/* ------------------------------------------------------------------ */}
      {/* Sidebar                                                              */}
      {/* ------------------------------------------------------------------ */}
      <aside
        aria-label="Admin navigation"
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[#0F1520] text-white transition-transform duration-300 ease-premium lg:translate-x-0",
          navOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Brand */}
        <div className="border-b border-white/10 px-6 py-6">
          <div className="font-display text-lg font-semibold">{profile.name}</div>
          <div className="mt-1 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-white/40">
            Content dashboard
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 space-y-1 p-4" aria-label="Admin sections">
          {NAV_LINKS.map((link) => {
            const isActive = link.exact
              ? pathname === link.href
              : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm transition-colors duration-200",
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:bg-white/5 hover:text-white",
                )}
              >
                <link.icon className="h-4 w-4" aria-hidden />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer: user email + sign-out */}
        <div className="border-t border-white/10 p-4">
          <div className="truncate px-3.5 pb-3 text-xs text-white/40" title={user?.email ?? ""}>
            {user?.email}
          </div>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Sign out
          </button>
        </div>
      </aside>

      {/* ------------------------------------------------------------------ */}
      {/* Mobile nav overlay — closes sidebar on outside click                */}
      {/* ------------------------------------------------------------------ */}
      {navOpen && (
        <div
          role="presentation"
          aria-hidden
          className="fixed inset-0 z-30 bg-ink/40 lg:hidden"
          onClick={() => setNavOpen(false)}
        />
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Main content area                                                    */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-line bg-surface/85 px-5 backdrop-blur-xl lg:px-8 dark:border-white/10 dark:bg-[#0B0F16]/85">
          <button
            onClick={() => setNavOpen((v) => !v)}
            aria-label={navOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={navOpen}
            aria-controls="admin-sidebar"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-line lg:hidden dark:border-white/10"
          >
            {navOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>

          <Link
            href="/"
            className="ml-auto text-sm text-ink-muted transition-colors hover:text-primary"
          >
            View site →
          </Link>
        </header>

        {/* Page content */}
        <main id="main" className="flex-1 p-5 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
