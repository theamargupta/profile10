import { describe, expect, it } from "vitest";
import { buildRssXml } from "./rss";

const post = {
  slug: "linkedin-paused",
  title: "LinkedIn paused my search & <everything> else",
  excerpt: "Short \"quoted\" excerpt.",
  publishedAt: "2026-09-25T02:45:35Z",
};

describe("buildRssXml", () => {
  it("renders an RSS 2.0 channel with one item per post", () => {
    const xml = buildRssXml([post]);
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">');
    expect(xml).toContain("<link>https://amargupta.tech/blog</link>");
    expect(xml).toContain(
      '<atom:link href="https://amargupta.tech/rss.xml" rel="self" type="application/rss+xml"/>',
    );
    expect(xml.match(/<item>/g)).toHaveLength(1);
    expect(xml).toContain("<link>https://amargupta.tech/blog/linkedin-paused</link>");
    expect(xml).toContain('<guid isPermaLink="true">https://amargupta.tech/blog/linkedin-paused</guid>');
    expect(xml).toContain("<pubDate>Fri, 25 Sep 2026 02:45:35 GMT</pubDate>");
  });

  it("escapes XML special characters in titles and excerpts", () => {
    const xml = buildRssXml([post]);
    expect(xml).toContain("<title>LinkedIn paused my search &amp; &lt;everything&gt; else</title>");
    expect(xml).toContain("<description>Short &quot;quoted&quot; excerpt.</description>");
  });

  it("dates the channel by its newest post", () => {
    const older = { ...post, slug: "older", publishedAt: "2026-09-20T08:00:00Z" };
    const xml = buildRssXml([post, older]);
    expect(xml).toContain("<lastBuildDate>Fri, 25 Sep 2026 02:45:35 GMT</lastBuildDate>");
  });

  it("omits the description when a post has no excerpt", () => {
    const xml = buildRssXml([{ ...post, excerpt: null }]);
    expect(xml).not.toContain("<description>Short");
  });

  it("renders a valid empty channel when there are no posts", () => {
    const xml = buildRssXml([]);
    expect(xml).toContain("<channel>");
    expect(xml).not.toContain("<item>");
    expect(xml).not.toContain("<lastBuildDate>");
  });
});
