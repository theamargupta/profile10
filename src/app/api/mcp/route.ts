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
 * MCP clients negotiate over Streamable HTTP (POST + SSE GET). The transport
 * is constructed per request; the server is wired stateless.
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

export async function GET(req: Request): Promise<Response> {
  const origin = new URL(req.url).origin;
  const resourceMetadataUrl = buildResourceMetadataUrl(origin);

  const accept = req.headers.get("accept") ?? "";
  if (!accept.includes("text/event-stream")) {
    // Discovery probes hit GET without SSE Accept. Returning 401 with
    // resource_metadata in WWW-Authenticate triggers the correct
    // RFC 9728 discovery flow on MCP clients.
    return new NextResponse(null, {
      status: 401,
      headers: {
        Allow: "POST",
        "WWW-Authenticate": `Bearer realm="amargupta-tech-mcp", resource_metadata="${resourceMetadataUrl}"`,
      },
    });
  }

  const auth = await authenticate(req);
  if (!auth.ok) return unauthorized(auth.reason, resourceMetadataUrl);

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

export async function DELETE(): Promise<Response> {
  return new Response(null, { status: 204 });
}
