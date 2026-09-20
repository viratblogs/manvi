import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { SiteSettings, CompetencyGroup } from "@/types";

export const DEFAULT_COMPETENCIES_GROUPS: CompetencyGroup[] = [
  { group: "Strategy", items: ["Strategic planning", "Business transformation", "Stakeholder management", "Market research"] },
  { group: "Operations", items: ["Hospital administration", "Clinical operations", "Capacity planning", "Process improvement"] },
  { group: "Analytics", items: ["Healthcare analytics", "KPI management", "Performance dashboards", "Feasibility modelling"] },
  { group: "Technology", items: ["EHR systems", "Digital health", "Health informatics", "Workflow automation"] },
  { group: "Quality & risk", items: ["NABH standards", "Quality management", "Risk management", "Clinical audit"] },
  { group: "Change", items: ["Organisational change", "Training design", "Adoption strategy", "Transformation roadmaps"] },
];

export const DEFAULT_SETTINGS: SiteSettings = {
  heroImageUrl: "/m.png",
  bioStatement: "Bridging healthcare excellence, strategic leadership, and data-driven decision making to optimize patient care and hospital operations.",
  skills: [
    "Market Research",
    "Agile Management",
    "Hospital Operations",
    "Healthcare Strategy",
    "Digital Health & EHR",
    "Process Improvement",
    "Capacity Planning",
    "NABH Quality Standards"
  ],
  competenciesGroups: DEFAULT_COMPETENCIES_GROUPS,
  professionalJourney: `2021 – 2023 | Bachelor of Arts
Jai Narain Vyas University, Jodhpur
Built the analytical and research foundation — qualitative methods, structured writing, and rigorous evidence interrogation.

2023 – 2025 | Healthcare Strategy & Consulting Projects
Independent & Applied Research
Engaged in competitive landscape studies, primary interviews with clinical staff, and feasibility analysis for healthcare service lines.

2025 – 2027 | MBA — Hospital & Healthcare Management
Symbiosis International University, Pune
Specialising in hospital operations, healthcare quality systems, health informatics, and strategy. 10+ applied projects across clinical workflows and market entry.`,
  updatedAt: Date.now(),
};

// ---------------------------------------------------------------------------
// Browser localStorage cache helpers (for instant UI on revisit)
// ---------------------------------------------------------------------------

const LOCAL_STORAGE_KEY = "site_settings_cache_v2";

export function getCachedHeroImageUrl(): string {
  if (typeof window === "undefined") return "";
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SiteSettings>;
      if (parsed?.heroImageUrl) return parsed.heroImageUrl;
    }
  } catch {
    // ignore
  }
  return "";
}

function getLocalCache(): SiteSettings | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as SiteSettings;
  } catch {
    // ignore
  }
  return null;
}

function saveLocalCache(settings: SiteSettings) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

function mergeWithDefaults(data: Partial<SiteSettings>): SiteSettings {
  return {
    ...DEFAULT_SETTINGS,
    ...data,
    skills: Array.isArray(data.skills) && data.skills.length > 0
      ? data.skills
      : DEFAULT_SETTINGS.skills,
    competenciesGroups:
      Array.isArray(data.competenciesGroups) && data.competenciesGroups.length > 0
        ? data.competenciesGroups
        : DEFAULT_COMPETENCIES_GROUPS,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

import { resolveImgBbUrl } from "@/lib/services/media.service";

/**
 * Fetch site settings. Reads from Firestore as the single source of truth.
 * Falls back to /api/settings, then localStorage cache, then defaults.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  // 1. Try Firestore direct read (works in both local and production)
  try {
    const snap = await getDoc(doc(db, "settings", "site"));
    if (snap.exists()) {
      const merged = mergeWithDefaults(snap.data() as Partial<SiteSettings>);
      saveLocalCache(merged);
      return merged;
    }
  } catch (err) {
    console.warn("[SettingsService] Firestore direct read error:", err);
  }

  // 2. Try Next.js API route as a server-side proxy fallback
  if (typeof window !== "undefined") {
    try {
      const res = await fetch(`/api/settings?t=${Date.now()}`, { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json.settings && Object.keys(json.settings).length > 0) {
          const merged = mergeWithDefaults(json.settings);
          saveLocalCache(merged);
          return merged;
        }
      }
    } catch {
      // ignore
    }
  }

  // 3. Fallback to browser localStorage cache (offline / cold start)
  const cached = getLocalCache();
  if (cached) {
    return mergeWithDefaults(cached);
  }

  // 4. Hardcoded defaults
  return DEFAULT_SETTINGS;
}

/**
 * Persist updated settings to Firestore. Dual-syncs with /api/settings
 * and updates local cache only after successful persistence.
 */
export async function updateSiteSettings(patch: Partial<SiteSettings>): Promise<SiteSettings> {
  const current = await getSiteSettings();

  // If heroImageUrl is an ImgBB link, resolve it to direct CDN URL
  let resolvedHeroImage = patch.heroImageUrl !== undefined ? patch.heroImageUrl : current.heroImageUrl;
  if (resolvedHeroImage && resolvedHeroImage.includes("ibb.co/") && !resolvedHeroImage.includes("i.ibb.co/")) {
    try {
      resolvedHeroImage = await resolveImgBbUrl(resolvedHeroImage);
    } catch {
      // keep as is
    }
  }

  const updated: SiteSettings = {
    ...current,
    ...patch,
    heroImageUrl: resolvedHeroImage,
    updatedAt: Date.now(),
  };

  const cleanPayload = JSON.parse(JSON.stringify(updated));

  // 1. Persist directly to Firestore (primary source of truth)
  await setDoc(doc(db, "settings", "site"), cleanPayload, { merge: true });

  // 2. Dual-sync to server route in background
  if (typeof window !== "undefined") {
    fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cleanPayload),
    }).catch((e) => console.warn("[SettingsService] API sync notice:", e));
  }

  // 3. Cache in localStorage only AFTER persistence succeeds
  saveLocalCache(updated);

  return updated;
}
