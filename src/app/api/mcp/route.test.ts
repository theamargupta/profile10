import { describe, it, expect, vi, beforeEach } from "vitest";

// ADMIN-76: GET on a stateless transport opened an SSE stream that never
// ended. GET must answer 405 + Allow (global Rule 11); POST keeps working.
vi.mock("server-only", () => ({}));
vi.mock("@/lib/mcp/core/oauth", () => ({
  buildResourceMetadataUrl: (origin: string) =>
    `${origin}/.well-known/oauth-protected-resource/api/mcp`,
  parseBearerToken: (header: string | null) =>
    header?.startsWith("Bearer ") ? header.slice(7) : null,
  verifyOAuthAccessToken: vi.fn(async () => {
    throw new Error("Invalid token.");
  }),
}));
vi.mock("@/lib/mcp/server", async () => {
  const { McpServer } = await import("@modelcontextprotocol/sdk/server/mcp.js");
  return {
    createAmarguptaTechMcpServer: () =>
      new McpServer({ name: "test", version: "0.0.0" }),
  };
});

import { GET as getHandler, HEAD, POST } from "./route";

// Next calls every handler with the request; GET ignores it, but the tests
// still send the exact requests a client sends, so the bug case stays explicit.
const GET = getHandler as (req: Request) => Promise<Response>;

const URL_ = "http://localhost:3000/api/mcp";
const TOKEN = "test-static-bearer";

beforeEach(() => {
  process.env.AMARGUPTA_MCP_BEARER = TOKEN;
});

describe("GET /api/mcp", () => {
  it("answers 405 with Allow: POST when no Accept header is sent", async () => {
    const res = await GET(new Request(URL_));
    expect(res.status).toBe(405);
    expect(res.headers.get("allow")).toBe("POST");
  });

  it("answers 405 for an SSE GET with a valid bearer (the bug case)", async () => {
    const res = await GET(
      new Request(URL_, {
        headers: {
          Accept: "text/event-stream",
          Authorization: `Bearer ${TOKEN}`,
        },
      }),
    );
    expect(res.status).toBe(405);
    expect(res.headers.get("allow")).toBe("POST");
    expect(res.headers.get("content-type") ?? "").not.toContain("text/event-stream");
  });
});

describe("HEAD /api/mcp", () => {
  it("answers 200 for liveness", async () => {
    const res = await HEAD();
    expect(res.status).toBe(200);
  });
});

describe("POST /api/mcp", () => {
  it("still answers 401 with resource_metadata when no token is sent", async () => {
    const res = await POST(
      new Request(URL_, { method: "POST", body: "{}" }),
    );
    expect(res.status).toBe(401);
    expect(res.headers.get("www-authenticate")).toContain("resource_metadata=");
  });

  it("still answers an initialize request with a valid bearer", async () => {
    const res = await POST(
      new Request(URL_, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
          Accept: "application/json, text/event-stream",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "initialize",
          params: {
            protocolVersion: "2025-06-18",
            capabilities: {},
            clientInfo: { name: "vitest", version: "0" },
          },
        }),
      }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.result.serverInfo.name).toBe("test");
  });
});
