import { NextRequest, NextResponse } from "next/server";
import { buildOAuthMetadata } from "@/lib/mcp/core/oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Defensive variant — same body as the root OIDC route.
export async function GET(request: NextRequest) {
  return NextResponse.json(buildOAuthMetadata(request.nextUrl.origin));
}
