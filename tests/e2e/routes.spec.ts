import { test, expect, type ConsoleMessage } from "@playwright/test";

const ROUTES = ["/", "/projects", "/about", "/blog"] as const;

// Ignored console noise that isn't a real bug (HMR / Next.js dev hints / 3rd-party).
const IGNORED_CONSOLE = [
  /Download the React DevTools/i,
  /\[Fast Refresh\]/i,
  /Lit is in dev mode/i,
];

function shouldIgnore(text: string): boolean {
  return IGNORED_CONSOLE.some((re) => re.test(text));
}

for (const route of ROUTES) {
  test(`route ${route} renders without console errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg: ConsoleMessage) => {
      if (msg.type() !== "error") return;
      const text = msg.text();
      if (shouldIgnore(text)) return;
      errors.push(text);
    });
    page.on("pageerror", (err) => {
      errors.push(`pageerror: ${err.message}`);
    });

    const response = await page.goto(route, { waitUntil: "domcontentloaded" });
    expect(response?.status(), `${route} response`).toBeLessThan(400);

    // Let client hydration + GSAP intros run.
    await page.waitForLoadState("networkidle").catch(() => undefined);
    await page.waitForTimeout(800);

    expect(errors, `console errors on ${route}`).toEqual([]);
  });

  test(`route ${route} has no horizontal page scroll`, async ({ page }) => {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(600);

    const overflow = await page.evaluate(() => {
      const doc = document.documentElement;
      return {
        scrollWidth: doc.scrollWidth,
        clientWidth: doc.clientWidth,
        diff: doc.scrollWidth - doc.clientWidth,
      };
    });
    expect(overflow.diff, `${route} horizontal overflow px`).toBeLessThanOrEqual(1);
  });

  test(`route ${route} has no uncontained element overflow`, async ({ page }) => {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(600);

    // Any element whose bounding box extends past document width AND whose
    // ancestor chain has no overflow-x clip = a real layout bug.
    const uncontained = await page.evaluate(() => {
      const docW = document.documentElement.clientWidth;
      const offenders: Array<{ tag: string; cls: string; right: number; text: string }> = [];
      for (const el of Array.from(document.querySelectorAll("*"))) {
        const r = el.getBoundingClientRect();
        if (r.right <= docW + 1) continue;
        let p = el.parentElement;
        let contained = false;
        while (p) {
          const ov = getComputedStyle(p).overflowX;
          if (ov === "hidden" || ov === "clip" || ov === "scroll" || ov === "auto") {
            contained = true;
            break;
          }
          p = p.parentElement;
        }
        if (!contained) {
          offenders.push({
            tag: el.tagName,
            cls: typeof el.className === "string" ? el.className.slice(0, 80) : "",
            right: Math.round(r.right),
            text: (el.textContent ?? "").trim().slice(0, 60),
          });
        }
      }
      return offenders;
    });

    expect(uncontained, `${route} uncontained overflow elements`).toEqual([]);
  });
}
