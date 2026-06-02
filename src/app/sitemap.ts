import type { MetadataRoute } from "next";
import { getAllBlogSlugsWithDates, getAllProjectSlugs } from "@/lib/queries";

const BASE = "https://amargupta.tech";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [blogPosts, projectSlugs] = await Promise.all([
    getAllBlogSlugsWithDates(),
    getAllProjectSlugs(),
  ]);
  const now = new Date();

  // Blog entries carry each post's REAL last-modified date (deduped at source).
  // Do NOT use `now` here — Google ignores an all-identical build timestamp.
  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${BASE}/blog/${post.slug}`,
    lastModified: new Date(post.lastModified),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  // The /blog index is as fresh as its newest post — a verifiable signal.
  const blogIndexLastMod = blogPosts.length
    ? blogPosts.reduce<Date>((max, p) => {
        const d = new Date(p.lastModified);
        return d > max ? d : max;
      }, new Date(0))
    : now;

  // NOTE: static routes (/, /about, /projects) + project pages still use `now`.
  // They're already indexed and low-volume, so the imperfect lastmod is
  // harmless. A follow-up could source real updated_at for projects.
  const projectEntries: MetadataRoute.Sitemap = projectSlugs.map((slug) => ({
    url: `${BASE}/project/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    { url: BASE, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/hire`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/projects`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/blog`, lastModified: blogIndexLastMod, changeFrequency: "weekly", priority: 0.7 },
    ...projectEntries,
    ...blogEntries,
  ];
}
