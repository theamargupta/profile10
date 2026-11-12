import { describe, expect, it } from "vitest";
import { DemoSchema } from "./demo-schema";
import { PlanSchema } from "./plan-schema";
import collabify from "./__fixtures__/3fc98226-demo.json";
import make from "./__fixtures__/3b9903df-demo.json";
import va from "./__fixtures__/a297ae60-demo.json";

// Admin plan 2026-11-12-freelance-demos P1: the demo shape, mirrored from admin lib/freelance-leads/model/demo-schema.ts.
const scenes = (make as { scenes: unknown[] }).scenes;
const withScenes = (s: unknown[]) => ({ ...make, scenes: s });
const PLAN = { title: "t", prepared_for: "your post", summary: "s", sections: [{ heading: "h", bullets: ["b"] }] };

describe("DemoSchema", () => {
  it("parses the three probe demos", () => {
    for (const demo of [collabify, make, va]) expect(DemoSchema.safeParse(demo).success).toBe(true);
  });

  it("refuses an unknown kind, an unknown key, 6 scenes, a table row with the wrong cell count and 61 code lines", () => {
    expect(DemoSchema.safeParse(withScenes([{ ...(scenes[0] as object), kind: "video" }, scenes[1]])).success).toBe(false);
    expect(DemoSchema.safeParse({ ...make, logo: "x" }).success).toBe(false);
    expect(DemoSchema.safeParse(withScenes(Array(6).fill(scenes[0]))).success).toBe(false);
    const table = { kind: "table", heading: "h", caption: "c", columns: ["a", "b"], rows: [["1"]] };
    expect(DemoSchema.safeParse(withScenes([table, scenes[0]])).success).toBe(false);
    const code = { kind: "code", heading: "h", caption: "c", language: "sql", code: Array(61).fill("select 1;").join("\n") };
    expect(DemoSchema.safeParse(withScenes([code, scenes[0]])).success).toBe(false);
  });
});

describe("PlanSchema with a demo", () => {
  it("a plan with no demo still parses (old rows); a good demo parses; a bad demo is refused", () => {
    expect(PlanSchema.safeParse(PLAN).success).toBe(true);
    expect(PlanSchema.safeParse({ ...PLAN, demo: make }).success).toBe(true);
    expect(PlanSchema.safeParse({ ...PLAN, demo: { ...make, scenes: [] } }).success).toBe(false);
  });
});
