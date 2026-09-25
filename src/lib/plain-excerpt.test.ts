import { describe, expect, it } from "vitest";
import { plainExcerpt } from "./plain-excerpt";

// Real blog_published.body_md opening (claude-isnt-pretending-architect-you-delegated),
// read 2026-09-25. Its old excerpt showed the raw link and its 60-char URL on /blog.
const REAL_BODY =
  'A post titled ["Claude is not your architect. Stop letting it pretend"](https://www.hollandtech.net/claude-is-not-your-architect/) hit 182 points on Hacker News this week, and the title is doing most of the work.';

describe("plainExcerpt", () => {
  it("keeps a link's text and drops its URL (real post)", () => {
    expect(plainExcerpt(REAL_BODY)).toBe(
      'A post titled "Claude is not your architect. Stop letting it pretend" hit 182 points on Hacker News this week, and the title is doing most of the work.',
    );
  });

  it("drops images, headings, emphasis, inline code, quotes and list markers", () => {
    const md = "# Title\n\n![hero](https://x.dev/a.png)\n> **Bold** and _em_ with `code`\n\n- one\n1. two";
    expect(plainExcerpt(md)).toBe("Title Bold and em with code one two");
  });

  it("keeps underscores and hyphens inside words", () => {
    expect(plainExcerpt("Set blog_published and fix-first flags")).toBe(
      "Set blog_published and fix-first flags",
    );
  });

  it("strips HTML tags", () => {
    expect(plainExcerpt("<article><p>Hello <em>there</em></p></article>")).toBe("Hello there");
  });

  it("caps the result at 240 characters", () => {
    const out = plainExcerpt("word ".repeat(100))!;
    expect(out.length).toBeLessThanOrEqual(240);
    expect(out.endsWith(" ")).toBe(false);
  });

  it("returns null for empty, whitespace-only or missing input", () => {
    expect(plainExcerpt(null)).toBeNull();
    expect(plainExcerpt("")).toBeNull();
    expect(plainExcerpt("  \n ")).toBeNull();
  });
});
