import Link from "next/link";
import { BlogCard } from "@/components/dom/blog-card";
import type { BlogPost } from "@/lib/types";

// Homepage "Field Notes" section. Surfaces the latest posts as real, server-
// rendered <a> anchors so the most-crawled page (priority 1.0) gives search
// engines a fresh discovery path to new blog posts. Renders nothing when there
// are no posts yet.
export function RecentWriting({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) return null;

  return (
    <section id="writing" className="py-28 md:py-40">
      <div
        className="mx-auto"
        style={{ maxWidth: "var(--container-max)", padding: "0 var(--gutter)" }}
      >
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="mb-4 font-mono text-xs uppercase tracking-[var(--tracking-widest)] text-[var(--color-accent-400)]">
              WRITING
            </p>
            <h2
              className="font-display font-bold text-[var(--color-fg-0)]"
              style={{ fontSize: "var(--text-4xl)", lineHeight: "var(--leading-tight)" }}
            >
              Field Notes
            </h2>
            <p className="mt-4 text-[var(--color-fg-1)]" style={{ fontSize: "var(--text-base)" }}>
              Long-form notes on shipping AI products, MCP servers, and the weird edges of modern web dev.
            </p>
          </div>
          <Link
            href="/blog"
            className="inline-flex h-11 items-center rounded-full border border-[var(--color-surface-4)] px-6 font-mono text-[11px] uppercase tracking-[var(--tracking-wider)] text-[var(--color-fg-2)] transition-colors hover:border-[var(--color-accent-400)]/60 hover:text-[var(--color-accent-400)]"
          >
            All posts →
          </Link>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
