import type { SiteSettings } from "@/types";

export const DEFAULT_SETTINGS: SiteSettings = {
  heroImageUrl: "/m.png",
  updatedAt: Date.now(),
};

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const origin = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");
    const res = await fetch(`${origin}/api/settings`, { cache: "no-store" });
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
