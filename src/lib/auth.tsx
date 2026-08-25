"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  type User,
} from "firebase/auth";
import { ADMIN_UIDS, auth } from "./firebase";
import {
  loginWithEmailAndPassword,
  logoutUser,
  setAdminCookie,
  clearAdminCookie,
  isUidAllowed,
} from "./services/auth.service";

// ---------------------------------------------------------------------------
// Custom error for non-admin accounts
// ---------------------------------------------------------------------------

export class AdminNotAuthorizedError extends Error {
  constructor(public readonly uid: string, public readonly email: string) {
    super(`UID ${uid} is not in the admin allow-list.`);
    this.name = "AdminNotAuthorizedError";
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AuthState {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
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
    const unsubscribe = onAuthStateChanged(auth, (resolvedUser) => {
      setUser(resolvedUser);
      if (resolvedUser && isUidAllowed(resolvedUser.uid)) {
        setAdminCookie(resolvedUser.uid);
      } else if (!resolvedUser) {
        clearAdminCookie();
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const isAdmin = !!user && isUidAllowed(user.uid);

  const value: AuthState = {
    user,
    isAdmin,
    loading,
    login: async (email, password) => {
      try {
        const loggedInUser = await loginWithEmailAndPassword(email, password);
        // Synchronously update user state so isAdmin is immediately true before navigation
        setUser(loggedInUser);
        setLoading(false);

        // Inform backend route controller to sync HTTP session cookie
        await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid: loggedInUser.uid, email: loggedInUser.email || email }),
        }).catch((err) => console.warn("[Auth] API login sync warning:", err));
      } catch (err: unknown) {
        if (err instanceof Error && err.message.startsWith("UNAUTHORIZED_UID:")) {
          const parts = err.message.split(":");
          const uid = parts[1] || "";
          const userEmail = parts[2] || email;
          throw new AdminNotAuthorizedError(uid, userEmail);
        }
        throw err;
      }
    },
    logout: async () => {
      setUser(null);
      await logoutUser();
      await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    },
    resetPassword: async (email) => {
      await sendPasswordResetEmail(auth, email);
    },
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
