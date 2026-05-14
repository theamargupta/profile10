import { NextRequest, NextResponse } from "next/server";
import { revokeOAuthToken } from "@/lib/mcp/core/oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const form = await request.formData().catch(() => null);
  const token = form?.get("token");

  if (typeof token === "string" && token) {
    await revokeOAuthToken(token);
  }

  // RFC 7009: always return 200, even for unknown tokens.
  return new NextResponse(null, { status: 200 });
}
