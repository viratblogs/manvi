"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FirebaseError } from "firebase/app";
import { Loader2 } from "lucide-react";
import { AdminNotAuthorizedError, authErrorMessage, useAuth } from "@/lib/auth";
import { isFirebaseConfigured } from "@/lib/firebase";
import { profile } from "@/lib/content";

type PageMode = "login" | "reset";

function LoginFormContent() {
  const { login, resetPassword, isAdmin, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<PageMode>("login");

  // Read URL query parameters for redirected error messages
  useEffect(() => {
    const errType = searchParams.get("error");
    const uid = searchParams.get("uid");
    const userEmail = searchParams.get("email");

    if (errType === "unauthorized" && uid) {
      setError(
        `Access denied — ${userEmail || "Your account"} (UID: "${uid}") is not in the admin allow-list. ` +
        `Add this UID to NEXT_PUBLIC_ADMIN_UID in your environment configuration to grant access.`
      );
    }
  }, [searchParams]);

  // Redirect once auth settles and the user IS an admin
  useEffect(() => {
    if (!loading && isAdmin) {
      router.replace("/admin");
    }
  }, [loading, isAdmin, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-sub dark:bg-[#0B0F16]">
        <Loader2 className="h-6 w-6 animate-spin text-ink-muted" aria-label="Checking session…" />
      </div>
    );
  }

  if (isAdmin) return null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);

    try {
      if (mode === "reset") {
        await resetPassword(email);
        setNotice("If an account exists for that address, a reset link is on its way.");
      } else {
        await login(email, password);
        // Direct replace on successful login
        router.replace("/admin");
      }
    } catch (err: unknown) {
      if (err instanceof AdminNotAuthorizedError) {
        setError(
          `Access denied — ${err.email} is not on the admin allow-list. ` +
          `Add UID "${err.uid}" to NEXT_PUBLIC_ADMIN_UID in .env.local (local) ` +
          `or in your deployment environment variables, then restart/redeploy.`
        );
      } else if (err instanceof FirebaseError) {
        setError(authErrorMessage(err.code));
      } else if (err instanceof Error) {
        setError(err.message || "Sign-in failed. Check credentials and try again.");
      } else {
        setError("An unexpected authentication error occurred.");
      }
    } finally {
      setBusy(false);
    }
  }

  function switchMode(next: PageMode) {
    setMode(next);
    setError("");
    setNotice("");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-sub px-6 dark:bg-[#0B0F16]">
      <div className="w-full max-w-sm">
        {/* Brand mark */}
        <Link href="/" className="mb-10 block text-center">
          <div className="font-display text-xl font-semibold">{profile.name}</div>
          <div className="mt-1.5 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-ink-muted">
            Content dashboard
          </div>
        </Link>

        <div className="rounded-xl border border-line bg-surface p-8 shadow-card dark:border-white/10 dark:bg-white/[0.03]">
          <h1 className="font-display text-xl font-semibold">
            {mode === "reset" ? "Reset your password" : "Sign in"}
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            {mode === "reset"
              ? "Enter the admin email and we'll send a reset link."
              : "This dashboard is restricted to the site owner."}
          </p>

          {/* Firebase configuration warning */}
          {!isFirebaseConfigured && (
            <p className="mt-5 rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
              Firebase isn&rsquo;t configured yet. Copy <code>.env.local.example</code> to{" "}
              <code>.env.local</code> and add your project keys, then restart the dev server.
            </p>
          )}

          <form onSubmit={onSubmit} className="mt-7 space-y-4" noValidate>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Email</span>
              <input
                id="admin-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="field"
                placeholder="you@example.com"
              />
            </label>

            {mode === "login" && (
              <label className="block">
                <span className="mb-2 block text-sm font-medium">Password</span>
                <input
                  id="admin-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="field"
                  placeholder="••••••••"
                />
              </label>
            )}

            {/* Error banner */}
            {error && (
              <p
                role="alert"
                aria-live="assertive"
                className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300"
              >
                {error}
              </p>
            )}

            {/* Notice banner */}
            {notice && (
              <p
                role="status"
                aria-live="polite"
                className="rounded-lg border border-line bg-surface-sub px-3.5 py-2.5 text-sm text-ink-muted dark:border-white/10 dark:bg-white/5"
              >
                {notice}
              </p>
            )}

            <button
              type="submit"
              id="admin-submit"
              disabled={busy}
              className="btn-primary w-full"
            >
              {busy ? "Working…" : mode === "reset" ? "Send reset link" : "Sign in"}
            </button>
          </form>

          <button
            onClick={() => switchMode(mode === "login" ? "reset" : "login")}
            className="mt-5 w-full text-center text-sm text-ink-muted transition-colors hover:text-primary"
          >
            {mode === "login" ? "Forgot your password?" : "Back to sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-surface-sub dark:bg-[#0B0F16]">
          <Loader2 className="h-6 w-6 animate-spin text-ink-muted" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
