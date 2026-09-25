import { describe, expect, it, vi } from "vitest";

// The /blog card excerpt for Auto-Blog posts comes from getAutoBlogPosts.
const { order } = vi.hoisted(() => ({ order: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ from: () => ({ select: () => ({ order }) }) }),
}));

import { getAutoBlogPosts } from "./queries";

describe("getAutoBlogPosts excerpt", () => {
  it("is plain text: a markdown link keeps its text and loses its URL", async () => {
    order.mockResolvedValue({
      data: [
        {
          id: "1",
          slug: "real",
          title: "Real",
          body_md:
            'A post titled ["Claude is not your architect"](https://www.hollandtech.net/claude-is-not-your-architect/) hit 182 points.',
          body_html: "",
          hero_image_id: null,
          og_image_url: null,
          published_at: "2026-09-20T08:00:00Z",
          sources: null,
        },
      ],
    });
    const [post] = await getAutoBlogPosts();
    expect(post.excerpt).toBe('A post titled "Claude is not your architect" hit 182 points.');
  });
});
