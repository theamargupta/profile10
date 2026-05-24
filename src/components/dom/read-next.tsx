import Link from "next/link";
import type { BlogPost } from "@/lib/types";

function formatPublishedDate(date: string | null) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Post-footer "Read next" list. Gives every blog post crawlable <a> links to
// other posts, so search engines (and readers) can hop post→post instead of
// dead-ending. This is the internal-linking mesh that lets one crawled post
// surface the rest. Renders nothing when there are no other posts.
export function ReadNext({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="mt-16 border-t border-[var(--color-surface-3)] pt-10">
      <h2 className="mb-6 font-mono text-xs uppercase tracking-[var(--tracking-widest)] text-[var(--color-accent-400)]">
        Read next
      </h2>
      <ul className="divide-y divide-[var(--color-surface-3)]">
        {posts.map((post) => {
          const date = formatPublishedDate(post.published_at);
          return (
            <li key={post.id}>
              <Link
                href={`/blog/${post.slug}`}
                className="group flex items-baseline justify-between gap-6 py-4"
              >
                <span
                  className="font-display font-medium text-[var(--color-fg-0)] transition-colors group-hover:text-[var(--color-accent-400)]"
                  style={{ fontSize: "var(--text-lg)", lineHeight: "var(--leading-snug)" }}
                >
                  {post.title}
                </span>
                {date && (
                  <span className="shrink-0 font-mono text-xs text-[var(--color-fg-2)]">
                    {date}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
