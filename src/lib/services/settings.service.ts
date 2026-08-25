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

export async function getSiteSettings(): Promise<SiteSettings> {
  // 1. Try direct Firestore read first (live production persistence)
  try {
    const snap = await getDoc(doc(db, "settings", "site"));
    if (snap.exists()) {
      const data = snap.data() as Partial<SiteSettings>;
      return {
        ...DEFAULT_SETTINGS,
        ...data,
      };
    }
  } catch (err) {
    console.warn("[SettingsService] Direct Firestore read error:", err);
  }

  // 2. Fallback to API route for local environment
  try {
    const origin = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");
    const res = await fetch(`${origin}/api/settings?t=${Date.now()}`, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
        "Pragma": "no-cache",
      },
    });
    if (res.ok) {
      const json = await res.json();
      if (json.settings) return json.settings;
    }
  } catch (err) {
    console.warn("[SettingsService] API get error:", err);
  }

  return DEFAULT_SETTINGS;
}

export async function updateSiteSettings(patch: Partial<SiteSettings>): Promise<SiteSettings> {
  const current = await getSiteSettings();
  const updatedSettings: SiteSettings = {
    ...current,
    ...patch,
    updatedAt: Date.now(),
  };

  // 1. Write directly to Firestore from the client (authenticated Firebase user session)
  try {
    await setDoc(doc(db, "settings", "site"), updatedSettings, { merge: true });
  } catch (err) {
    console.warn("[SettingsService] Direct Firestore write warning:", err);
  }

  // 2. Sync to API route for local store.json persistence
  try {
    const origin = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");
    await fetch(`${origin}/api/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedSettings),
    });
  } catch (err) {
    console.warn("[SettingsService] API PUT sync warning:", err);
  }

  return updatedSettings;
}
