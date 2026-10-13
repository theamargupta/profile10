import { test, expect } from "@playwright/test";

// ADMIN-76 / global Rule 11: GET /api/mcp answers 405 + Allow, never an SSE
// stream or a 200 — the MCP SDK client stops quietly only on 405.
test("GET /api/mcp answers 405 with Allow: POST", async ({ request }) => {
  const res = await request.get("/api/mcp");
  expect(res.status()).toBe(405);
  expect(res.headers()["allow"]).toBe("POST");
});

test("GET /api/mcp with Accept: text/event-stream answers 405", async ({ request }) => {
  const res = await request.get("/api/mcp", {
    headers: { Accept: "text/event-stream" },
  });
  expect(res.status()).toBe(405);
  expect(res.headers()["content-type"] ?? "").not.toContain("text/event-stream");
});

test("HEAD /api/mcp answers 200 for liveness", async ({ request }) => {
  const res = await request.head("/api/mcp");
  expect(res.status()).toBe(200);
});
