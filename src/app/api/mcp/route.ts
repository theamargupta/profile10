import { NextResponse } from "next/server";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createAmarguptaTechMcpServer } from "@/lib/mcp/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * MCP endpoint for amargupta.tech.
 *
 * Auth: single bearer secret from env (AMARGUPTA_MCP_BEARER). Single-operator
 * product — no multi-tenant RLS walk needed. Add the token to Cursor / Claude
 * Code with:
 *   {
 *     "mcpServers": {
 *       "amargupta-tech": {
 *         "url": "https://amargupta.tech/api/mcp",
 *         "headers": { "Authorization": "Bearer <AMARGUPTA_MCP_BEARER>" }
 *       }
 *     }
 *   }
 *
 * MCP clients negotiate over Streamable HTTP (POST + SSE GET). The transport
 * is constructed per request and the server is wired stateless, matching the
 * sibling apps' pattern.
 *
 * 405 on GET without Accept: text/event-stream is intentional — MCP SDK
 * discovery probes would otherwise treat the route as a regular endpoint.
 */

function unauthorized(reason: string) {
  return NextResponse.json(
    { jsonrpc: "2.0", error: { code: -32001, message: `Unauthorized: ${reason}` } },
    {
      status: 401,
      headers: {
        "WWW-Authenticate":
          'Bearer realm="amargupta-tech-mcp", error="invalid_token"',
      },
    },
  );
}

function checkBearer(req: Request): { ok: true } | { ok: false; reason: string } {
  const expected = process.env.AMARGUPTA_MCP_BEARER;
  if (!expected) return { ok: false, reason: "server missing AMARGUPTA_MCP_BEARER" };
  const auth = req.headers.get("authorization") ?? "";
  const m = /^Bearer\s+(.+)$/i.exec(auth.trim());
  if (!m) return { ok: false, reason: "missing or malformed Authorization header" };
  if (m[1] !== expected) return { ok: false, reason: "bearer token mismatch" };
  return { ok: true };
}

export async function POST(req: Request): Promise<Response> {
  const auth = checkBearer(req);
  if (!auth.ok) return unauthorized(auth.reason);

  const server = createAmarguptaTechMcpServer();
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  await server.connect(transport);
  return transport.handleRequest(req);
}

export async function GET(req: Request): Promise<Response> {
  // SSE long-poll path — only relevant for MCP clients that prefer Streamable
  // HTTP's resumability stream. The transport handles the negotiation; we
  // still gate on the bearer.
  const accept = req.headers.get("accept") ?? "";
  if (!accept.includes("text/event-stream")) {
    return new Response("Method Not Allowed — POST or GET with Accept: text/event-stream", {
      status: 405,
      headers: { Allow: "POST" },
    });
  }
  const auth = checkBearer(req);
  if (!auth.ok) return unauthorized(auth.reason);
  const server = createAmarguptaTechMcpServer();
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  await server.connect(transport);
  return transport.handleRequest(req);
}

export async function HEAD(): Promise<Response> {
  return new Response(null, { status: 405, headers: { Allow: "POST" } });
}
