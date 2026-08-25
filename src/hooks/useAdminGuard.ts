"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

interface AdminGuardResult {
  ready: boolean;
  loading: boolean;
}

export function useAdminGuard(): AdminGuardResult {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!isAdmin) {
      setRedirecting(true);
      if (user && !isAdmin) {
        // Logged in user but UID not allowed
        router.replace(`/admin/login?error=unauthorized&uid=${encodeURIComponent(user.uid)}&email=${encodeURIComponent(user.email || "")}`);
      } else {
        router.replace("/admin/login");
      }
    }
  }, [loading, user, isAdmin, router]);

  return {
    ready: !loading && isAdmin && !redirecting,
    loading: loading || redirecting,
  };
}
