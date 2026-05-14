import "server-only";
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

/**
 * Author tools for the manual blog_posts table on amargupta.tech.
 *
 * Auth: the /api/mcp route enforces a bearer-token shared secret before
 * invoking any tool, so handlers here can use the service-role client
 * directly (single-operator product, no per-user RLS to walk).
 *
 * Distinct from Auto-Blog (Swayam-owned, writes blog_published) — these
 * tools target blog_posts, which the existing /blog and /blog/[slug]
 * routes render through getCombinedBlogPosts / getCombinedBlogPostBySlug.
 */

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function defaultSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function readingMinutesFromBody(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

function okJson(body: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(body) }],
  };
}

function errText(message: string) {
  return {
    content: [{ type: "text" as const, text: `Error: ${message}` }],
    isError: true,
  };
}

const ListPostsArgs = {
  published: z
    .boolean()
    .optional()
    .describe(
      "true = only published, false = only drafts, omit = both (default)",
    ),
  limit: z.number().int().min(1).max(200).default(30),
};

const GetPostArgs = {
  identifier: z
    .string()
    .min(1)
    .describe("Either the post slug or its uuid id."),
};

const CreatePostArgs = {
  title: z.string().min(3).max(200),
  slug: z
    .string()
    .regex(SLUG_RE)
    .max(80)
    .optional()
    .describe("Optional; derived from title if omitted."),
  excerpt: z.string().max(400).optional(),
  content: z.string().min(1).describe("Markdown or HTML body of the post."),
  cover_image: z.string().url().optional(),
  published: z
    .boolean()
    .default(false)
    .describe("Set true to publish immediately; defaults to draft."),
  reading_time_minutes: z
    .number()
    .int()
    .min(1)
    .optional()
    .describe("Optional override; estimated from body if omitted."),
};

const UpdatePostArgs = {
  id: z.string().uuid(),
  title: z.string().min(3).max(200).optional(),
  slug: z.string().regex(SLUG_RE).max(80).optional(),
  excerpt: z.string().max(400).optional(),
  content: z.string().min(1).optional(),
  cover_image: z.string().url().optional(),
  reading_time_minutes: z.number().int().min(1).optional(),
};

const PublishPostArgs = {
  id: z.string().uuid(),
  published: z
    .boolean()
    .default(true)
    .describe("true publishes (default); false unpublishes."),
};

const ListTagsArgs = {};

const AttachTagsArgs = {
  post_id: z.string().uuid(),
  tag_slugs: z
    .array(z.string().regex(SLUG_RE).max(60))
    .min(1)
    .describe(
      "Tag slugs to attach. Tags are created on the fly if a slug doesn't exist yet.",
    ),
};

