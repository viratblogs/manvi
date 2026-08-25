import type { SiteSettings } from "@/types";

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
  try {
    const origin = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");
    const res = await fetch(`${origin}/api/settings?t=${Date.now()}`, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
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
  const origin = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");
  const res = await fetch(`${origin}/api/settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  const json = await res.json();
  if (!res.ok || json.error) {
    throw new Error(json.error || "Failed to update profile settings.");
  }
  return json.settings || { ...DEFAULT_SETTINGS, ...patch, updatedAt: Date.now() };
}
