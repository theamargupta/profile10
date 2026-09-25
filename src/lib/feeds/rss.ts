import type { FeedPost } from "./feed-posts";
import { BLOG_DESCRIPTION, SITE_NAME, SITE_URL, postUrl } from "./site";

const escapeXml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

// RSS 2.0 dates are RFC 822; toUTCString() produces exactly that form.
const rfc822 = (iso: string) => new Date(iso).toUTCString();

function item(post: FeedPost): string {
  const url = postUrl(post.slug);
  return [
    "    <item>",
    `      <title>${escapeXml(post.title)}</title>`,
    `      <link>${url}</link>`,
    `      <guid isPermaLink="true">${url}</guid>`,
    `      <pubDate>${rfc822(post.publishedAt)}</pubDate>`,
    post.excerpt ? `      <description>${escapeXml(post.excerpt)}</description>` : null,
    "    </item>",
  ]
    .filter(Boolean)
    .join("\n");
}

// `posts` must be newest first (getFeedPosts sorts them).
export function buildRssXml(posts: FeedPost[]): string {
  const newest = posts[0];
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${escapeXml(`${SITE_NAME} — Blog`)}</title>`,
    `    <link>${SITE_URL}/blog</link>`,
    `    <description>${escapeXml(BLOG_DESCRIPTION)}</description>`,
    "    <language>en</language>",
    `    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>`,
    newest ? `    <lastBuildDate>${rfc822(newest.publishedAt)}</lastBuildDate>` : null,
    ...posts.map(item),
    "  </channel>",
    "</rss>",
  ]
    .filter(Boolean)
    .join("\n");
}
