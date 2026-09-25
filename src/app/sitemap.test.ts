import { beforeEach, describe, expect, it, vi } from "vitest";

const { getAllBlogSlugsWithDates, getAllProjectSlugs } = vi.hoisted(() => ({
  getAllBlogSlugsWithDates: vi.fn(),
  getAllProjectSlugs: vi.fn(),
}));

vi.mock("@/lib/queries", () => ({ getAllBlogSlugsWithDates, getAllProjectSlugs }));

import sitemap, * as sitemapModule from "./sitemap";

beforeEach(() => {
  getAllBlogSlugsWithDates.mockReset();
  getAllProjectSlugs.mockReset();
});

describe("sitemap route config", () => {
  // Measured 2026-09-25: with `revalidate = 300` the supabase-js fetches were
  // written to the Data Cache (revalidate 300) and the route was ISR, so a new
  // post was missing from the live sitemap for 11 h. Rendering per request is
  // the fix (docs/specs/sitemap-rss-llms.md).
  it("renders per request, so a new post appears on the next fetch", () => {
    expect(sitemapModule).toHaveProperty("dynamic", "force-dynamic");
    expect(sitemapModule).not.toHaveProperty("revalidate");
  });
});

describe("sitemap()", () => {
  it("lists each post with its real lastmod and dates /blog by the newest post", async () => {
    getAllBlogSlugsWithDates.mockResolvedValue([
      { slug: "older", lastModified: "2026-09-20T08:00:00.000Z" },
      { slug: "newest", lastModified: "2026-09-25T02:45:35.000Z" },
    ]);
    getAllProjectSlugs.mockResolvedValue(["sathi"]);

    const entries = await sitemap();
    const byUrl = new Map(entries.map((e) => [e.url, e]));

    expect(byUrl.get("https://amargupta.tech/blog/newest")?.lastModified).toEqual(
      new Date("2026-09-25T02:45:35.000Z"),
    );
    expect(byUrl.get("https://amargupta.tech/blog")?.lastModified).toEqual(
      new Date("2026-09-25T02:45:35.000Z"),
    );
    expect(byUrl.has("https://amargupta.tech/project/sathi")).toBe(true);
  });

  it("still returns the static routes when there are no posts or projects", async () => {
    getAllBlogSlugsWithDates.mockResolvedValue([]);
    getAllProjectSlugs.mockResolvedValue([]);

    const urls = (await sitemap()).map((e) => e.url);
    expect(urls).toEqual([
      "https://amargupta.tech",
      "https://amargupta.tech/about",
      "https://amargupta.tech/projects",
      "https://amargupta.tech/blog",
    ]);
  });
});
