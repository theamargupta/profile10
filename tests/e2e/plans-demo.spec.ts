import { randomBytes } from "node:crypto";
import { test, expect, type APIRequestContext } from "@playwright/test";
import demo from "../../src/lib/plans/__fixtures__/3b9903df-demo.json";

// Admin plan 2026-11-12-freelance-demos P1: a plan page with a demo. Publishes a throwaway plan + demo through the
// real plan_upsert, steps through every scene, checks the strip and that the page stays noindex, then unpublishes it
// and checks the URL is a 404 (the row is gone). Same bearer and env loading as plans-noindex.spec.ts.
try {
  process.loadEnvFile(".env.local");
} catch (err) {
  if (!process.env.AMARGUPTA_MCP_BEARER) throw new Error(`no .env.local and no AMARGUPTA_MCP_BEARER: ${err}`);
}

const BEARER = process.env.AMARGUPTA_MCP_BEARER;
const PLAN = {
  title: "E2E throwaway plan with a demo",
  prepared_for: "your post",
  summary: "Made by the e2e suite and deleted when the run ends.",
  sections: [{ heading: "Phase 1", bullets: ["Bullet a"] }],
  demo,
};

async function callTool(request: APIRequestContext, name: string, args: Record<string, unknown>) {
  expect(BEARER, "AMARGUPTA_MCP_BEARER").toBeTruthy();
  const res = await request.post("/api/mcp", {
    headers: { Authorization: `Bearer ${BEARER}`, "Content-Type": "application/json", Accept: "application/json, text/event-stream" },
    data: { jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } },
  });
  expect(res.status(), `${name} HTTP status`).toBe(200);
  return (await res.json()).result as { isError?: boolean; content: Array<{ text: string }> };
}

test.describe("plan page with a demo", () => {
  test.describe.configure({ mode: "serial" });
  let token = "";

  test.beforeAll(async ({ request }, info) => {
    token = `e2e-demo-${info.project.name}-${randomBytes(6).toString("hex")}`;
    const res = await callTool(request, "plan_upsert", { token, plan: PLAN });
    expect(res.isError, res.content[0]?.text).toBeFalsy();
  });

  test.afterAll(async ({ request }) => {
    const res = await callTool(request, "plan_unpublish", { token });
    expect(res.isError, res.content[0]?.text).toBeFalsy();
  });

  test("steps through every scene with the strip on screen, noindex, and no request on submit", async ({ page }) => {
    const res = await page.goto(`/plans/${token}`);
    expect(res?.status()).toBe(200);
    expect(res?.headers()["x-robots-tag"] ?? "").toContain("noindex");
    const strip = page.getByText("Demo made for your post. Not a finished product. Sample data, not your data.");
    for (const [i, scene] of demo.scenes.entries()) {
      await expect(page.getByRole("heading", { name: scene.heading })).toBeVisible();
      await expect(strip).toBeVisible();
      if (scene.kind === "form") {
        const requests: string[] = [];
        page.on("request", (r) => requests.push(r.url()));
        await page.getByRole("button", { name: scene.submit_label as string }).click();
        await expect(page.getByRole("status")).toHaveText(scene.result as string);
        expect(requests).toEqual([]);
      }
      if (i < demo.scenes.length - 1) await page.getByRole("button", { name: "Next" }).click();
    }
  });

  test("after plan_unpublish the URL is a 404", async ({ request }) => {
    const un = await callTool(request, "plan_unpublish", { token });
    expect(un.isError, un.content[0]?.text).toBeFalsy();
    expect((await request.get(`/plans/${token}`)).status()).toBe(404);
  });
});
