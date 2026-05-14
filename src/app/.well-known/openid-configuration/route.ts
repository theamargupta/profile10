import { NextRequest, NextResponse } from "next/server";
import { buildOAuthMetadata } from "@/lib/mcp/core/oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Some MCP clients probe OIDC discovery before falling back to OAuth 2.0
// metadata. We're not an OIDC provider — but returning the OAuth 2.0
// authorization-server document satisfies the discovery handshake (the fields
// overlap; the client just needs the endpoints) and stops the 404 spam.
export async function GET(request: NextRequest) {
  return NextResponse.json(buildOAuthMetadata(request.nextUrl.origin));
}
