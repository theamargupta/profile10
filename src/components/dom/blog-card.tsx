import Image from "next/image";
import Link from "next/link";
import type { BlogPost } from "@/lib/types";

type BlogCardProps = { post: BlogPost; variant?: "default" | "featured" };

function formatPublishedDate(date: string | null) {
  if (!date) return "Undated";
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function CoverImage({ post, featured }: { post: BlogPost; featured: boolean }) {
  const className = featured
    ? "h-full min-h-72 w-full object-cover transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none"
    : "aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none";

  if (!post.cover_image) {
    return (
      <div
        className={`${featured ? "h-full min-h-72" : "aspect-[16/10]"} bg-gradient-to-br from-[var(--color-accent-400)]/20 via-[var(--color-surface-2)] to-[var(--color-surface-1)]`}
      />
    );
  }

  return (
    <Image
      src={post.cover_image}
      alt={post.title}
      width={featured ? 900 : 720}
      height={featured ? 640 : 450}
      className={className}
    />
  );
}

export function BlogCard({ post, variant = "default" }: BlogCardProps) {
  const featured = variant === "featured";
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <article
        className={`h-full overflow-hidden rounded-3xl border border-[var(--color-surface-3)] bg-[var(--color-surface-1)]/70 backdrop-blur-xl transition-colors duration-500 hover:border-[var(--color-accent-400)]/60 motion-reduce:transition-none ${
          featured ? "grid md:grid-cols-[0.92fr_1fr]" : ""
        }`}
      >
        <div className="relative overflow-hidden border-b border-[var(--color-surface-3)] md:border-b-0 md:border-r">
          <CoverImage post={post} featured={featured} />
          {post.video_url && (
            <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1 font-mono text-[11px] font-medium text-white backdrop-blur-sm">
              <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
              Video
            </span>
          )}
        </div>

        <div className={featured ? "flex flex-col justify-center p-8 md:p-10" : "p-7"}>
          <p className="mb-3 font-mono text-xs uppercase tracking-[var(--tracking-wider)] text-[var(--color-fg-2)]">
            {formatPublishedDate(post.published_at)}
            {post.reading_time_minutes ? ` · ${post.reading_time_minutes} min read` : ""}
          </p>

          <h2
            className={`font-display font-semibold text-[var(--color-fg-0)] ${
              featured ? "mb-4" : "mb-3"
            }`}
            style={{
              fontSize: featured ? "var(--text-3xl)" : "var(--text-xl)",
              lineHeight: "var(--leading-tight)",
            }}
          >
            <span className="bg-[linear-gradient(var(--color-accent-400),var(--color-accent-400))] bg-[length:0%_1px] bg-[0_100%] bg-no-repeat transition-[background-size] duration-500 group-hover:bg-[length:100%_1px] motion-reduce:transition-none">
              {post.title}
            </span>
          </h2>

          {post.excerpt && (
            <p
              className="line-clamp-2 text-[var(--color-fg-1)]"
              style={{ fontSize: featured ? "var(--text-base)" : "var(--text-sm)" }}
            >
              {post.excerpt}
            </p>
          )}

          {post.blog_post_tags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-1.5">
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
      </article>
    </Link>
  );
}
