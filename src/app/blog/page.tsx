import type { Metadata } from "next";
import { getBlogPosts, getBlogTags } from "@/lib/queries";
import Link from "next/link";
import { HiOutlinePencilSquare } from "react-icons/hi2";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Thoughts on AI, MCP Servers, LLM Integration, System Design, and modern web development.",
};

export default async function BlogPage() {
  const [posts, tags] = await Promise.all([getBlogPosts(), getBlogTags()]);

  return (
    <section className="pt-40 pb-28 md:pb-40">
      <div className="mx-auto" style={{ maxWidth: "var(--container-max)", padding: "0 var(--gutter)" }}>
        <div className="mb-16">
          <p className="mb-4 font-mono text-xs uppercase tracking-[var(--tracking-widest)] text-[var(--color-accent-400)]">
            Blog
          </p>
          <h1
            className="font-display font-bold text-[var(--color-fg-0)]"
            style={{ fontSize: "var(--text-4xl)", lineHeight: "var(--leading-tight)" }}
          >
            Thoughts & Insights
          </h1>
        </div>

        {posts.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <div className="group h-full rounded-3xl border border-[var(--color-surface-3)] bg-[var(--color-surface-1)]/60 p-8 backdrop-blur-xl transition-all duration-500 hover:border-[var(--color-accent-400)]/60">
                  <p className="mb-2 font-mono text-xs text-[var(--color-fg-2)]">
                    {new Date(post.published_at!).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                    {post.reading_time_minutes && (
                      <> &middot; {post.reading_time_minutes} min read</>
                    )}
                  </p>
                  <h2
                    className="mb-3 font-display font-semibold text-[var(--color-fg-0)] transition-colors group-hover:text-[var(--color-accent-400)]"
                    style={{ fontSize: "var(--text-lg)" }}
                  >
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="line-clamp-3 text-[var(--color-fg-1)]" style={{ fontSize: "var(--text-sm)" }}>
                      {post.excerpt}
                    </p>
                  )}
                  {post.blog_post_tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {post.blog_post_tags.map(({ blog_tags: tag }) => (
                        <span
                          key={tag.id}
                          className="rounded-full border border-[var(--color-surface-4)] px-2.5 py-0.5 font-mono text-[11px] text-[var(--color-accent-400)]/80"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mx-auto max-w-md text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-surface-2)]">
              <HiOutlinePencilSquare className="h-8 w-8 text-[var(--color-accent-400)]" />
            </div>
            <h2 className="mb-3 font-display text-xl font-semibold text-[var(--color-fg-0)]">
              Blog Coming Soon
            </h2>
            <p className="mb-8 text-[var(--color-fg-1)]" style={{ fontSize: "var(--text-base)" }}>
              I&apos;m working on articles about AI integration, MCP servers,
              system design, and modern web development. Stay tuned.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {tags.map((tag) => (
                <span
                  key={tag.id}
                  className="rounded-full border border-[var(--color-surface-4)] px-4 py-1.5 font-mono text-xs text-[var(--color-accent-400)]/80"
                >
                  {tag.name}
                </span>
              ))}
            </div>

            <div className="mt-10">
              <Link
                href="/#contact"
                data-cursor="magnet"
                className="inline-flex h-11 items-center rounded-full border border-[var(--color-surface-4)] px-6 text-sm font-medium text-[var(--color-fg-0)] transition-all duration-300 hover:border-[var(--color-accent-400)]/60 hover:bg-[var(--color-surface-2)]"
              >
                Get Notified
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
