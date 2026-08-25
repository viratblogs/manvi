import { caseStudies as defaultCaseStudies } from "../content";
import type { FirestoreCaseStudy } from "@/types";

export async function getAllCaseStudies(): Promise<FirestoreCaseStudy[]> {
  try {
    const origin = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");
    const res = await fetch(`${origin}/api/case-studies`, { cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.caseStudies) && json.caseStudies.length > 0) {
        return json.caseStudies;
      }
    }
  } catch (err) {
    console.warn("[CaseStudiesService] API get error:", err);
  }

  return defaultCaseStudies.map((cs, idx) => ({
    id: `static-${cs.slug}`,
    ...cs,
    coverImage: "",
    createdAt: Date.now() - (idx * 1000),
    updatedAt: Date.now() - (idx * 1000),
  }));
}

export async function getCaseStudyBySlug(slug: string): Promise<FirestoreCaseStudy | null> {
  const all = await getAllCaseStudies();
  const found = all.find((cs) => cs.slug === slug);
  if (found) return found;

  const def = defaultCaseStudies.find((c) => c.slug === slug);
  if (def) {
    return {
      id: `static-${def.slug}`,
      ...def,
      coverImage: "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }
  return null;
}

export async function getCaseStudyById(id: string): Promise<FirestoreCaseStudy | null> {
  try {
    const origin = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");
    const res = await fetch(`${origin}/api/case-studies/${id}`, { cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      if (json.caseStudy) return json.caseStudy;
    }
  } catch {
    // fallback
  }

  const all = await getAllCaseStudies();
  return all.find((cs) => cs.id === id) || null;
}

export async function createCaseStudy(data: Partial<FirestoreCaseStudy>): Promise<string> {
  const origin = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");
  const res = await fetch(`${origin}/api/case-studies`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok || json.error) {
    throw new Error(json.error || "Failed to create case study.");
  }
  return json.id;
}

export async function updateCaseStudy(id: string, data: Partial<FirestoreCaseStudy>): Promise<void> {
  const origin = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");
  const res = await fetch(`${origin}/api/case-studies/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok || json.error) {
    throw new Error(json.error || "Failed to update case study.");
  }
}

export async function deleteCaseStudy(id: string): Promise<void> {
  const origin = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");
  const res = await fetch(`${origin}/api/case-studies/${id}`, {
    method: "DELETE",
  });
  const json = await res.json();
  if (!res.ok || json.error) {
    throw new Error(json.error || "Failed to delete case study.");
  }
}
