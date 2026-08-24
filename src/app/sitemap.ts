import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://manvigurjar.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/about", "/case-studies", "/insights", "/contact"];
  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "/insights" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.8,
  }));
}
