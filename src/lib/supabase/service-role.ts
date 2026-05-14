import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client. Bypasses RLS.
 *
 * Use ONLY in trusted server contexts:
 *   - src/app/api/mcp/route.ts (bearer-auth-gated agent writes)
 *   - server actions or admin tooling where the operator has already
 *     authenticated through a different surface
 *
 * NEVER import this from a client component or anywhere that ships to
 * the browser.
 */
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for service-role client.",
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
