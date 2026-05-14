import type { MetadataRoute } from "next";
import { getAllBlogSlugs } from "@/lib/queries";

const BASE = "https://amargupta.tech";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getAllBlogSlugs();
  const now = new Date();
  const blogEntries: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${BASE}/blog/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [
    { url: BASE, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/projects`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    ...blogEntries,
  ];
}
