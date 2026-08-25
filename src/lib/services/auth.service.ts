import { setPersistence, browserLocalPersistence, signOut, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth, ADMIN_UIDS } from "../firebase";

export const ADMIN_COOKIE_NAME = "admin_session";

export function isUidAllowed(uid: string): boolean {
  if (ADMIN_UIDS.length === 0) return true;
  return ADMIN_UIDS.includes(uid);
}

export function setAdminCookie(uid: string) {
  if (typeof document === "undefined") return;
  const secureFlag = window.location.protocol === "https:" ? "; Secure" : "";
  // 7 day expiration
  const maxAge = 60 * 60 * 24 * 7;
  document.cookie = `${ADMIN_COOKIE_NAME}=${encodeURIComponent(uid)}; path=/; max-age=${maxAge}; SameSite=Lax${secureFlag}`;
}

export function clearAdminCookie() {
  if (typeof document === "undefined") return;
  const secureFlag = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${ADMIN_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax${secureFlag}`;
}

export async function loginWithEmailAndPassword(email: string, pass: string) {
  // Ensure session persistence is explicitly set to local storage before auth
  await setPersistence(auth, browserLocalPersistence);
  const credential = await signInWithEmailAndPassword(auth, email, pass);
  const uid = credential.user.uid;

  if (!isUidAllowed(uid)) {
    await signOut(auth);
    clearAdminCookie();
    throw new Error(`UNAUTHORIZED_UID:${uid}:${credential.user.email ?? email}`);
  }

  setAdminCookie(uid);
  return credential.user;
}

export async function logoutUser() {
  clearAdminCookie();
  await signOut(auth);
}

export async function requestPasswordReset(email: string) {
  await sendPasswordResetEmail(auth, email);
}
