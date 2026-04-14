import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getBlogPostBySlug, getAllBlogSlugs } from "@/lib/queries";
import { typeClasses } from "@/lib/type-classes";
import { Button } from "@/components/ui/button";
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
    <section className="pt-32 pb-[15vh]">
      <div className="mx-auto max-w-3xl px-6">
        <Link
          href="/blog"
          className="mb-8 inline-flex items-center gap-2 text-sm text-foreground/60 transition-colors hover:text-primary"
        >
          <IoArrowBack size={14} />
          Back to Blog
        </Link>

        {post.cover_image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.cover_image}
            alt={post.title}
            className="mb-10 aspect-video w-full rounded-2xl border border-white/10 object-cover"
          />
        )}

        <div className="mb-6">
          <p className="mb-4 font-mono text-xs text-muted-foreground">
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

          <h1 className={typeClasses.h1}>{post.title}</h1>

          {post.excerpt && (
            <p className="mt-4 text-lg text-foreground/60">{post.excerpt}</p>
          )}

          {tags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag.id}
                  className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-primary/80"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>

        <hr className="my-8 border-white/10" />

        {post.content ? (
          <article
            className="prose prose-invert prose-lg max-w-none
              prose-headings:font-display prose-headings:tracking-tight
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-code:rounded prose-code:bg-surface prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm
              prose-pre:rounded-xl prose-pre:border prose-pre:border-white/10 prose-pre:bg-black/30
              prose-img:rounded-xl prose-img:border prose-img:border-white/10
              prose-blockquote:border-primary/40 prose-blockquote:text-foreground/70"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        ) : (
          <p className="text-center text-foreground/50">
            This post has no content yet.
          </p>
        )}

        <div className="mt-16 text-center">
          <Button variant="secondary" asChild>
            <Link href="/blog">View All Posts</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
