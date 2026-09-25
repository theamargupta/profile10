import { getFeedPosts, type FeedPost } from "@/lib/feeds/feed-posts";
import { buildLlmsTxt } from "@/lib/feeds/llms";

// Per request, like the sitemap (docs/specs/sitemap-rss-llms.md). Replaces the
// hand-written public/llms.txt, which a public file would otherwise shadow.
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  let posts: FeedPost[] | null;
  try {
    posts = await getFeedPosts();
  } catch (err) {
    // The profile is still worth serving; the body says the list is missing.
    console.error("[llms.txt] could not read posts:", err instanceof Error ? err.message : String(err));
    posts = null;
  }
  return new Response(buildLlmsTxt(posts), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
