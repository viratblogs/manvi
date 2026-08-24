import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const required = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** True only when every NEXT_PUBLIC_FIREBASE_* variable is present. */
export const isFirebaseConfigured = Object.values(required).every(Boolean);

/* Placeholders keep `next build` from crashing when env vars aren't set — for example
   on a fresh clone or in CI. They are never valid credentials: any real call fails,
   and the admin login surfaces a setup notice instead of a cryptic Firebase error. */
const firebaseConfig = {
  apiKey: required.apiKey ?? "missing-api-key",
  authDomain: required.authDomain ?? "missing.firebaseapp.com",
  projectId: required.projectId ?? "missing-project",
  storageBucket: required.storageBucket ?? "missing.appspot.com",
  messagingSenderId: required.messagingSenderId ?? "000000000000",
  appId: required.appId ?? "1:000000000000:web:0000000000000000000000",
};

if (typeof window !== "undefined" && !isFirebaseConfigured) {
  console.warn(
    "[firebase] Missing NEXT_PUBLIC_FIREBASE_* environment variables. " +
      "Copy .env.local.example to .env.local and fill it in from the Firebase console.",
  );
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID ?? "";
export default app;
