import { describe, expect, it } from "vitest";

import nextConfig from "../../../next.config";
import robots from "../robots";

// Spec docs/specs/freelance-plan-pages.md, "Never indexed".
describe("/plans is never indexed, and stays crawlable so noindex is read", () => {
  it("next.config sends X-Robots-Tag: noindex, nofollow for /plans/:path*", async () => {
    const rules = await nextConfig.headers!();
    const rule = rules.find((r) => r.source === "/plans/:path*");
    expect(rule, "a /plans/:path* header rule").toBeDefined();
    expect(rule!.headers).toContainEqual({ key: "X-Robots-Tag", value: "noindex, nofollow" });
  });
  it("the site-wide security headers still apply", async () => {
    const rules = await nextConfig.headers!();
    expect(rules.find((r) => r.source === "/:path*")).toBeDefined();
  });
  it("robots.txt does not disallow /plans/ (Google reads noindex only on a crawlable page)", () => {
    expect(JSON.stringify(robots())).not.toMatch(/plans|disallow/i);
  });
});
