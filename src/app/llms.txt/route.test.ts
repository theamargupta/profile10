import { beforeEach, describe, expect, it, vi } from "vitest";

const { getFeedPosts } = vi.hoisted(() => ({ getFeedPosts: vi.fn() }));
vi.mock("@/lib/feeds/feed-posts", () => ({ getFeedPosts }));

import * as route from "./route";

// Block body on purpose: a function returned from beforeEach runs as teardown.
beforeEach(() => {
  getFeedPosts.mockReset();
});

describe("GET /llms.txt", () => {
  it("renders per request, like the sitemap", () => {
    expect(route).toHaveProperty("dynamic", "force-dynamic");
  });

  it("answers 200 text/plain with the newest post", async () => {
    getFeedPosts.mockResolvedValue([
      { slug: "newest", title: "Newest", excerpt: "x", publishedAt: "2026-09-25T02:45:35Z" },
    ]);
    const res = await route.GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("text/plain; charset=utf-8");
    expect(await res.text()).toContain("- [Newest](https://amargupta.tech/blog/newest): x");
  });

  it("still serves the profile, and logs why, when posts cannot be read", async () => {
    getFeedPosts.mockRejectedValue(new Error("blog_posts read failed: timeout"));
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await route.GET();
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toContain("Senior Frontend Developer — AI & MCP");
    expect(body).toContain("temporarily unavailable");
    expect(errorSpy).toHaveBeenCalledWith(
      "[llms.txt] could not read posts:",
      "blog_posts read failed: timeout",
    );
    errorSpy.mockRestore();
  });
});
