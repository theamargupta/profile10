import { describe, expect, it } from "vitest";
import { buildLlmsTxt, LLMS_POST_LIMIT } from "./llms";

const post = (n: number) => ({
  slug: `post-${n}`,
  title: `Post ${n}`,
  excerpt: `Excerpt ${n}.`,
  publishedAt: `2026-09-${String(25 - (n % 20)).padStart(2, "0")}T08:00:00Z`,
});

describe("buildLlmsTxt", () => {
  it("leads with the site's frontend-first headline, never Full Stack", () => {
    const txt = buildLlmsTxt([post(1)]);
    expect(txt.startsWith("# Amar Gupta\n\n> Senior Frontend Developer — AI & MCP.")).toBe(true);
    expect(txt).not.toMatch(/full stack/i);
  });

  it("keeps the profile sections", () => {
    const txt = buildLlmsTxt([post(1)]);
    for (const heading of ["## Profile", "## What I build", "## Stack", "## Notable projects", "## Contact"]) {
      expect(txt).toContain(`\n${heading}\n`);
    }
  });

  it("lists posts under ## Blog as title, URL and excerpt, in the order given", () => {
    const txt = buildLlmsTxt([post(1), post(2)]);
    const blog = txt.slice(txt.indexOf("## Blog"), txt.indexOf("## Contact"));
    expect(blog).toContain(
      "- [Post 1](https://amargupta.tech/blog/post-1): Excerpt 1.\n- [Post 2](https://amargupta.tech/blog/post-2): Excerpt 2.",
    );
    expect(blog).toContain("https://amargupta.tech/rss.xml");
  });

  it(`caps the list at the newest ${LLMS_POST_LIMIT} posts`, () => {
    const posts = Array.from({ length: LLMS_POST_LIMIT + 5 }, (_, i) => post(i + 1));
    const txt = buildLlmsTxt(posts);
    expect(txt.match(/^- \[Post \d+\]/gm)).toHaveLength(LLMS_POST_LIMIT);
    expect(txt).not.toContain(`[Post ${LLMS_POST_LIMIT + 1}]`);
  });

  it("writes a post without an excerpt as a bare link", () => {
    const txt = buildLlmsTxt([{ ...post(1), excerpt: null }]);
    expect(txt).toContain("- [Post 1](https://amargupta.tech/blog/post-1)\n");
  });

  it("says so when there are no posts yet", () => {
    expect(buildLlmsTxt([])).toContain("## Blog\n\nNo posts published yet.");
  });

  it("says the list is unavailable, and keeps the profile, when posts could not be read", () => {
    const txt = buildLlmsTxt(null);
    expect(txt).toContain("## Blog\n\nThe post list is temporarily unavailable; see https://amargupta.tech/blog.");
    expect(txt).toContain("## Contact");
  });
});
