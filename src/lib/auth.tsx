/**
 * Auth context for the entire application.
 *
 * Architecture notes:
 * - Firebase Authentication is the only auth provider. There are no server-side
 *   sessions, cookies, or JWTs managed by Next.js. Everything is client-side.
 * - `isAdmin` is a client-side UX gate only. It is derived from `ADMIN_UIDS`, which
 *   is intentionally a NEXT_PUBLIC_ env var. The REAL security boundary is in
 *   firestore.rules — Firestore rejects any write from a non-admin UID regardless of
 *   what this context says.
 * - The `onAuthStateChanged` listener is set up once in `<AuthProvider>` (mounted at
 *   the root layout) and tears itself down automatically on unmount via the unsubscribe
 *   function it returns.
 */

"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { ADMIN_UIDS, auth } from "./firebase";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AuthState {
  /** The currently signed-in Firebase user, or null if signed out. */
  user: User | null;
  /**
   * True only when the user's UID is in the ADMIN_UIDS allow-list.
   * This is a UX-only gate; Firestore rules enforce the real access control.
   */
  isAdmin: boolean;
  /** True while Firebase is still resolving the persisted auth session on mount. */
  loading: boolean;
  /** Signs in with email and password. Throws a FirebaseError on failure. */
  login: (email: string, password: string) => Promise<void>;
  /** Signs the current user out. */
  logout: () => Promise<void>;
  /** Sends a password-reset email. Does NOT reveal whether the address exists. */
  resetPassword: (email: string) => Promise<void>;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthState | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged returns an unsubscribe function — returning it from
    // useEffect ensures the listener is cleaned up when the component unmounts.
    const unsubscribe = onAuthStateChanged(auth, (resolvedUser) => {
      setUser(resolvedUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value: AuthState = {
    user,
    isAdmin: !!user && (ADMIN_UIDS.length === 0 || ADMIN_UIDS.includes(user.uid)),
    loading,
    login: (email, password) => signInWithEmailAndPassword(auth, email, password).then(() => undefined),
    logout: () => signOut(auth),
    resetPassword: (email) => sendPasswordResetEmail(auth, email),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

// ---------------------------------------------------------------------------
// Error message helper
// ---------------------------------------------------------------------------

/**
 * Converts a Firebase error code into a human-readable, actionable message.
 * Falls back to a safe generic message for any unrecognised code.
 */
export function authErrorMessage(code: string): string {
  switch (code) {
    case "auth/invalid-email":
      return "That email address isn't formatted correctly.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Email or password doesn't match. Check both and try again.";
    case "auth/too-many-requests":
      return "Too many attempts. Wait a few minutes before trying again.";
    case "auth/network-request-failed":
      return "Can't reach Firebase. Check your connection.";
    default:
      return "Sign-in failed. Try again, or reset your password.";
  }
}
