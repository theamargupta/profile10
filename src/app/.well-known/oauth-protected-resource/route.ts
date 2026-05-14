import { NextRequest, NextResponse } from "next/server";
import { buildProtectedResourceMetadata } from "@/lib/mcp/core/oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// RFC 9728 §3 — protected resource metadata. Canonical path includes the
// resource path (`/.well-known/oauth-protected-resource/api/mcp`); this root
// variant exists for MCP clients that probe the bare path.
export async function GET(request: NextRequest) {
  return NextResponse.json(
    buildProtectedResourceMetadata(request.nextUrl.origin),
  );
}
