import { test, expect } from "@playwright/test";

// Audit finding #4: one unbreakable token in one card excerpt (a raw markdown URL,
// 903 px wide) widened the whole /blog grid and scrolled the page 13 px on mobile.
// This guard does not depend on today's data: it plants the worst case itself.
test("a card with an unbreakable excerpt cannot widen /blog", async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 851 });
  await page.goto("/blog", { waitUntil: "domcontentloaded" });

  const excerpt = page.locator("a.group.block p.line-clamp-2").first();
  await expect(excerpt).toBeVisible();
  await excerpt.evaluate((el) => {
    el.textContent = `see [docs](https://example.com/${"a-very-long-path-segment-".repeat(12)})`;
  });

  // Auto-retrying: settles once layout reflows after the injected text.
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth))
    .toBeLessThanOrEqual(1);
});
