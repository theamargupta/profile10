import type { MetadataRoute } from "next";
import { SITE_URL as BASE } from "@/lib/feeds/site";
import { getProjectsWithDates } from "@/lib/feeds/project-dates";
import { getAllBlogSlugsWithDates } from "@/lib/queries";

// Per request, never cached. `revalidate = 300` put the supabase fetches in the
// Data Cache under an ISR page, and a new post missed the live sitemap for
// 11 h (measured 2026-09-25). See docs/specs/sitemap-rss-llms.md.
export const dynamic = "force-dynamic";

// Every lastmod comes from a record, never from the request time: rendered per
// request, `new Date()` read "now" on each crawl, and Google only honours
// lastmod when it is "consistently and verifiably accurate".
// Ref: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
// No date known → no lastmod.
const dated = (iso: string | null | undefined) => (iso ? { lastModified: new Date(iso) } : {});

function newest(dates: (string | null)[]): string | null {
  return dates.reduce<string | null>(
    (max, d) => (d && (!max || Date.parse(d) > Date.parse(max)) ? d : max),
    null,
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [blogPosts, projects] = await Promise.all([
    getAllBlogSlugsWithDates(),
    getProjectsWithDates(),
  ]);

  const newestPost = newest(blogPosts.map((p) => p.lastModified));
  const newestProject = newest(projects.map((p) => p.updatedAt));

  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${BASE}/blog/${post.slug}`,
    ...dated(post.lastModified),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const projectEntries: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${BASE}/project/${project.id}`,
    ...dated(project.updatedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    // The home page shows posts and featured projects: as fresh as the newest.
    { url: BASE, ...dated(newest([newestPost, newestProject])), changeFrequency: "weekly", priority: 1 },
    // No record dates /about (profile edits are not timestamped), so no lastmod.
    { url: `${BASE}/about`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/projects`, ...dated(newestProject), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/blog`, ...dated(newestPost), changeFrequency: "weekly", priority: 0.7 },
    ...projectEntries,
    ...blogEntries,
  ];
}
