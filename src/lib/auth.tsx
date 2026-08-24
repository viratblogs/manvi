"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword,
  signOut, type User,
} from "firebase/auth";
import { ADMIN_UID, auth } from "./firebase";

interface AuthState {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => onAuthStateChanged(auth, (u) => { setUser(u); setLoading(false); }), []);

  const value: AuthState = {
    user,
    // Client-side gate for UX only. The real gate is in firestore.rules.
    isAdmin: !!user && (!ADMIN_UID || user.uid === ADMIN_UID),
    loading,
    login: async (email, password) => { await signInWithEmailAndPassword(auth, email, password); },
    logout: async () => { await signOut(auth); },
    resetPassword: async (email) => { await sendPasswordResetEmail(auth, email); },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

/** Turns Firebase error codes into something a person can act on. */
export function authErrorMessage(code: string) {
  switch (code) {
    case "auth/invalid-email": return "That email address isn't formatted correctly.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential": return "Email or password doesn't match. Check both and try again.";
    case "auth/too-many-requests": return "Too many attempts. Wait a few minutes before trying again.";
    case "auth/network-request-failed": return "Can't reach Firebase. Check your connection.";
    default: return "Sign-in failed. Try again, or reset your password.";
  }
}
