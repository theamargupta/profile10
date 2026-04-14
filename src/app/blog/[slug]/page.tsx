import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getBlogPostBySlug, getAllBlogSlugs } from "@/lib/queries";
import { IoArrowBack } from "react-icons/io5";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getAllBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) return { title: "Post Not Found" };

  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      images: post.cover_image ? [post.cover_image] : [],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) notFound();

  const tags = post.blog_post_tags.map((t) => t.blog_tags);

  return (
    <section className="pt-40 pb-28 md:pb-40">
      <div className="mx-auto max-w-3xl" style={{ padding: "0 var(--gutter)" }}>
        <Link
          href="/blog"
          className="mb-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[var(--tracking-wider)] text-[var(--color-fg-2)] transition-colors hover:text-[var(--color-accent-400)]"
        >
          <IoArrowBack size={14} />
          Back to Blog
        </Link>

        {post.cover_image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.cover_image}
            alt={post.title}
            className="mb-10 aspect-video w-full rounded-3xl border border-[var(--color-surface-3)] object-cover"
          />
        )}

        <div className="mb-6">
          <p className="mb-4 font-mono text-xs text-[var(--color-fg-2)]">
            {post.published_at &&
              new Date(post.published_at).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            {post.reading_time_minutes && (
              <> &middot; {post.reading_time_minutes} min read</>
            )}
          </p>

          <h1
            className="font-display font-bold text-[var(--color-fg-0)]"
            style={{ fontSize: "var(--text-4xl)", lineHeight: "var(--leading-tight)" }}
          >
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="mt-4 text-[var(--color-fg-1)]" style={{ fontSize: "var(--text-lg)" }}>
              {post.excerpt}
            </p>
          )}

          {tags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag.id}
                  className="rounded-full border border-[var(--color-surface-4)] px-3 py-1 font-mono text-xs text-[var(--color-accent-400)]/80"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>

        <hr className="my-8 border-[var(--color-surface-3)]" />

        {post.content ? (
          <article
            className="prose prose-invert prose-lg max-w-none
              prose-headings:font-display prose-headings:tracking-[var(--tracking-tight)]
              prose-a:text-[var(--color-accent-400)] prose-a:no-underline hover:prose-a:underline
              prose-code:rounded prose-code:bg-[var(--color-surface-2)] prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm
              prose-pre:rounded-xl prose-pre:border prose-pre:border-[var(--color-surface-3)] prose-pre:bg-[var(--color-surface-1)]
              prose-img:rounded-xl prose-img:border prose-img:border-[var(--color-surface-3)]
              prose-blockquote:border-[var(--color-accent-400)]/40 prose-blockquote:text-[var(--color-fg-1)]"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        ) : (
          <p className="text-center text-[var(--color-fg-2)]">
            This post has no content yet.
          </p>
        )}

        <div className="mt-16 text-center">
          <Link
            href="/blog"
            data-cursor="magnet"
            className="inline-flex h-11 items-center rounded-full border border-[var(--color-surface-4)] px-6 text-sm font-medium text-[var(--color-fg-0)] transition-all duration-300 hover:border-[var(--color-accent-400)]/60 hover:bg-[var(--color-surface-2)]"
          >
            View All Posts
          </Link>
        </div>
      </div>
    </section>
  );
}
