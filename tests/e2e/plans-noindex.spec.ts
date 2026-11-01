import { randomBytes } from "node:crypto";
import { test, expect, type APIRequestContext } from "@playwright/test";

// Freelance plan pages (docs/specs/freelance-plan-pages.md): /plans/<token> is never
// indexed, 404s for an unknown or unpublished token, and always carries the honesty
// strip and the $300–600 price from the template. The positive cases publish a throwaway
// plan through the real MCP tool, and the last test unpublishes it (the cleanup is the
// test of plan_unpublish). Needs AMARGUPTA_MCP_BEARER in the process env: the Playwright
// process does not read .env.local on its own, so load it here.
try {
  process.loadEnvFile(".env.local");
} catch (err) {
  // A CI run passes the variable directly; a missing file is only a problem if the bearer is missing too.
  if (!process.env.AMARGUPTA_MCP_BEARER) throw new Error(`no .env.local and no AMARGUPTA_MCP_BEARER: ${err}`);
}

const BEARER = process.env.AMARGUPTA_MCP_BEARER;
const PLAN = {
  title: "E2E throwaway plan",
  prepared_for: "Playwright Ltd",
  summary: "A plan made by the e2e suite. It is deleted when the run ends.",
  sections: [
    { heading: "Step one", paragraphs: ["Do the first thing."], bullets: ["Bullet a", "Bullet b"] },
    { heading: "Step two", bullets: ["Bullet c"] },
  ],
};

async function callTool(request: APIRequestContext, name: string, args: Record<string, unknown>) {
  expect(BEARER, "AMARGUPTA_MCP_BEARER").toBeTruthy();
  const res = await request.post("/api/mcp", {
    headers: {
      Authorization: `Bearer ${BEARER}`,
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
    },
    data: { jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } },
  });
  expect(res.status(), `${name} HTTP status`).toBe(200);
  const body = await res.json();
  return body.result as { isError?: boolean; content: Array<{ text: string }> };
}

test.describe("plan page, published", () => {
  test.describe.configure({ mode: "serial" });
  let token = "";

  test.beforeAll(async ({ request }, info) => {
    token = `e2e-${info.project.name}-${randomBytes(6).toString("hex")}`;
    const res = await callTool(request, "plan_upsert", { token, plan: PLAN });
    expect(res.isError, res.content[0]?.text).toBeFalsy();
    expect(JSON.parse(res.content[0].text).path).toBe(`/plans/${token}`);
  });

  test.afterAll(async ({ request }) => {
    // Idempotent: also runs when the unpublish test already deleted the row.
    const res = await callTool(request, "plan_unpublish", { token });
    expect(res.isError, res.content[0]?.text).toBeFalsy();
  });

  test("answers 200 with a noindex meta tag and an X-Robots-Tag header", async ({ page }) => {
    const res = await page.goto(`/plans/${token}`);
    expect(res?.status()).toBe(200);
    expect(res?.headers()["x-robots-tag"]).toBe("noindex, nofollow");
    // The root layout says "index, follow"; the page must replace it, not add a second tag.
    const robots = page.locator('meta[name="robots"]');
    await expect(robots).toHaveCount(1);
    await expect(robots).toHaveAttribute("content", "noindex, nofollow");
  });

  test("shows the honesty strip, the price range and the plan", async ({ page }) => {
    await page.goto(`/plans/${token}`);
    const strip = page.getByRole("note");
    await expect(strip).toContainText("Plan hai, bana hua product nahi");
    await expect(strip).toContainText("This is a plan, not a finished product");
    await expect(page.getByText("$300–600")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1, name: PLAN.title })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Step one" })).toBeVisible();
    await expect(page.getByText("Bullet c")).toBeVisible();
  });

  test("does not overflow the viewport sideways", async ({ page }) => {
    await page.goto(`/plans/${token}`);
    await expect(page.getByRole("heading", { level: 1, name: PLAN.title })).toBeVisible();
    const { scroll, client } = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }));
    expect(scroll).toBeLessThanOrEqual(client);
  });

  test("after plan_unpublish the same URL is a 404", async ({ request }) => {
    const un = await callTool(request, "plan_unpublish", { token });
    expect(JSON.parse(un.content[0].text)).toEqual({ token, deleted: true });
    const res = await request.get(`/plans/${token}`, { maxRedirects: 0 });
    expect(res.status()).toBe(404);
  });
});

test("an unknown token is a real HTTP 404, still marked noindex", async ({ request }) => {
  const res = await request.get("/plans/Zz9_-unknown-token-e2e", { maxRedirects: 0 });
  expect(res.status()).toBe(404);
  expect(res.headers()["x-robots-tag"]).toBe("noindex, nofollow");
});

test("a malformed token is a 404", async ({ request }) => {
  const res = await request.get("/plans/short", { maxRedirects: 0 });
  expect(res.status()).toBe(404);
});

test("robots.txt does not disallow /plans/, so Google can read the noindex", async ({ request }) => {
  const body = await (await request.get("/robots.txt")).text();
  expect(body).not.toMatch(/plans/i);
  expect(body).not.toMatch(/^disallow:/im);
});

test("sitemap.xml has no /plans/ entry", async ({ request }) => {
  const body = await (await request.get("/sitemap.xml")).text();
  expect(body).not.toContain("/plans");
});
