import { describe, expect, it } from "vitest";
import { PLAN_TTL_DAYS, PlanSchema, TokenSchema } from "./plan-schema";

// Spec: docs/specs/freelance-plan-pages.md ("What it refuses").
const GOOD_TOKEN = "Ab3_-Zx9Qw7Lm2Kp";
const GOOD_PLAN = {
  title: "Dashboard rebuild for Acme",
  prepared_for: "Acme Ltd",
  summary: "A two-week plan to move the reporting dashboard to Next.js.",
  sections: [
    { heading: "Week 1", paragraphs: ["Audit the current dashboard."], bullets: ["List the 5 slowest charts"] },
  ],
};

describe("TokenSchema", () => {
  it("accepts 16-64 URL-safe characters", () => {
    expect(TokenSchema.safeParse(GOOD_TOKEN).success).toBe(true);
    expect(TokenSchema.safeParse("a".repeat(64)).success).toBe(true);
  });
  it.each([
    ["too short", "a".repeat(15)],
    ["too long", "a".repeat(65)],
    ["a slash", "abcdefghijklmnop/x"],
    ["a dot", "abcdefghijklmnop.x"],
    ["a space", "abcdefghijklmnop x"],
    ["empty", ""],
  ])("rejects a token with %s", (_why, token) => {
    expect(TokenSchema.safeParse(token).success).toBe(false);
  });
});

describe("PlanSchema", () => {
  it("accepts a well-formed plan", () => {
    expect(PlanSchema.safeParse(GOOD_PLAN).success).toBe(true);
  });
  it("accepts a section with only paragraphs or only bullets", () => {
    const only = (s: object) => PlanSchema.safeParse({ ...GOOD_PLAN, sections: [s] }).success;
    expect(only({ heading: "H", paragraphs: ["p"] })).toBe(true);
    expect(only({ heading: "H", bullets: ["b"] })).toBe(true);
  });
  it("rejects a section with neither paragraphs nor bullets", () => {
    expect(PlanSchema.safeParse({ ...GOOD_PLAN, sections: [{ heading: "H" }] }).success).toBe(false);
  });
  it("rejects unknown keys at the top and inside a section", () => {
    expect(PlanSchema.safeParse({ ...GOOD_PLAN, html: "<b>x</b>" }).success).toBe(false);
    const withExtra = { ...GOOD_PLAN, sections: [{ heading: "H", bullets: ["b"], html: "<i>" }] };
    expect(PlanSchema.safeParse(withExtra).success).toBe(false);
  });
  it("rejects a plan with no sections or more than 8", () => {
    expect(PlanSchema.safeParse({ ...GOOD_PLAN, sections: [] }).success).toBe(false);
    const nine = Array.from({ length: 9 }, () => ({ heading: "H", bullets: ["b"] }));
    expect(PlanSchema.safeParse({ ...GOOD_PLAN, sections: nine }).success).toBe(false);
  });
  it("rejects text over its cap and empty required text", () => {
    expect(PlanSchema.safeParse({ ...GOOD_PLAN, title: "x".repeat(121) }).success).toBe(false);
    expect(PlanSchema.safeParse({ ...GOOD_PLAN, summary: "" }).success).toBe(false);
    const longPara = { heading: "H", paragraphs: ["x".repeat(1201)] };
    expect(PlanSchema.safeParse({ ...GOOD_PLAN, sections: [longPara] }).success).toBe(false);
  });
  it("names the failing field in its issues", () => {
    const res = PlanSchema.safeParse({ ...GOOD_PLAN, title: "" });
    expect(res.success).toBe(false);
    if (!res.success) expect(res.error.issues[0].path).toEqual(["title"]);
  });
});

describe("PLAN_TTL_DAYS", () => {
  it("is 60 (Amar: a plan is gone after 60 days)", () => {
    expect(PLAN_TTL_DAYS).toBe(60);
  });
});
