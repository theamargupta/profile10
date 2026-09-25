import { beforeEach, describe, expect, it, vi } from "vitest";

const { getFeedPosts } = vi.hoisted(() => ({ getFeedPosts: vi.fn() }));
vi.mock("@/lib/feeds/feed-posts", () => ({ getFeedPosts }));

import * as route from "./route";

// Block body on purpose: a function returned from beforeEach runs as teardown.
beforeEach(() => {
  getFeedPosts.mockReset();
});

describe("GET /rss.xml", () => {
  it("renders per request, like the sitemap", () => {
    expect(route).toHaveProperty("dynamic", "force-dynamic");
  });

  it("answers 200 application/rss+xml listing the newest post", async () => {
    getFeedPosts.mockResolvedValue([
      { slug: "newest", title: "Newest", excerpt: "x", publishedAt: "2026-09-25T02:45:35Z" },
    ]);
    const res = await route.GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("application/rss+xml; charset=utf-8");
    expect(await res.text()).toContain("https://amargupta.tech/blog/newest");
  });

  it("answers 503, not an empty feed, when the posts cannot be read", async () => {
    getFeedPosts.mockRejectedValue(new Error("blog_published read failed: timeout"));
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await route.GET();
    expect(res.status).toBe(503);
    expect(res.headers.get("retry-after")).toBe("300");
    expect(errorSpy).toHaveBeenCalledWith(
      "[rss.xml] could not read posts:",
      "blog_published read failed: timeout",
    );
    errorSpy.mockRestore();
  });
});
