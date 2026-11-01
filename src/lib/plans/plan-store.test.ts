import { beforeEach, describe, expect, it, vi } from "vitest";

// A recording stand-in for the supabase-js query builder: every call is logged
// in `calls`, the final await resolves to `state.result`.
const { calls, state } = vi.hoisted(() => ({
  calls: [] as Array<[string, ...unknown[]]>,
  state: { result: { data: null, error: null } as { data: unknown; error: { message: string } | null } },
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/service-role", () => ({
  createServiceRoleClient: () => ({
    from: (table: string) => {
      calls.push(["from", table]);
      const chain: Record<string, unknown> = {};
      for (const m of ["select", "upsert", "delete", "eq", "lt", "gt", "maybeSingle"]) {
        chain[m] = (...args: unknown[]) => {
          calls.push([m, ...args]);
          return chain;
        };
      }
      chain.then = (resolve: (v: unknown) => unknown) => resolve(state.result);
      return chain;
    },
  }),
}));

import { getPlan, unpublishPlan, upsertPlan } from "./plan-store";

const TOKEN = "Ab3_-Zx9Qw7Lm2Kp";
const NOW = new Date("2026-11-01T10:00:00.000Z");
const PLAN = {
  title: "T",
  prepared_for: "P",
  summary: "S",
  sections: [{ heading: "H", bullets: ["b"] }],
};

beforeEach(() => {
  calls.length = 0;
  state.result = { data: null, error: null };
});

describe("upsertPlan", () => {
  it("writes the row with expires_at 60 days from now and reports it", async () => {
    const res = await upsertPlan(TOKEN, PLAN, NOW);
    const upsert = calls.find((c) => c[0] === "upsert");
    expect(upsert).toBeDefined();
    const [row, opts] = upsert!.slice(1) as [Record<string, unknown>, Record<string, unknown>];
    expect(row).toMatchObject({ token: TOKEN, plan: PLAN });
    expect(row.expires_at).toBe("2026-12-31T10:00:00.000Z");
    expect(opts).toMatchObject({ onConflict: "token" });
    expect(res).toEqual({ token: TOKEN, expires_at: "2026-12-31T10:00:00.000Z" });
  });
  it("deletes already-expired rows first", async () => {
    await upsertPlan(TOKEN, PLAN, NOW);
    const names = calls.map((c) => c[0]);
    expect(names.indexOf("delete")).toBeGreaterThan(-1);
    expect(names.indexOf("delete")).toBeLessThan(names.indexOf("upsert"));
    expect(calls).toContainEqual(["lt", "expires_at", NOW.toISOString()]);
  });
  it("throws with context when the database fails", async () => {
    state.result = { data: null, error: { message: "boom" } };
    await expect(upsertPlan(TOKEN, PLAN, NOW)).rejects.toThrow(/plan_upsert.*boom/s);
  });
  it("refuses a bad token or plan before touching the database", async () => {
    await expect(upsertPlan("short", PLAN, NOW)).rejects.toThrow();
    await expect(upsertPlan(TOKEN, { ...PLAN, html: "x" } as never, NOW)).rejects.toThrow();
    expect(calls).toEqual([]);
  });
});

describe("unpublishPlan", () => {
  it("deletes by token and says whether a row went", async () => {
    state.result = { data: [{ token: TOKEN }], error: null };
    expect(await unpublishPlan(TOKEN)).toEqual({ token: TOKEN, deleted: true });
    expect(calls).toContainEqual(["eq", "token", TOKEN]);
  });
  it("reports deleted:false for an unknown token (idempotent)", async () => {
    state.result = { data: [], error: null };
    expect(await unpublishPlan(TOKEN)).toEqual({ token: TOKEN, deleted: false });
  });
  it("throws with context when the database fails", async () => {
    state.result = { data: null, error: { message: "boom" } };
    await expect(unpublishPlan(TOKEN)).rejects.toThrow(/plan_unpublish.*boom/s);
  });
});

describe("getPlan", () => {
  it("reads one unexpired row by token and returns the validated plan", async () => {
    state.result = { data: { plan: PLAN, expires_at: "2026-12-31T10:00:00.000Z" }, error: null };
    expect(await getPlan(TOKEN, NOW)).toEqual(PLAN);
    expect(calls).toContainEqual(["eq", "token", TOKEN]);
    expect(calls).toContainEqual(["gt", "expires_at", NOW.toISOString()]);
  });
  it("returns null for an unknown or expired token", async () => {
    state.result = { data: null, error: null };
    expect(await getPlan(TOKEN, NOW)).toBeNull();
  });
  it("returns null for a malformed token without a database read", async () => {
    expect(await getPlan("../etc", NOW)).toBeNull();
    expect(calls).toEqual([]);
  });
  it("throws on a database error, never turns it into 'not found'", async () => {
    state.result = { data: null, error: { message: "relation does not exist" } };
    await expect(getPlan(TOKEN, NOW)).rejects.toThrow(/relation does not exist/);
  });
  it("throws when the stored JSON no longer matches the schema", async () => {
    state.result = { data: { plan: { title: "only a title" }, expires_at: "2026-12-31T10:00:00.000Z" }, error: null };
    await expect(getPlan(TOKEN, NOW)).rejects.toThrow(/stored plan/);
  });
});
