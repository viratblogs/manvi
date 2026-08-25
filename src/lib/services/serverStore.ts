import fs from "fs";
import path from "path";
import type { SiteSettings, CompetencyGroup, Achievement, FirestoreCaseStudy, MediaAsset } from "@/types";

interface StoreData {
  settings: SiteSettings;
  achievements: Achievement[];
  caseStudies: FirestoreCaseStudy[];
  media: MediaAsset[];
}

const DATA_DIR = path.join(process.cwd(), "src", "data");
const STORE_FILE = path.join(DATA_DIR, "store.json");

const DEFAULT_COMPETENCIES_GROUPS: CompetencyGroup[] = [
  { group: "Strategy", items: ["Strategic planning", "Business transformation", "Stakeholder management", "Market research"] },
  { group: "Operations", items: ["Hospital administration", "Clinical operations", "Capacity planning", "Process improvement"] },
  { group: "Analytics", items: ["Healthcare analytics", "KPI management", "Performance dashboards", "Feasibility modelling"] },
  { group: "Technology", items: ["EHR systems", "Digital health", "Health informatics", "Workflow automation"] },
  { group: "Quality & risk", items: ["NABH standards", "Quality management", "Risk management", "Clinical audit"] },
  { group: "Change", items: ["Organisational change", "Training design", "Adoption strategy", "Transformation roadmaps"] },
];

const DEFAULT_STORE: StoreData = {
  settings: {
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
  },
  achievements: [
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
  ],
  caseStudies: [],
  media: [],
};

function ensureStoreFile(): StoreData {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(STORE_FILE)) {
      fs.writeFileSync(STORE_FILE, JSON.stringify(DEFAULT_STORE, null, 2), "utf-8");
      return DEFAULT_STORE;
    }
    const content = fs.readFileSync(STORE_FILE, "utf-8");
    const parsed = JSON.parse(content) as StoreData;
    return {
      settings: {
        ...DEFAULT_STORE.settings,
        ...(parsed.settings || {}),
      },
      achievements: Array.isArray(parsed.achievements) ? parsed.achievements : DEFAULT_STORE.achievements,
      caseStudies: Array.isArray(parsed.caseStudies) ? parsed.caseStudies : DEFAULT_STORE.caseStudies,
      media: Array.isArray(parsed.media) ? parsed.media : DEFAULT_STORE.media,
    };
  } catch (err) {
    console.warn("[ServerStore] Error reading store.json, using default in-memory fallback:", err);
    return DEFAULT_STORE;
  }
}

function writeStoreFile(data: StoreData): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("[ServerStore] Error writing to store.json:", err);
  }
}

export const serverStore = {
  getSettings(): SiteSettings {
    const store = ensureStoreFile();
    return store.settings;
  },

  updateSettings(patch: Partial<SiteSettings>): SiteSettings {
    const store = ensureStoreFile();
    store.settings = {
      ...store.settings,
      ...patch,
      updatedAt: Date.now(),
    };
    writeStoreFile(store);
    return store.settings;
  },

  getAchievements(): Achievement[] {
    const store = ensureStoreFile();
    return store.achievements;
  },

  saveAchievement(data: Partial<Achievement>): Achievement {
    const store = ensureStoreFile();
    const now = Date.now();

    if (data.id) {
      const idx = store.achievements.findIndex((a) => a.id === data.id);
      if (idx !== -1) {
        store.achievements[idx] = {
          ...store.achievements[idx],
          ...data,
          updatedAt: now,
        } as Achievement;
        writeStoreFile(store);
        return store.achievements[idx];
      }
    }

    const newItem: Achievement = {
      id: data.id || `ach-${now}`,
      title: data.title || "",
      organisation: data.organisation || "",
      year: data.year || new Date().getFullYear(),
      category: data.category || "Certification",
      description: data.description || "",
      imageUrl: data.imageUrl || "",
      credentialUrl: data.credentialUrl || "",
      createdAt: now,
      updatedAt: now,
    };

    store.achievements = [newItem, ...store.achievements];
    writeStoreFile(store);
    return newItem;
  },

  deleteAchievement(id: string): void {
    const store = ensureStoreFile();
    store.achievements = store.achievements.filter((a) => a.id !== id);
    writeStoreFile(store);
  },

  getCaseStudies(): FirestoreCaseStudy[] {
    const store = ensureStoreFile();
    return store.caseStudies;
  },

  saveCaseStudy(data: Partial<FirestoreCaseStudy>): FirestoreCaseStudy {
    const store = ensureStoreFile();
    const now = Date.now();

    if (data.id) {
      const idx = store.caseStudies.findIndex((cs) => cs.id === data.id);
      if (idx !== -1) {
        store.caseStudies[idx] = {
          ...store.caseStudies[idx],
          ...data,
          updatedAt: now,
        } as FirestoreCaseStudy;
        writeStoreFile(store);
        return store.caseStudies[idx];
      }
    }

    const newItem: FirestoreCaseStudy = {
      id: data.id || `cs-${now}`,
      slug: data.slug || `case-study-${now}`,
      index: data.index || "01",
      title: data.title || "Untitled Case Study",
      summary: data.summary || "",
      coverImage: data.coverImage || "",
      context: data.context || "",
      situation: data.situation || "",
      task: data.task || "",
      action: data.action || [],
      results: data.results || [],
      takeaways: data.takeaways || [],
      createdAt: now,
      updatedAt: now,
    };

    store.caseStudies = [newItem, ...store.caseStudies];
    writeStoreFile(store);
    return newItem;
  },

  deleteCaseStudy(id: string): void {
    const store = ensureStoreFile();
    store.caseStudies = store.caseStudies.filter((cs) => cs.id !== id);
    writeStoreFile(store);
  },

  getMedia(): MediaAsset[] {
    const store = ensureStoreFile();
    return store.media;
  },

  saveMedia(asset: Partial<MediaAsset>): MediaAsset {
    const store = ensureStoreFile();
    const now = Date.now();
    const newItem: MediaAsset = {
      id: asset.id || `media-${now}`,
      url: asset.url || "",
      name: asset.name || "Untitled Asset",
      fileType: asset.fileType || "image/unknown",
      createdAt: asset.createdAt || now,
    };
    store.media = [newItem, ...store.media];
    writeStoreFile(store);
    return newItem;
  },

  deleteMedia(id: string): void {
    const store = ensureStoreFile();
    store.media = store.media.filter((m) => m.id !== id);
    writeStoreFile(store);
  },
};
