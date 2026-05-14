import { NextRequest, NextResponse } from "next/server";
import { buildOAuthMetadata } from "@/lib/mcp/core/oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Defensive — some MCP clients append the resource path when probing AS
// metadata. Same body as the canonical root path.
export async function GET(request: NextRequest) {
  return NextResponse.json(buildOAuthMetadata(request.nextUrl.origin));
}
