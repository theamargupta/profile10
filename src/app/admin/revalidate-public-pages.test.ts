import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Public pages are cached on the CDN (docs/specs/public-pages-cdn-cache.md).
// An admin write to public content must revalidate all of them — the footer's
// socials and AuthorBio's profile render on every post — and only once the
// write has succeeded.
const { revalidatePath, state } = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  state: {
    error: null as { message: string } | null,
    // Fail only the nth write to this table, so a loop can get partway through.
    failOn: null as { table: string; nth: number } | null,
    calls: {} as Record<string, number>,
  },
}));

vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: { id: "user-1" } } }) },
    from: (table: string) => {
      const n = (state.calls[table] = (state.calls[table] ?? 0) + 1);
      const err =
        state.failOn?.table === table && state.failOn.nth === n ? { message: `${table} #${n} failed` } : state.error;
      const chain: Record<string, unknown> = {};
      for (const m of ["select", "insert", "update", "delete", "upsert", "eq", "in", "ilike", "limit", "single", "maybeSingle"]) {
        chain[m] = () => chain;
      }
      chain.then = (resolve: (v: unknown) => unknown) =>
        resolve({ data: err ? null : table === "tools" ? [] : { id: "x" }, error: err });
      return chain;
    },
  }),
}));

import {
  createBlogPostAction,
  createProjectFromJsonAction,
  deleteBlogPostAction,
  deleteContactSubmissionAction,
  deleteProjectAction,
  deleteToolAction,
  updateBlogPostAction,
  updateSocialAction,
} from "@/app/admin/actions";

function form(values: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(values)) fd.set(k, v);
  return fd;
}

const PUBLIC_WRITES: Array<[string, (fd: FormData) => Promise<unknown>, FormData]> = [
  ["deleteBlogPostAction", deleteBlogPostAction, form({ id: "p1" })],
  ["deleteProjectAction", deleteProjectAction, form({ id: "proj" })],
  ["updateSocialAction", updateSocialAction, form({ id: "s1", platform: "x", url: "https://x.com/a" })],
  ["deleteToolAction", deleteToolAction, form({ id: "t1" })],
];

beforeEach(() => {
  revalidatePath.mockClear();
  state.error = null;
  state.failOn = null;
  state.calls = {};
});

describe("admin writes revalidate the public pages", () => {
  it.each(PUBLIC_WRITES)("%s revalidates every public page after a successful write", async (_n, action, fd) => {
    await expect(action(fd)).rejects.toThrow("NEXT_REDIRECT");
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  it.each(PUBLIC_WRITES)("%s leaves the cache alone when the write fails", async (_n, action, fd) => {
    state.error = { message: "boom" };
    await expect(action(fd)).rejects.toThrow("NEXT_REDIRECT");
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  // Codex review 2026-10-14: the JSON import writes projects in a loop. If
  // project 2 fails, project 1 is already public and must not stay cached out.
  it("createProjectFromJsonAction revalidates when project 1 was written and project 2 failed", async () => {
    state.failOn = { table: "projects", nth: 2 };
    const json = JSON.stringify([
      { id: "one", title: "One", description: "First" },
      { id: "two", title: "Two", description: "Second" },
    ]);
    await expect(createProjectFromJsonAction(form({ json }))).rejects.toThrow("NEXT_REDIRECT");
    expect(state.calls.projects).toBe(2);
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  it("createProjectFromJsonAction leaves the cache alone when its first write fails", async () => {
    state.failOn = { table: "projects", nth: 1 };
    const json = JSON.stringify({ id: "one", title: "One", description: "First" });
    await expect(createProjectFromJsonAction(form({ json }))).rejects.toThrow("NEXT_REDIRECT");
    expect(state.calls.projects).toBe(1);
    expect(revalidatePath).not.toHaveBeenCalledWith("/", "layout");
  });

  // Codex re-review 2026-10-14: the post is written first, then its tags are
  // synced. A tag failure redirects with an error, but the post is public already.
  it.each([
    ["createBlogPostAction", createBlogPostAction, form({ title: "A post", published: "on", tags: "ai" })],
    ["updateBlogPostAction", updateBlogPostAction, form({ id: "p1", title: "A post", slug: "a-post", tags: "ai" })],
  ] as const)("%s revalidates when the post was written and the tag sync failed", async (_n, action, fd) => {
    state.failOn = { table: "blog_tags", nth: 1 };
    await expect(action(fd)).rejects.toThrow("NEXT_REDIRECT");
    expect(state.calls.blog_posts).toBe(1);
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  it("a contact-inbox write does not touch the public cache", async () => {
    await expect(deleteContactSubmissionAction(form({ id: "c1" }))).rejects.toThrow("NEXT_REDIRECT");
    expect(revalidatePath).not.toHaveBeenCalledWith("/", "layout");
  });

  // Every admin action ends its success path with revalidatePath("/admin").
  // All of them except the contact inbox write public content, so each must
  // revalidate the public pages too. A new action that forgets it fails here.
  it("every public-content action calls revalidatePublicPages", () => {
    const src = readFileSync(join(process.cwd(), "src/app/admin/actions.ts"), "utf8");
    const actions = src.split(/^export async function /m).slice(1);
    const missing = actions
      .filter((body) => body.includes('revalidatePath("/admin")'))
      .filter((body) => !body.includes("contact_submissions"))
      .filter((body) => !body.includes("revalidatePublicPages()"))
      .map((body) => body.slice(0, body.indexOf("(")));
    expect(missing).toEqual([]);
  });
});
