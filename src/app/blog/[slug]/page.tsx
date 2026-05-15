import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import { IoArrowBack } from "react-icons/io5";
import { getCombinedBlogPostBySlug } from "@/lib/queries";

export const revalidate = 3600;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getCombinedBlogPostBySlug(slug);

  if (!post) return { title: "Post Not Found" };

  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      type: "article",
      url: `https://amargupta.tech/blog/${slug}`,
      title: post.title,
      description: post.excerpt ?? undefined,
      images: post.cover_image ? [post.cover_image] : [],
      publishedTime: post.published_at ?? undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt ?? undefined,
      images: post.cover_image ? [post.cover_image] : undefined,
    },
  };
}

function formatPublishedDate(date: string | null) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const proseClassName = `prose prose-invert prose-lg max-w-none
  prose-headings:font-display prose-headings:text-[var(--color-fg-0)] prose-headings:tracking-[var(--tracking-tight)]
  prose-h2:mt-12 prose-h2:mb-4 prose-h2:text-[var(--text-3xl)]
  prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-[var(--text-2xl)]
  prose-p:text-[var(--color-fg-1)] prose-p:leading-[var(--leading-normal)]
  prose-strong:text-[var(--color-fg-0)] prose-strong:font-semibold
  prose-a:text-[var(--color-accent-400)] prose-a:no-underline prose-a:font-medium hover:prose-a:underline hover:prose-a:decoration-[var(--color-accent-400)]/60 hover:prose-a:underline-offset-4
  prose-code:rounded prose-code:bg-[var(--color-surface-2)] prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[0.875em] prose-code:text-[var(--color-accent-300)] prose-code:before:content-none prose-code:after:content-none
  prose-pre:rounded-xl prose-pre:border prose-pre:border-[var(--color-surface-3)] prose-pre:bg-[var(--color-surface-1)]
  prose-img:rounded-xl prose-img:border prose-img:border-[var(--color-surface-3)]
  prose-blockquote:border-l-[3px] prose-blockquote:border-[var(--color-accent-400)]/40 prose-blockquote:text-[var(--color-fg-1)] prose-blockquote:not-italic prose-blockquote:font-normal
  prose-hr:border-[var(--color-surface-3)]
  prose-li:marker:text-[var(--color-accent-400)] prose-li:text-[var(--color-fg-1)]
  prose-ul:my-6 prose-ol:my-6`;

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getCombinedBlogPostBySlug(slug);

  if (!post) notFound();

  const tags = post.blog_post_tags.map((t) => t.blog_tags);
  const publishedDate = formatPublishedDate(post.published_at);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt ?? undefined,
    image: post.cover_image ?? "https://amargupta.tech/opengraph-image",
    datePublished: post.published_at ?? undefined,
    dateModified: post.published_at ?? undefined,
    author: { "@id": "https://amargupta.tech/#person" },
    publisher: { "@id": "https://amargupta.tech/#person" },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://amargupta.tech/blog/${slug}`,
    },
    keywords: tags.map((t) => t.name).join(", ") || undefined,
  };

  return (
    <section className="pt-40 pb-28 md:pb-40">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <div className="mx-auto max-w-4xl" style={{ padding: "0 var(--gutter)" }}>
        <Link
          href="/blog"
          className="mb-8 inline-flex h-9 items-center gap-2 rounded-full border border-[var(--color-surface-4)] px-4 font-mono text-[11px] uppercase tracking-[var(--tracking-wider)] text-[var(--color-fg-2)] transition-colors hover:border-[var(--color-accent-400)]/60 hover:text-[var(--color-accent-400)]"
        >
          <IoArrowBack size={14} />
          Back to Blog
        </Link>

        {post.cover_image && (
          <Image
            src={post.cover_image}
            alt={post.title}
            width={1600}
            height={700}
            priority
            className="mb-10 aspect-[16/7] w-full rounded-3xl border border-[var(--color-surface-3)] object-cover shadow-[var(--shadow-glow)]"
          />
        )}

        <header>
          <h1
            className="font-display font-bold text-[var(--color-fg-0)]"
            style={{
              fontSize: "var(--text-5xl)",
              lineHeight: "var(--leading-tight)",
              letterSpacing: "var(--tracking-tight)",
            }}
          >
            {post.title}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-2 font-mono text-xs uppercase tracking-[var(--tracking-wider)] text-[var(--color-fg-2)]">
            {publishedDate && <span>{publishedDate}</span>}
            {post.reading_time_minutes && (
              <>
                {publishedDate && <span>·</span>}
                <span>{post.reading_time_minutes} min read</span>
              </>
            )}
            {tags.map((tag, index) => (
              <span key={tag.id} className="inline-flex items-center gap-2">
                {(publishedDate || post.reading_time_minutes || index > 0) && <span>·</span>}
                <span className="rounded-full border border-[var(--color-surface-4)] px-2.5 py-0.5 text-[11px] text-[var(--color-accent-400)]/80">
                  {tag.name}
                </span>
              </span>
            ))}
          </div>

          {post.excerpt && (
            <p
              className="mt-6 text-[var(--color-fg-1)] italic"
              style={{ fontSize: "var(--text-xl)", lineHeight: "var(--leading-snug)" }}
            >
              {post.excerpt}
            </p>
          )}
        </header>

        <div className="my-10 h-px w-full bg-[var(--color-accent-400)]/30" />

        <div className="mx-auto max-w-3xl">
          {post.content ? (
            <article
              className={proseClassName}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          ) : (
            <p className="text-center text-[var(--color-fg-2)]">
              This post has no content yet.
            </p>
          )}

          <footer className="mt-16 border-t border-[var(--color-surface-3)] pt-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-2)] font-mono text-xs font-semibold text-[var(--color-accent-400)]">
                  AG
                </div>
                <div>
                  <p
                    className="font-display font-semibold text-[var(--color-fg-0)]"
                    style={{ fontSize: "var(--text-lg)" }}
                  >
                    Amar Gupta
                  </p>
                  <p className="text-sm text-[var(--color-fg-2)]">
                    AI-powered full stack developer · building MCP servers & editorial web UX
                  </p>
                </div>
              </div>
              <Link
                href="/blog"
                className="inline-flex h-10 items-center justify-center rounded-full border border-[var(--color-surface-4)] px-5 font-mono text-[11px] uppercase tracking-[var(--tracking-wider)] text-[var(--color-fg-2)] transition-colors hover:border-[var(--color-accent-400)]/60 hover:text-[var(--color-accent-400)]"
              >
                More posts →
              </Link>
            </div>
          </footer>
        </div>
      </div>
    </section>
  );
}