export function registerBlogTools(server: McpServer) {
  server.registerTool(
    "blog_list_posts",
    {
      description: [
        "List blog posts on amargupta.tech. Returns recent posts (default 30, max 200).",
        "Filter by published=true (live posts) or published=false (drafts). Omit to see both.",
      ].join("\n"),
      inputSchema: ListPostsArgs,
    },
    async (args) => {
      const supabase = createServiceRoleClient();
      const parsed = z.object(ListPostsArgs).parse(args);
      let q = supabase
        .from("blog_posts")
        .select(
          "id, slug, title, excerpt, published, published_at, reading_time_minutes, cover_image, created_at, updated_at",
        )
        .order("created_at", { ascending: false })
        .limit(parsed.limit);
      if (parsed.published === true) q = q.eq("published", true);
      if (parsed.published === false) q = q.eq("published", false);
      const { data, error } = await q;
      if (error) return errText(`list failed: ${error.message}`);
      return okJson({ posts: data ?? [] });
    },
  );

  server.registerTool(
    "blog_get_post",
    {
      description:
        "Fetch a single blog post by slug or uuid id. Returns title, body content, tags, and metadata.",
      inputSchema: GetPostArgs,
    },
    async (args) => {
      const supabase = createServiceRoleClient();
      const parsed = z.object(GetPostArgs).parse(args);
      const ident = parsed.identifier;
      const isUuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          ident,
        );
      const { data, error } = await supabase
        .from("blog_posts")
        .select(
          "*, blog_post_tags(blog_tags(*))",
        )
        .eq(isUuid ? "id" : "slug", ident)
        .maybeSingle();
      if (error) return errText(`get failed: ${error.message}`);
      if (!data) return errText(`post ${ident} not found`);
      return okJson({ post: data });
    },
  );

  server.registerTool(
    "blog_create_post",
    {
      description: [
        "Create a new blog post on amargupta.tech.",
        "Defaults to draft (published=false). Pass published=true to ship immediately.",
        "Slug is derived from the title unless explicitly provided. reading_time_minutes is estimated from the body if omitted.",
      ].join("\n"),
      inputSchema: CreatePostArgs,
    },
    async (args) => {
      const supabase = createServiceRoleClient();
      const parsed = z.object(CreatePostArgs).parse(args);
      const slug = parsed.slug ?? defaultSlug(parsed.title);
      if (!slug) return errText("could not derive a valid slug from title");
      const reading =
        parsed.reading_time_minutes ?? readingMinutesFromBody(parsed.content);
      const row = {
        slug,
        title: parsed.title,
        excerpt: parsed.excerpt ?? null,
        content: parsed.content,
        cover_image: parsed.cover_image ?? null,
        published: parsed.published,
        published_at: parsed.published ? new Date().toISOString() : null,
        reading_time_minutes: reading,
      };
      const { data, error } = await supabase
        .from("blog_posts")
        .insert(row)
        .select("id, slug, published, published_at")
        .single();
      if (error) return errText(`create failed: ${error.message}`);
      return okJson({
        id: data.id,
        slug: data.slug,
        published: data.published,
        published_at: data.published_at,
        url: data.published
          ? `https://amargupta.tech/blog/${data.slug}`
          : null,
      });
    },
  );

  server.registerTool(
    "blog_update_post",
    {
      description: [
        "Patch an existing blog post by id. Only provided fields are updated.",
        "Does not toggle publish state — use blog_publish_post for that.",
      ].join("\n"),
      inputSchema: UpdatePostArgs,
    },
    async (args) => {
      const supabase = createServiceRoleClient();
      const parsed = z.object(UpdatePostArgs).parse(args);
      const { id, ...patch } = parsed;
      const clean: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(patch)) {
        if (v !== undefined) clean[k] = v;
      }
      if (Object.keys(clean).length === 0) {
        return errText("nothing to update — pass at least one field");
      }
      if (
        parsed.content !== undefined &&
        parsed.reading_time_minutes === undefined
      ) {
        clean.reading_time_minutes = readingMinutesFromBody(parsed.content);
      }
      clean.updated_at = new Date().toISOString();
      const { data, error } = await supabase
        .from("blog_posts")
        .update(clean)
        .eq("id", id)
        .select("id, slug, published")
        .single();
      if (error) return errText(`update failed: ${error.message}`);
      return okJson({ id: data.id, slug: data.slug, updated: true });
    },
  );

  server.registerTool(
    "blog_publish_post",
    {
      description: [
        "Toggle a post's publish state. Stamps published_at on publish; clears it on unpublish.",
        "On publish, the post appears on amargupta.tech/blog within seconds (route is force-dynamic).",
      ].join("\n"),
      inputSchema: PublishPostArgs,
    },
    async (args) => {
      const supabase = createServiceRoleClient();
      const parsed = z.object(PublishPostArgs).parse(args);
      const update: Record<string, unknown> = {
        published: parsed.published,
        published_at: parsed.published ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      };
      const { data, error } = await supabase
        .from("blog_posts")
        .update(update)
        .eq("id", parsed.id)
        .select("id, slug, published, published_at")
        .single();
      if (error) return errText(`publish toggle failed: ${error.message}`);
      return okJson({
        id: data.id,
        slug: data.slug,
        published: data.published,
        published_at: data.published_at,
        url: data.published
          ? `https://amargupta.tech/blog/${data.slug}`
          : null,
      });
    },
  );

  server.registerTool(
    "blog_list_tags",
    {
      description: "List every blog tag (name + slug).",
      inputSchema: ListTagsArgs,
    },
    async () => {
      const supabase = createServiceRoleClient();
      const { data, error } = await supabase
        .from("blog_tags")
        .select("id, name, slug")
        .order("name", { ascending: true });
      if (error) return errText(`tags list failed: ${error.message}`);
      return okJson({ tags: data ?? [] });
    },
  );

  server.registerTool(
    "blog_attach_tags_to_post",
    {
      description: [
        "Attach one or more tags to a post by their slugs. Tags are created on the fly if a slug doesn't exist yet (name = title-cased slug).",
        "Existing (post_id, tag_id) links are preserved — this is additive, never destructive.",
      ].join("\n"),
      inputSchema: AttachTagsArgs,
    },
    async (args) => {
      const supabase = createServiceRoleClient();
      const parsed = z.object(AttachTagsArgs).parse(args);
      // Resolve existing tags by slug
      const { data: existingTags, error: tagsErr } = await supabase
        .from("blog_tags")
        .select("id, slug")
        .in("slug", parsed.tag_slugs);
      if (tagsErr) return errText(`tag lookup failed: ${tagsErr.message}`);
      const seen = new Set(
        (existingTags ?? []).map((t: { slug: string }) => t.slug),
      );
      const missing = parsed.tag_slugs.filter((s) => !seen.has(s));
      let createdTags: Array<{ id: string; slug: string }> = [];
      if (missing.length > 0) {
        const titleCase = (s: string) =>
          s
            .split("-")
            .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
            .join(" ");
        const rows = missing.map((slug) => ({ slug, name: titleCase(slug) }));
        const { data: ins, error: insErr } = await supabase
          .from("blog_tags")
          .insert(rows)
          .select("id, slug");
        if (insErr) return errText(`tag create failed: ${insErr.message}`);
        createdTags = ins ?? [];
      }
      const allTags = [
        ...((existingTags ?? []) as Array<{ id: string; slug: string }>),
        ...createdTags,
      ];
      const linkRows = allTags.map((t) => ({
        post_id: parsed.post_id,
        tag_id: t.id,
      }));
      // upsert on the composite PK so re-attaching is a no-op
      const { error: linkErr } = await supabase
        .from("blog_post_tags")
        .upsert(linkRows, { onConflict: "post_id,tag_id" });
      if (linkErr) return errText(`link insert failed: ${linkErr.message}`);
      return okJson({
        post_id: parsed.post_id,
        attached: allTags.map((t) => t.slug),
        created: createdTags.map((t) => t.slug),
      });
    },
  );
}
