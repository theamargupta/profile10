import { getFeedPosts } from "@/lib/feeds/feed-posts";
import { buildRssXml } from "@/lib/feeds/rss";

// Per request, like the sitemap: a cached feed missed new posts for hours
// (docs/specs/sitemap-rss-llms.md).
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  try {
    const posts = await getFeedPosts();
    return new Response(buildRssXml(posts), {
      headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[rss.xml] could not read posts:", message);
    return new Response("RSS feed temporarily unavailable: could not read posts.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Retry-After": "300" },
    });
  }
}
