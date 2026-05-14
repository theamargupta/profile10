import { NextRequest, NextResponse } from "next/server";
import { buildOAuthMetadata } from "@/lib/mcp/core/oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// RFC 8414 §3 — OAuth 2.0 authorization server metadata.
export async function GET(request: NextRequest) {
  return NextResponse.json(buildOAuthMetadata(request.nextUrl.origin));
}
