/**
 * useAdminGuard
 *
 * Single source of truth for admin route protection.
 *
 * Usage — in any admin page or layout wrapper:
 *
 *   const { ready } = useAdminGuard();
 *   if (!ready) return null; // or a skeleton
 *
 * The hook:
 *  1. Waits for Firebase auth to resolve (loading === false).
 *  2. If the resolved user is NOT an admin, immediately redirects to /admin/login.
 *  3. Returns { ready: true } only once auth is confirmed and the user IS an admin.
 *
 * Why a hook instead of inline useEffect?
 *   AdminShell and login/page.tsx both duplicated this logic. Having two independent
 *   guards that each call router.replace() creates a race: one guard redirects to
 *   /admin while the other simultaneously redirects back to /admin/login, producing
 *   the infinite login loop that was reported.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

interface AdminGuardResult {
  /** True only once auth has resolved AND the current user is confirmed as admin. */
  ready: boolean;
  /** True while Firebase is still initialising — use to show a loading skeleton. */
  loading: boolean;
}

export function useAdminGuard(): AdminGuardResult {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    // Wait until Firebase auth has finished resolving before making any decision.
    if (loading) return;

    if (!isAdmin) {
      // Guard: user is not an admin (either signed out or wrong UID).
      // Mark as redirecting so callers can suppress any render flash.
      setRedirecting(true);
      router.replace("/admin/login");
    }
  }, [loading, isAdmin, router]);

  return {
    ready: !loading && isAdmin && !redirecting,
    loading: loading || redirecting,
  };
}
