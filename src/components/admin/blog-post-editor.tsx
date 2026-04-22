"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  createBlogPostAction,
  updateBlogPostAction,
} from "../../app/admin/actions";

const inputClass =
  "w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-400)]/40";

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

export type BlogPostEditorPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image: string | null;
  published: boolean;
  reading_time_minutes: number | null;
  blog_post_tags?: {
    blog_tags: { id: string; name: string; slug: string };
  }[];
};

type Props =
  | { mode: "create" }
  | { mode: "edit"; post: BlogPostEditorPost };

function tagsValue(post?: BlogPostEditorPost) {
  return post?.blog_post_tags?.map((pt) => pt.blog_tags.name).join(", ") ?? "";
}

export function BlogPostEditor(props: Props) {
  const post = props.mode === "edit" ? props.post : undefined;
  const [content, setContent] = useState(post?.content ?? "");
  const [showPreview, setShowPreview] = useState(props.mode === "edit");
  const action = props.mode === "create" ? createBlogPostAction : updateBlogPostAction;
  const submitLabel = props.mode === "create" ? "Create Post" : "Save Post";

  return (
    <form action={action} className="mt-4 space-y-3">
      {post && <input type="hidden" name="id" value={post.id} />}

      <div className={post ? "grid gap-3 md:grid-cols-[1fr_auto]" : ""}>
        <label className="block space-y-2 text-sm">
          <span className="text-foreground/80">Title</span>
          <input
            name="title"
            placeholder="Post title"
            required={props.mode === "create"}
            defaultValue={post?.title ?? ""}
            className={inputClass}
          />
        </label>

        {post && (
          <label className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm">
            <input type="checkbox" name="published" defaultChecked={post.published} />
            Published
          </label>
        )}
      </div>

      <label className="block space-y-2 text-sm">
        <span className="text-foreground/80">Slug</span>
        <input
          name="slug"
          placeholder="Auto-generated if empty"
          defaultValue={post?.slug ?? ""}
          className={inputClass}
        />
      </label>

      <label className="block space-y-2 text-sm">
        <span className="text-foreground/80">Excerpt</span>
        <textarea
          name="excerpt"
          rows={2}
          placeholder={post ? "Excerpt" : "Short excerpt"}
          defaultValue={post?.excerpt ?? ""}
          className={inputClass}
        />
      </label>

      <label className="block space-y-2 text-sm">
        <span className="text-foreground/80">
          Content (HTML + Tailwind classes supported)
        </span>
        <textarea
          name="content"
          rows={post ? 10 : 8}
          placeholder="Post content..."
          value={content}
          onChange={(event) => setContent(event.target.value)}
          className={inputClass}
        />
        <span className="block text-xs text-foreground/60">
          Write raw HTML. Tailwind utility classes and inline &lt;style&gt; are
          allowed. Preview below updates as you type.
        </span>
      </label>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowPreview((value) => !value)}
          className="rounded-full border border-white/15 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[var(--tracking-wider)] text-foreground/70 transition-colors hover:border-[var(--color-accent-400)]/60 hover:text-[var(--color-accent-400)]"
        >
          {showPreview ? "Hide Preview" : "Show Preview"}
        </button>
      </div>

      {showPreview && (
        <div className="rounded-xl border border-[var(--color-accent-400)]/35 bg-[var(--color-surface-1)] p-4">
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[var(--tracking-wider)] text-[var(--color-accent-400)]">
            Live Preview
          </p>
          {content.trim() ? (
            <div
              className={proseClassName}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : (
            <p className="text-sm text-foreground/60">
              Nothing to preview yet. Start typing HTML above.
            </p>
          )}
        </div>
      )}

      <label className="block space-y-2 text-sm">
        <span className="text-foreground/80">Tags (comma-separated, auto-created)</span>
        <input
          name="tags"
          defaultValue={tagsValue(post)}
          placeholder="AI, MCP, Claude"
          className={inputClass}
        />
      </label>

      <div className={post ? "grid gap-3 md:grid-cols-[1fr_auto]" : "grid gap-3 md:grid-cols-[1fr_auto_auto]"}>
        <label className="block space-y-2 text-sm">
          <span className="text-foreground/80">Cover Image URL</span>
          <input
            name="cover_image"
            placeholder="https://..."
            defaultValue={post?.cover_image ?? ""}
            className={inputClass}
          />
        </label>
        <label className="block space-y-2 text-sm">
          <span className="text-foreground/80">Read Time</span>
          <input
            name="reading_time_minutes"
            type="number"
            min={1}
            defaultValue={post?.reading_time_minutes ?? 5}
            className="w-28 rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm"
          />
        </label>
        {!post && (
          <label className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm">
            <input type="checkbox" name="published" />
            Publish now
          </label>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit" size="sm">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
