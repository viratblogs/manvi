"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FirebaseError } from "firebase/app";
import { authErrorMessage, useAuth } from "@/lib/auth";
import { isFirebaseConfigured } from "@/lib/firebase";
import { profile } from "@/lib/content";

export default function LoginPage() {
  const { login, resetPassword, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"login" | "reset">("login");

  useEffect(() => { if (!loading && isAdmin) router.replace("/admin"); }, [loading, isAdmin, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setNotice(""); setBusy(true);
    try {
      if (mode === "reset") {
        await resetPassword(email);
        setNotice("If an account exists for that address, a reset link is on its way.");
      } else {
        await login(email, password);
        router.replace("/admin");
      }
    } catch (err) {
      setError(authErrorMessage(err instanceof FirebaseError ? err.code : ""));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-sub px-6 dark:bg-[#0B0F16]">
      <div className="w-full max-w-sm">
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

          {!isFirebaseConfigured && (
            <p className="mt-5 rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
              Firebase isn&rsquo;t configured yet. Copy <code>.env.local.example</code> to{" "}
              <code>.env.local</code> and add your project keys, then restart the dev server.
            </p>
          )}

          <form onSubmit={onSubmit} className="mt-7 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Email</span>
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                autoComplete="email" className="field" placeholder="you@example.com"
              />
            </label>

            {mode === "login" && (
              <label className="block">
                <span className="mb-2 block text-sm font-medium">Password</span>
                <input
                  type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password" className="field" placeholder="••••••••"
                />
              </label>
            )}

            {error && (
              <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
                {error}
              </p>
            )}
            {notice && (
              <p className="rounded-lg border border-line bg-surface-sub px-3.5 py-2.5 text-sm text-ink-muted dark:border-white/10 dark:bg-white/5">
                {notice}
              </p>
            )}

            <button type="submit" disabled={busy} className="btn-primary w-full">
              {busy ? "Working…" : mode === "reset" ? "Send reset link" : "Sign in"}
            </button>
          </form>

          <button
            onClick={() => { setMode(mode === "login" ? "reset" : "login"); setError(""); setNotice(""); }}
            className="mt-5 w-full text-center text-sm text-ink-muted transition-colors hover:text-primary"
          >
            {mode === "login" ? "Forgot your password?" : "Back to sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
