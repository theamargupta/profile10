import type { MetadataRoute } from "next";
import { getAllBlogSlugsWithDates, getAllProjectSlugs } from "@/lib/queries";

const BASE = "https://amargupta.tech";

// Per request, never cached. `revalidate = 300` put the supabase fetches in the
// Data Cache under an ISR page, and a new post missed the live sitemap for
// 11 h (measured 2026-09-25). See docs/specs/sitemap-rss-llms.md.
export const dynamic = "force-dynamic";

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
    { url: `${BASE}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/projects`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/blog`, lastModified: blogIndexLastMod, changeFrequency: "weekly", priority: 0.7 },
    ...projectEntries,
    ...blogEntries,
  ];
}
