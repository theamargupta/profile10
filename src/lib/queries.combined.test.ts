import { describe, expect, it, vi } from "vitest";

// 12 slugs live in BOTH blog_posts and blog_published (measured 2026-09-25),
// so /blog rendered 68 cards for 56 posts.
const { rows } = vi.hoisted(() => ({
  rows: {
    blog_posts: [
      { id: "m1", slug: "shared", title: "Manual copy", excerpt: "m", content: "", published: true,
        published_at: "2026-09-20T08:00:00Z", created_at: "2026-09-20T08:00:00Z", blog_post_tags: [] },
    ],
    blog_published: [
      { id: "a1", slug: "shared", title: "Auto copy", body_md: "a", body_html: "", hero_image_id: null,
        og_image_url: null, published_at: "2026-09-21T08:00:00Z", sources: null },
      { id: "a2", slug: "auto-only", title: "Auto only", body_md: "b", body_html: "", hero_image_id: null,
        og_image_url: null, published_at: "2026-09-22T08:00:00Z", sources: null },
    ],
  } as Record<string, unknown[]>,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    from: (table: string) => {
      const result = { data: rows[table] ?? [] };
      const chain = { select: () => chain, eq: () => chain, order: async () => result };
      return chain;
    },
  }),
}));

import { getCombinedBlogPosts } from "./queries";

describe("getCombinedBlogPosts", () => {
  it("lists a slug once, keeping the manual post, newest first", async () => {
    const posts = await getCombinedBlogPosts();
    expect(posts.map((p) => p.slug)).toEqual(["auto-only", "shared"]);
    expect(posts.find((p) => p.slug === "shared")?.title).toBe("Manual copy");
  });
});
