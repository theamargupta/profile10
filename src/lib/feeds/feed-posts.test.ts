import { describe, expect, it } from "vitest";
import { mergeFeedPosts } from "./feed-posts";

describe("mergeFeedPosts", () => {
  it("merges manual and auto posts, newest first", () => {
    const posts = mergeFeedPosts(
      [{ slug: "manual", title: "Manual", excerpt: "By hand.", published_at: "2026-09-20T08:00:00Z" }],
      [{ slug: "auto", title: "Auto", body_md: "Written **by** the routine.", published_at: "2026-09-25T02:45:35Z" }],
    );
    expect(posts.map((p) => p.slug)).toEqual(["auto", "manual"]);
    expect(posts[0]).toEqual({
      slug: "auto",
      title: "Auto",
      excerpt: "Written by the routine.",
      publishedAt: "2026-09-25T02:45:35Z",
    });
  });

  it("keeps the manual row when both tables carry the same slug", () => {
    const posts = mergeFeedPosts(
      [{ slug: "same", title: "Manual title", excerpt: "m", published_at: "2026-09-20T08:00:00Z" }],
      [{ slug: "same", title: "Auto title", body_md: "a", published_at: "2026-09-21T08:00:00Z" }],
    );
    expect(posts).toHaveLength(1);
    expect(posts[0].title).toBe("Manual title");
  });

  it("drops rows without a slug, title or publish date", () => {
    const posts = mergeFeedPosts(
      [
        { slug: null, title: "No slug", excerpt: null, published_at: "2026-09-20T08:00:00Z" },
        { slug: "no-date", title: "No date", excerpt: null, published_at: null },
      ],
      [{ slug: "no-title", title: "", body_md: null, published_at: "2026-09-20T08:00:00Z" }],
    );
    expect(posts).toEqual([]);
  });

  it("strips markdown and caps a generated excerpt at 240 characters", () => {
    const [post] = mergeFeedPosts([], [
      { slug: "long", title: "Long", body_md: `# Heading\n\n${"word ".repeat(100)}`, published_at: "2026-09-20T08:00:00Z" },
    ]);
    expect(post.excerpt?.startsWith("Heading word word")).toBe(true);
    expect(post.excerpt!.length).toBeLessThanOrEqual(240);
  });

  it("returns an empty list when there are no posts", () => {
    expect(mergeFeedPosts([], [])).toEqual([]);
  });
});
