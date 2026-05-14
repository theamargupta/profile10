import type { Metadata } from "next";
import Link from "next/link";
import { HiOutlinePencilSquare } from "react-icons/hi2";
import { BlogCard } from "@/components/dom/blog-card";
import { getCombinedBlogPosts, getBlogTags } from "@/lib/queries";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Thoughts on AI, MCP Servers, LLM Integration, System Design, and modern web development.",
  alternates: { canonical: "/blog" },
};

export default async function BlogPage() {
  const [posts, tags] = await Promise.all([getCombinedBlogPosts(), getBlogTags()]);
  const [featured, ...rest] = posts;

  return (
    <section className="pt-40 pb-28 md:pb-40">
      <div className="mx-auto" style={{ maxWidth: "var(--container-max)", padding: "0 var(--gutter)" }}>
        <div className="mb-16 max-w-3xl">
          <p className="mb-4 font-mono text-xs uppercase tracking-[var(--tracking-widest)] text-[var(--color-accent-400)]">
            WRITING
          </p>
          <h1
            className="font-display font-bold text-[var(--color-fg-0)]"
            style={{ fontSize: "var(--text-5xl)", lineHeight: "var(--leading-tight)" }}
          >
            Field Notes
          </h1>
          <p className="mt-5 text-[var(--color-fg-1)]" style={{ fontSize: "var(--text-lg)" }}>
            Long-form notes on shipping AI products, MCP servers, and the weird edges of modern web dev.
          </p>
        </div>

        {featured ? (
          <div className="space-y-8">
            <BlogCard post={featured} variant="featured" />

            {rest.length > 0 && (
              <div className="grid gap-8 sm:grid-cols-2">
                {rest.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="mx-auto max-w-md text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-surface-2)]">
              <HiOutlinePencilSquare className="h-8 w-8 text-[var(--color-accent-400)]" />
            </div>
            <h2
              className="mb-3 font-display font-semibold text-[var(--color-fg-0)]"
              style={{ fontSize: "var(--text-2xl)" }}
            >
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
                className="inline-flex h-11 items-center rounded-full border border-[var(--color-surface-4)] px-6 font-mono text-[11px] uppercase tracking-[var(--tracking-wider)] text-[var(--color-fg-2)] transition-colors hover:border-[var(--color-accent-400)]/60 hover:text-[var(--color-accent-400)]"
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
