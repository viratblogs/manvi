/**
 * Admin Login Page
 *
 * Two modes: "login" (default) and "reset" (password reset email).
 *
 * Auth flow (login mode):
 *  1. User submits credentials → onSubmit calls login().
 *  2. login() (in auth.tsx) calls Firebase signInWithEmailAndPassword.
 *  3a. If the credentials are wrong → FirebaseError is thrown → error banner shown.
 *  3b. If credentials are valid but UID is not in ADMIN_UIDS →
 *      login() signs the user back out and throws AdminNotAuthorizedError →
 *      error banner shown with the user's UID for easy debugging.
 *  3c. If credentials are valid AND UID is in ADMIN_UIDS → login() returns.
 *      onAuthStateChanged fires → AuthProvider sets isAdmin=true →
 *      the useEffect below detects this and redirects to /admin.
 *
 * Why the redirect is in a useEffect (not in onSubmit):
 *  Calling router.replace immediately after await login() races against the async
 *  onAuthStateChanged propagation. AdminShell renders before isAdmin is true →
 *  its guard redirects back to login. The useEffect waits for auth state to settle.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FirebaseError } from "firebase/app";
import { Loader2 } from "lucide-react";
import { AdminNotAuthorizedError, authErrorMessage, useAuth } from "@/lib/auth";
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
  // Loading skeleton — shown while Firebase resolves the persisted session.
  // Prevents a flash of the login form before we know whether to redirect.
  // ---------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-sub dark:bg-[#0B0F16]">
        <Loader2 className="h-6 w-6 animate-spin text-ink-muted" aria-label="Checking session…" />
      </div>
    );
  }

  // If already signed in as admin (e.g. navigated back to /admin/login), return
  // null to prevent flashing the form while the useEffect redirect fires.
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
        // login() handles three cases internally:
        //  - Wrong credentials → throws FirebaseError (caught below)
        //  - Valid credentials, UID not in allow-list → throws AdminNotAuthorizedError (caught below)
        //  - Valid credentials, UID allowed → returns. useEffect above handles redirect.
        await login(email, password);
      }
    } catch (err) {
      if (err instanceof AdminNotAuthorizedError) {
        // Firebase accepted the password, but this account is not an admin.
        // login() has already signed them out. Show an actionable error with their UID.
        setError(
          `Access denied — ${err.email} is not on the admin allow-list. ` +
          `Add UID "${err.uid}" to NEXT_PUBLIC_ADMIN_UID in .env.local (local) ` +
          `or in your Vercel project's Environment Variables (production), then redeploy.`
        );
      } else {
        // Wrong password, no account, network error, etc.
        const code = err instanceof FirebaseError ? err.code : "";
        setError(authErrorMessage(code));
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

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
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

          {/* Firebase not yet configured */}
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
