/**
 * Admin Login Page
 *
 * Two modes: "login" (default) and "reset" (password reset email).
 *
 * Auth flow (login mode):
 *  1. User submits credentials.
 *  2. `login()` calls Firebase signInWithEmailAndPassword.
 *  3. On success, Firebase fires onAuthStateChanged → AuthProvider updates
 *     isAdmin → the useEffect below detects isAdmin===true and redirects.
 *
 * IMPORTANT — Why we do NOT call router.replace("/admin") directly inside onSubmit:
 *  Calling router.replace immediately after await login() races against the async
 *  onAuthStateChanged propagation. When the browser navigates to /admin, AdminShell
 *  renders before isAdmin has been set to true, so its guard sees !isAdmin and
 *  redirects straight back to /admin/login — producing the infinite login loop.
 *  Letting the useEffect below handle the redirect is the correct, event-driven pattern.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FirebaseError } from "firebase/app";
import { Loader2 } from "lucide-react";
import { authErrorMessage, useAuth } from "@/lib/auth";
import { isFirebaseConfigured } from "@/lib/firebase";
import { profile } from "@/lib/content";

type PageMode = "login" | "reset";

export default function LoginPage() {
  const { login, resetPassword, isAdmin, loading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<PageMode>("login");

  // ---------------------------------------------------------------------------
  // Redirect once auth resolves and the user IS an admin.
  // This is the ONLY place that navigates to /admin — driven by auth state,
  // not by the submit handler, to avoid the race condition described above.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!loading && isAdmin) {
      router.replace("/admin");
    }
  }, [loading, isAdmin, router]);

  // ---------------------------------------------------------------------------
  // While auth is still initialising, show a minimal loading state so the form
  // doesn't flash before we know whether to redirect.
  // ---------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-sub dark:bg-[#0B0F16]">
        <Loader2 className="h-6 w-6 animate-spin text-ink-muted" aria-label="Checking session…" />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // If auth has resolved and isAdmin is already true (e.g. user navigated back
  // to /admin/login while still signed in), render nothing while the useEffect
  // redirect kicks in — prevents a flash of the login form.
  // ---------------------------------------------------------------------------
  if (isAdmin) return null;

  // ---------------------------------------------------------------------------
  // Form submission
  // ---------------------------------------------------------------------------
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
        // Sign in only. Do NOT call router.replace here.
        // The useEffect above handles the redirect once onAuthStateChanged confirms isAdmin.
        await login(email, password);
      }
    } catch (err) {
      const code = err instanceof FirebaseError ? err.code : "";
      setError(authErrorMessage(code));
    } finally {
      setBusy(false);
    }
  }

  function switchMode(next: PageMode) {
    setMode(next);
    setError("");
    setNotice("");
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-sub px-6 dark:bg-[#0B0F16]">
      <div className="w-full max-w-sm">
        {/* Site logo / brand mark */}
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

          {/* Firebase not yet configured — show a setup notice instead of a cryptic error */}
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

            {/* Error banner — shown on wrong credentials or network failure */}
            {error && (
              <p
                role="alert"
                aria-live="assertive"
                className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300"
              >
                {error}
              </p>
            )}

            {/* Notice banner — shown after password reset email is sent */}
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
              {busy
                ? "Working…"
                : mode === "reset"
                ? "Send reset link"
                : "Sign in"}
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
