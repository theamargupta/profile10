import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getAllBlogSlugsWithDates, getProjectsWithDates } = vi.hoisted(() => ({
  getAllBlogSlugsWithDates: vi.fn(),
  getProjectsWithDates: vi.fn(),
}));

vi.mock("@/lib/queries", () => ({ getAllBlogSlugsWithDates }));
vi.mock("@/lib/feeds/project-dates", () => ({ getProjectsWithDates }));

import sitemap, * as sitemapModule from "./sitemap";

const BASE = "https://amargupta.tech";
const lastmodOf = async () =>
  new Map((await sitemap()).map((e) => [e.url, e.lastModified?.valueOf()]));

beforeEach(() => {
  getAllBlogSlugsWithDates.mockReset();
  getProjectsWithDates.mockReset();
  getAllBlogSlugsWithDates.mockResolvedValue([
    { slug: "older", lastModified: "2026-09-20T08:00:00.000Z" },
    { slug: "newest", lastModified: "2026-09-25T02:45:35.000Z" },
  ]);
  getProjectsWithDates.mockResolvedValue([
    { id: "sathi", updatedAt: "2026-06-02T21:14:10.659Z" },
    { id: "kamai", updatedAt: "2026-09-10T21:42:50.571Z" },
  ]);
});

afterEach(() => {
  vi.useRealTimers();
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
  // Rendered per request, `new Date()` made every static and project lastmod
  // read "now" on each crawl (seen live 2026-09-25): a signal Google ignores.
  it("produces identical lastmods for two renders a second apart", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-25T14:00:00Z"));
    const first = await lastmodOf();
    vi.setSystemTime(new Date("2026-09-25T14:00:01Z"));
    const second = await lastmodOf();
    expect(second).toEqual(first);
  });

  it("dates each post and each project by its own record", async () => {
    const lastmod = await lastmodOf();
    expect(lastmod.get(`${BASE}/blog/newest`)).toBe(Date.parse("2026-09-25T02:45:35.000Z"));
    expect(lastmod.get(`${BASE}/project/sathi`)).toBe(Date.parse("2026-06-02T21:14:10.659Z"));
  });

  it("dates the index pages by the newest content they show", async () => {
    const lastmod = await lastmodOf();
    expect(lastmod.get(`${BASE}/blog`)).toBe(Date.parse("2026-09-25T02:45:35.000Z"));
    expect(lastmod.get(`${BASE}/projects`)).toBe(Date.parse("2026-09-10T21:42:50.571Z"));
    // The home page shows both posts and projects.
    expect(lastmod.get(BASE)).toBe(Date.parse("2026-09-25T02:45:35.000Z"));
  });

  it("omits lastmod for /about, which no record dates", async () => {
    const entries = await sitemap();
    const about = entries.find((e) => e.url === `${BASE}/about`);
    expect(about).toBeDefined();
    expect(about).not.toHaveProperty("lastModified");
  });

  it("returns the static routes with no lastmod when there are no posts or projects", async () => {
    getAllBlogSlugsWithDates.mockResolvedValue([]);
    getProjectsWithDates.mockResolvedValue([]);

    const entries = await sitemap();
    expect(entries.map((e) => e.url)).toEqual([BASE, `${BASE}/about`, `${BASE}/projects`, `${BASE}/blog`]);
    for (const e of entries) expect(e).not.toHaveProperty("lastModified");
  });
});
