import type { Achievement } from "@/types";

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: "static-cert-1",
    title: "NABH Hospital Accreditation & Quality Management",
    organisation: "Symbiosis Institute of Health Sciences",
    year: 2025,
    category: "Certification",
    description: "Quality standards, clinical audits, patient safety protocols, and hospital compliance framework.",
    imageUrl: "",
    credentialUrl: "",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "static-cert-2",
    title: "Healthcare Analytics & Data-Driven Operations",
    organisation: "Healthcare Executive Education",
    year: 2024,
    category: "Academic",
    description: "Statistical modeling for bed turnaround time, staffing capacity planning, and outpatient bottleneck analysis.",
    imageUrl: "",
    credentialUrl: "",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

export async function getAchievements(): Promise<Achievement[]> {
  try {
    const origin = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");
    const res = await fetch(`${origin}/api/achievements`, { cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.achievements) && json.achievements.length > 0) {
        return json.achievements;
      }
    }
  } catch (err) {
    console.warn("[AchievementsService] API get error:", err);
  }
  return DEFAULT_ACHIEVEMENTS;
}

export async function getAchievementById(id: string): Promise<Achievement | null> {
  try {
    const origin = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");
    const res = await fetch(`${origin}/api/achievements/${id}`, { cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      if (json.achievement) return json.achievement;
    }
  } catch {
    // fallback
  }
  const all = await getAchievements();
  return all.find((a) => a.id === id) || null;
}

export async function createAchievement(
  data: Omit<Achievement, "id" | "createdAt" | "updatedAt">,
): Promise<string> {
  const origin = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");
  const res = await fetch(`${origin}/api/achievements`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok || json.error) {
    throw new Error(json.error || "Failed to create achievement.");
  }
  return json.id;
}

export async function updateAchievement(
  id: string,
  data: Partial<Omit<Achievement, "id" | "createdAt">>,
): Promise<void> {
  const origin = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");
  const res = await fetch(`${origin}/api/achievements/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok || json.error) {
    throw new Error(json.error || "Failed to update achievement.");
  }
}

export async function deleteAchievement(id: string): Promise<void> {
  const origin = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");
  const res = await fetch(`${origin}/api/achievements/${id}`, {
    method: "DELETE",
  });
  const json = await res.json();
  if (!res.ok || json.error) {
    throw new Error(json.error || "Failed to delete achievement.");
  }
}
