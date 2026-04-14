import type { Metadata } from "next";
import { getBlogPosts, getBlogTags } from "@/lib/queries";
import { typeClasses } from "@/lib/type-classes";
import { GlowCard } from "@/components/ui/glow-card";
import { Button } from "@/components/ui/button";
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
    <section className="pt-32 pb-[15vh]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <p className={`${typeClasses.micro} mb-4 text-primary`}>Blog</p>
          <h1 className={typeClasses.h1}>Thoughts & Insights</h1>
        </div>

        {posts.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <GlowCard className="group h-full">
                  <p className="mb-2 font-mono text-xs text-muted-foreground">
                    {new Date(post.published_at!).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                    {post.reading_time_minutes && (
                      <> &middot; {post.reading_time_minutes} min read</>
                    )}
                  </p>
                  <h2 className="mb-3 font-display text-lg font-semibold group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="line-clamp-3 text-sm text-muted-foreground">
                      {post.excerpt}
                    </p>
                  )}
                  {post.blog_post_tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {post.blog_post_tags.map(({ blog_tags: tag }) => (
                        <span
                          key={tag.id}
                          className="rounded-full bg-surface px-2.5 py-0.5 text-[11px] font-medium text-primary/80"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </GlowCard>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mx-auto max-w-md text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-surface">
              <HiOutlinePencilSquare className="h-8 w-8 text-primary" />
            </div>
            <h2 className="mb-3 font-display text-xl font-semibold">
              Blog Coming Soon
            </h2>
            <p className="mb-8 text-muted-foreground">
              I&apos;m working on articles about AI integration, MCP servers,
              system design, and modern web development. Stay tuned.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {tags.map((tag) => (
                <span
                  key={tag.id}
                  className="glass-panel rounded-full px-4 py-1.5 text-xs font-medium text-primary/80"
                >
                  {tag.name}
                </span>
              ))}
            </div>

            <div className="mt-10">
              <Button variant="secondary" asChild>
                <Link href="/#contact">Get Notified</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
