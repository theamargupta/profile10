import type { FeedPost } from "./feed-posts";
import { LLMS_CONTACT, LLMS_INTRO, LLMS_PROFILE_SECTIONS } from "./llms-profile";
import { SITE_URL, postUrl } from "./site";

export const LLMS_POST_LIMIT = 20;

function blogSection(posts: FeedPost[] | null): string {
  if (posts === null) {
    return `## Blog\n\nThe post list is temporarily unavailable; see ${SITE_URL}/blog.`;
  }
  if (posts.length === 0) return "## Blog\n\nNo posts published yet.";
  const lines = posts
    .slice(0, LLMS_POST_LIMIT)
    .map((p) => `- [${p.title}](${postUrl(p.slug)})${p.excerpt ? `: ${p.excerpt}` : ""}`);
  return [
    "## Blog",
    "",
    `The newest ${lines.length} posts. Every post: ${SITE_URL}/blog · RSS: ${SITE_URL}/rss.xml`,
    "",
    ...lines,
  ].join("\n");
}

// `posts` newest first; null means they could not be read (the profile still ships).
export function buildLlmsTxt(posts: FeedPost[] | null): string {
  return [LLMS_INTRO, LLMS_PROFILE_SECTIONS, blogSection(posts), LLMS_CONTACT].join("\n\n") + "\n";
}
