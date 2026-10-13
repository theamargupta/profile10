import { NextResponse } from "next/server";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createAmarguptaTechMcpServer } from "@/lib/mcp/server";
import {
  buildResourceMetadataUrl,
  parseBearerToken,
  verifyOAuthAccessToken,
} from "@/lib/mcp/core/oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * MCP endpoint for amargupta.tech.
 *
 * Two auth paths:
 *   1. OAuth 2.1 + DCR (RFC 7591) — for Claude.ai / Cursor / ChatGPT connector
 *      flows. Discovery via `/.well-known/oauth-protected-resource/api/mcp`.
 *   2. Legacy static bearer `AMARGUPTA_MCP_BEARER` — for direct paste-token
 *      configs that predate the OAuth flow.
 *
 * MCP clients negotiate over Streamable HTTP (POST only; GET answers 405).
 * The transport is constructed per request; the server is wired stateless.
 */

type AuthResult =
  | { ok: true; authInfo?: AuthInfoLite }
  | { ok: false; reason: string };

type AuthInfoLite = {
  token: string;
  clientId: string;
  scopes: string[];
  extra?: Record<string, unknown>;
};

function unauthorized(reason: string, resourceMetadataUrl: string) {
  return NextResponse.json(
    {
      jsonrpc: "2.0",
      error: { code: -32001, message: `Unauthorized: ${reason}` },
    },
    {
      status: 401,
      headers: {
        "WWW-Authenticate": `Bearer realm="amargupta-tech-mcp", error="invalid_token", error_description="${reason}", resource_metadata="${resourceMetadataUrl}"`,
      },
    },
  );
}

async function authenticate(req: Request): Promise<AuthResult> {
  const bearer = parseBearerToken(req.headers.get("authorization"));
  if (!bearer) {
    return { ok: false, reason: "missing or malformed Authorization header" };
  }

  // Static-bearer fast path (back-compat).
  const staticBearer = process.env.AMARGUPTA_MCP_BEARER;
  if (staticBearer && bearer === staticBearer) {
    return {
      ok: true,
      authInfo: {
        token: bearer,
        clientId: "static-bearer",
        scopes: ["mcp:tools"],
        extra: { source: "static-bearer" },
      },
    };
  }

  // OAuth path.
  try {
    const info = await verifyOAuthAccessToken(bearer);
    return {
      ok: true,
      authInfo: {
        token: info.token,
        clientId: info.clientId,
        scopes: info.scopes,
        extra: info.extra ?? {},
      },
    };
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : "Invalid token.",
    };
  }
}

export async function POST(req: Request): Promise<Response> {
  const origin = new URL(req.url).origin;
  const resourceMetadataUrl = buildResourceMetadataUrl(origin);

  const auth = await authenticate(req);
  if (!auth.ok) return unauthorized(auth.reason, resourceMetadataUrl);

  const server = createAmarguptaTechMcpServer();
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  await server.connect(transport);

  const body = await req.clone().json().catch(() => null);
  return transport.handleRequest(req, {
    authInfo: auth.authInfo,
    parsedBody: body,
  });
}

/**
 * GET answers 405 (ADMIN-76, global Rule 11). The MCP spec allows exactly two
 * answers: "The server MUST either return Content-Type: text/event-stream in
 * response to this HTTP GET, or else return HTTP 405 Method Not Allowed,
 * indicating that the server does not offer an SSE stream at this endpoint."
 * (modelcontextprotocol.io/specification/2025-06-18/basic/transports).
 * The transport here is stateless, so an SSE GET opened a stream that never
 * ended and held a function for up to 300 s. The installed SDK client
 * (1.29.0, `_startOrAuthSse`) returns quietly on 405 and does not retry.
 * Discovery stays on `/.well-known/*` plus the 401 an unauthenticated POST
 * returns.
 */
export async function GET(): Promise<Response> {
  return NextResponse.json(
    {
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Method not allowed: this MCP endpoint offers no SSE stream; use POST.",
      },
      id: null,
    },
    { status: 405, headers: { Allow: "POST" } },
  );
}

/** Liveness probe: 200, no body, no auth, no stream. */
export async function HEAD(): Promise<Response> {
  return new Response(null, { status: 200 });
}

export async function DELETE(): Promise<Response> {
  return new Response(null, { status: 204 });
}
