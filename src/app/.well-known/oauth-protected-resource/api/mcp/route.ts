import { NextRequest, NextResponse } from "next/server";
import { buildProtectedResourceMetadata } from "@/lib/mcp/core/oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// RFC 9728 §3 — canonical resource metadata for /api/mcp.
export async function GET(request: NextRequest) {
  return NextResponse.json(
    buildProtectedResourceMetadata(request.nextUrl.origin),
  );
}
