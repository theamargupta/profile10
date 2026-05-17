import { test, expect } from "@playwright/test";

// Regression guard for the 2026-05-17 mobile hero fix.
// animated-tagline wraps each word in inline-flex/overflow-hidden, which blocks
// native word-wrap. So at mobile widths the display font size MUST be small
// enough that the longest single word fits inside the viewport content area.
test.describe("hero on mobile", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("h1 fits inside the viewport", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(800);

    const data = await page.evaluate(() => {
      const h1 = document.querySelector("h1");
      if (!h1) return null;
      const rect = h1.getBoundingClientRect();
      const cs = getComputedStyle(h1);
      return {
        fontSize: parseFloat(cs.fontSize),
        left: rect.left,
        right: rect.right,
        viewport: window.innerWidth,
      };
    });
    expect(data).not.toBeNull();
    expect(data!.left).toBeGreaterThanOrEqual(0);
    expect(data!.right).toBeLessThanOrEqual(data!.viewport);
    // Sanity floor: if someone deletes the clamp min the font goes back to
    // huge values and this catches it.
    expect(data!.fontSize).toBeLessThanOrEqual(64);
  });

  test("rotating tagline kicker is not vertically clipped", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(800);

    // Container wraps the kicker; if h-8 is reintroduced its scrollHeight
    // exceeds clientHeight at 375px (text wraps to 2 lines).
    const clipped = await page.evaluate(() => {
      const span = document.querySelector('[aria-live="polite"]');
      if (!span) return { found: false, clipped: false };
      const el = span as HTMLElement;
      return {
        found: true,
        clipped: el.scrollHeight > el.clientHeight + 1,
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight,
      };
    });
    expect(clipped.found, "kicker container").toBe(true);
    expect(clipped.clipped, "kicker vertical clip").toBe(false);
  });
});
