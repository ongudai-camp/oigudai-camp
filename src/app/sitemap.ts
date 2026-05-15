import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const LOCALES = ["ru", "en", "kk"];
const BASE_URL = "https://ongudaicamp.ru";

const STATIC_ROUTES = [
  "", "hotels", "tours", "activities", "about",
  "privacy-policy", "terms", "search", "calendar",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    for (const route of STATIC_ROUTES) {
      entries.push({
        url: `${BASE_URL}/${locale}/${route}`,
        lastModified: new Date(),
        changeFrequency: route === "" ? "weekly" : "monthly",
        priority: route === "" ? 1.0 : 0.7,
      });
    }
  }

  const posts = await prisma.post.findMany({
    where: { status: "publish" },
    select: { slug: true, locale: true, updatedAt: true },
    take: 500,
  });

  for (const post of posts) {
    const typeMap: Record<string, string> = {
      hotel: "hotels", tour: "tours", activity: "activities",
    };
    const path = typeMap[post.slug.split("-")[0]] || "hotels";
    entries.push({
      url: `${BASE_URL}/${post.locale}/${path}/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  return entries;
}
