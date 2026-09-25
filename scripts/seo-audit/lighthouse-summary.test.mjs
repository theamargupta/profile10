import { describe, expect, it } from "vitest";
import { summarize } from "./lighthouse-summary.mjs";

const lhr = (overrides = {}) => ({
  finalDisplayedUrl: "https://amargupta.tech/blog",
  configSettings: { formFactor: "mobile" },
  categories: { seo: { score: 0.92 }, performance: { score: 0.41 } },
  audits: {
    "largest-contentful-paint": { numericValue: 5234.4 },
    "cumulative-layout-shift": { numericValue: 0.0123 },
    "total-blocking-time": { numericValue: 812.2 },
    "meta-description": { score: 1, title: "Has a meta description", scoreDisplayMode: "binary" },
    "link-text": { score: 0, title: "Links do not have descriptive text", scoreDisplayMode: "binary" },
    "structured-data": { score: null, title: "Structured data is valid", scoreDisplayMode: "manual" },
  },
  ...overrides,
});

describe("summarize", () => {
  it("turns scores into 0-100 and rounds the vitals", () => {
    expect(summarize(lhr())).toEqual({
      url: "https://amargupta.tech/blog",
      form: "mobile",
      seo: 92,
      performance: 41,
      lcpMs: 5234,
      cls: 0.012,
      tbtMs: 812,
      failedSeo: ["link-text: Links do not have descriptive text"],
    });
  });

  it("reports a missing category as null instead of crashing", () => {
    const s = summarize(lhr({ categories: { seo: { score: 1 } }, audits: {} }));
    expect(s.performance).toBeNull();
    expect(s.lcpMs).toBeNull();
    expect(s.failedSeo).toEqual([]);
  });

  it("surfaces a runtime error Lighthouse recorded", () => {
    const s = summarize(lhr({ runtimeError: { code: "NO_FCP", message: "no paint" } }));
    expect(s.error).toBe("NO_FCP: no paint");
  });
});
