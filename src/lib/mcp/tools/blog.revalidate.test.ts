import { beforeEach, describe, expect, it, vi } from "vitest";

// Public pages are cached on the CDN now (docs/specs/public-pages-cdn-cache.md),
// so a blog write over MCP must revalidate them — and only once the write has
// succeeded. A failed write must leave the cache alone.
const { revalidatePath, state } = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  state: {
    error: null as { message: string } | null,
    // Fail only this table, so a multi-step tool can get partway through.
    failTable: null as string | null,
  },
}));

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("@/lib/supabase/service-role", () => ({
  createServiceRoleClient: () => ({
    from: (table: string) => {
      const data =
        table === "blog_tags"
          ? [{ id: "t1", slug: "ai" }]
          : { id: POST_ID, slug: "a-post", published: true, published_at: "2026-10-14T00:00:00Z" };
      const err = state.failTable === table ? { message: `${table} failed` } : state.error;
      const result = () => ({ data: err ? null : data, error: err });
      const chain: Record<string, unknown> = {};
      for (const m of ["select", "insert", "update", "upsert", "eq", "in", "order", "limit", "single", "maybeSingle"]) {
        chain[m] = () => chain;
      }
      chain.then = (resolve: (v: unknown) => unknown) => resolve(result());
      return chain;
    },
  }),
}));

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerBlogTools } from "./blog";

const POST_ID = "11111111-1111-4111-8111-111111111111";
type Handler = (args: unknown) => Promise<{ isError?: boolean }>;
const handlers = new Map<string, Handler>();
registerBlogTools({
  registerTool: (name: string, _config: unknown, handler: Handler) => handlers.set(name, handler),
} as unknown as McpServer);

const WRITES: Array<[string, Record<string, unknown>]> = [
  ["blog_create_post", { title: "A post", content: "body", published: true }],
  ["blog_update_post", { id: POST_ID, title: "A post, renamed" }],
  ["blog_publish_post", { id: POST_ID, published: true }],
  ["blog_publish_post", { id: POST_ID, published: false }],
  ["blog_attach_tags_to_post", { post_id: POST_ID, tag_slugs: ["ai"] }],
];

beforeEach(() => {
  revalidatePath.mockClear();
  state.error = null;
  state.failTable = null;
});

describe("MCP blog writes revalidate the public pages", () => {
  it.each(WRITES)("%s revalidates every public page after a successful write", async (tool, args) => {
    const res = await handlers.get(tool)!(args);
    expect(res.isError).toBeUndefined();
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  it.each(WRITES)("%s leaves the cache alone when the write fails", async (tool, args) => {
    state.error = { message: "boom" };
    const res = await handlers.get(tool)!(args);
    expect(res.isError).toBe(true);
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  // Codex review 2026-10-14: a new tag row is public (/blog lists tags) once it
  // is inserted, even if linking it to the post then fails.
  it("blog_attach_tags_to_post revalidates when it created a tag but the link failed", async () => {
    state.failTable = "blog_post_tags";
    const res = await handlers.get("blog_attach_tags_to_post")!({ post_id: POST_ID, tag_slugs: ["ai", "brand-new"] });
    expect(res.isError).toBe(true);
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  it("blog_attach_tags_to_post leaves the cache alone when nothing was written", async () => {
    state.failTable = "blog_post_tags";
    const res = await handlers.get("blog_attach_tags_to_post")!({ post_id: POST_ID, tag_slugs: ["ai"] });
    expect(res.isError).toBe(true);
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("a draft created unpublished does not touch the public cache", async () => {
    await handlers.get("blog_create_post")!({ title: "A draft", content: "body" });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("read-only tools never revalidate", async () => {
    await handlers.get("blog_list_tags")!({});
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
