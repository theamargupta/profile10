import { beforeEach, describe, expect, it, vi } from "vitest";

const { upsertPlan, unpublishPlan } = vi.hoisted(() => ({
  upsertPlan: vi.fn(),
  unpublishPlan: vi.fn(),
}));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/plans/plan-store", () => ({ upsertPlan, unpublishPlan }));

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerPlanTools } from "./plans";

type Result = { isError?: boolean; content: Array<{ text: string }> };
type Handler = (args: unknown) => Promise<Result>;
const handlers = new Map<string, Handler>();
const configs = new Map<string, { inputSchema: Record<string, unknown> }>();
registerPlanTools({
  registerTool: (name: string, config: { inputSchema: Record<string, unknown> }, handler: Handler) => {
    handlers.set(name, handler);
    configs.set(name, config);
  },
} as unknown as McpServer);

const TOKEN = "Ab3_-Zx9Qw7Lm2Kp";
const PLAN = { title: "T", prepared_for: "P", summary: "S", sections: [{ heading: "H", bullets: ["b"] }] };

beforeEach(() => {
  upsertPlan.mockReset();
  unpublishPlan.mockReset();
});

describe("plan tools", () => {
  it("registers exactly plan_upsert and plan_unpublish", () => {
    expect([...handlers.keys()].sort()).toEqual(["plan_unpublish", "plan_upsert"]);
  });

  it("plan_upsert stores the plan and returns the token, expiry and public path", async () => {
    upsertPlan.mockResolvedValue({ token: TOKEN, expires_at: "2026-12-31T10:00:00.000Z" });
    const res = await handlers.get("plan_upsert")!({ token: TOKEN, plan: PLAN });
    expect(res.isError).toBeUndefined();
    expect(upsertPlan).toHaveBeenCalledWith(TOKEN, PLAN);
    expect(JSON.parse(res.content[0].text)).toEqual({
      token: TOKEN,
      expires_at: "2026-12-31T10:00:00.000Z",
      path: `/plans/${TOKEN}`,
    });
  });

  it("plan_upsert rejects an invalid plan as an error naming the field, and writes nothing", async () => {
    const res = await handlers.get("plan_upsert")!({ token: TOKEN, plan: { ...PLAN, title: "" } });
    expect(res.isError).toBe(true);
    expect(res.content[0].text).toMatch(/plan\.title/);
    expect(upsertPlan).not.toHaveBeenCalled();
  });

  it("plan_upsert rejects a bad token as an error, and writes nothing", async () => {
    const res = await handlers.get("plan_upsert")!({ token: "short", plan: PLAN });
    expect(res.isError).toBe(true);
    expect(res.content[0].text).toMatch(/token/);
    expect(upsertPlan).not.toHaveBeenCalled();
  });

  it("plan_upsert turns a store failure into an error result with context", async () => {
    upsertPlan.mockRejectedValue(new Error("plan_upsert failed for token Ab3_: boom"));
    const res = await handlers.get("plan_upsert")!({ token: TOKEN, plan: PLAN });
    expect(res.isError).toBe(true);
    expect(res.content[0].text).toMatch(/boom/);
  });

  it("plan_unpublish deletes by token and passes the answer through", async () => {
    unpublishPlan.mockResolvedValue({ token: TOKEN, deleted: true });
    const res = await handlers.get("plan_unpublish")!({ token: TOKEN });
    expect(res.isError).toBeUndefined();
    expect(unpublishPlan).toHaveBeenCalledWith(TOKEN);
    expect(JSON.parse(res.content[0].text)).toEqual({ token: TOKEN, deleted: true });
  });

  it("plan_unpublish rejects a bad token", async () => {
    const res = await handlers.get("plan_unpublish")!({ token: "../x" });
    expect(res.isError).toBe(true);
    expect(unpublishPlan).not.toHaveBeenCalled();
  });
});
