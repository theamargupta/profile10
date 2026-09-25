import { plainExcerpt } from "@/lib/plain-excerpt";
import { createStaticClient } from "@/lib/supabase/static";

// A published post as the feeds need it: no body, no rendering.
export type FeedPost = {
  slug: string;
  title: string;
  excerpt: string | null;
  publishedAt: string;
};

type ManualRow = {
  slug: string | null;
  title: string | null;
  excerpt: string | null;
  published_at: string | null;
};

type AutoRow = {
  slug: string | null;
  title: string | null;
  body_md: string | null;
  published_at: string | null;
};

// Manual (blog_posts) wins on a slug conflict, like the sitemap. Newest first.
export function mergeFeedPosts(manual: ManualRow[], auto: AutoRow[]): FeedPost[] {
  const bySlug = new Map<string, FeedPost>();
  for (const row of manual) {
    if (!row.slug || !row.title || !row.published_at) continue;
    bySlug.set(row.slug, {
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt?.trim() || null,
      publishedAt: row.published_at,
    });
  }
  for (const row of auto) {
    if (!row.slug || !row.title || !row.published_at || bySlug.has(row.slug)) continue;
    bySlug.set(row.slug, {
      slug: row.slug,
      title: row.title,
      excerpt: plainExcerpt(row.body_md),
      publishedAt: row.published_at,
    });
  }
  return [...bySlug.values()].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

// Throws on a read error: an empty feed would tell every reader the posts are gone.
export async function getFeedPosts(): Promise<FeedPost[]> {
  const supabase = createStaticClient();
  const [manual, auto] = await Promise.all([
    supabase
      .from("blog_posts")
      .select("slug, title, excerpt, published_at")
      .eq("published", true),
    supabase.from("blog_published").select("slug, title, body_md, published_at"),
  ]);
  if (manual.error) throw new Error(`blog_posts read failed: ${manual.error.message}`);
  if (auto.error) throw new Error(`blog_published read failed: ${auto.error.message}`);
  return mergeFeedPosts(manual.data ?? [], auto.data ?? []);
}
