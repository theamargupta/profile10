import { NextRequest, NextResponse } from "next/server";
import { buildOAuthMetadata } from "@/lib/mcp/core/oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Defensive — log shows some clients probe /api/mcp/.well-known/openid-configuration.
export async function GET(request: NextRequest) {
  return NextResponse.json(buildOAuthMetadata(request.nextUrl.origin));
}
