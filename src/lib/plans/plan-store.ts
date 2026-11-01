import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { PLAN_TTL_DAYS, PlanSchema, TokenSchema, type Plan } from "./plan-schema";

/**
 * Reads and writes public.demo_plans with the service-role client (RLS on, no policy: nobody else can).
 * Every database error is thrown with the operation and token in it; "not found" is only ever a
 * successful read that returned no row. Spec: docs/specs/freelance-plan-pages.md
 */

const TABLE = "demo_plans";
const DAY_MS = 24 * 60 * 60 * 1000;

function parseToken(token: string, op: string): string {
  const parsed = TokenSchema.safeParse(token);
  if (!parsed.success) throw new Error(`${op}: invalid token: ${parsed.error.issues[0].message}`);
  return parsed.data;
}

export async function upsertPlan(
  token: string,
  plan: Plan,
  now: Date = new Date(),
): Promise<{ token: string; expires_at: string }> {
  const safeToken = parseToken(token, "plan_upsert");
  const parsedPlan = PlanSchema.safeParse(plan);
  if (!parsedPlan.success) {
    const issue = parsedPlan.error.issues[0];
    throw new Error(`plan_upsert: invalid plan at ${issue.path.join(".") || "(root)"}: ${issue.message}`);
  }
  const supabase = createServiceRoleClient();

  // Expired rows are unreadable already; deleting them here keeps the table small without a cron.
  const purge = await supabase.from(TABLE).delete().lt("expires_at", now.toISOString());
  if (purge.error) throw new Error(`plan_upsert failed for token ${safeToken}: purge of expired plans: ${purge.error.message}`);

  const expires_at = new Date(now.getTime() + PLAN_TTL_DAYS * DAY_MS).toISOString();
  const { error } = await supabase
    .from(TABLE)
    .upsert({ token: safeToken, plan: parsedPlan.data, expires_at, updated_at: now.toISOString() }, { onConflict: "token" });
  if (error) throw new Error(`plan_upsert failed for token ${safeToken}: ${error.message}`);
  return { token: safeToken, expires_at };
}

export async function unpublishPlan(token: string): Promise<{ token: string; deleted: boolean }> {
  const safeToken = parseToken(token, "plan_unpublish");
  const { data, error } = await createServiceRoleClient().from(TABLE).delete().eq("token", safeToken).select("token");
  if (error) throw new Error(`plan_unpublish failed for token ${safeToken}: ${error.message}`);
  return { token: safeToken, deleted: (data?.length ?? 0) > 0 };
}

/** The plan for a token, or null if the token is malformed, unknown or expired. Throws on any other failure. */
export async function getPlan(token: string, now: Date = new Date()): Promise<Plan | null> {
  const parsedToken = TokenSchema.safeParse(token);
  if (!parsedToken.success) return null; // never reaches the database
  const { data, error } = await createServiceRoleClient()
    .from(TABLE)
    .select("plan, expires_at")
    .eq("token", parsedToken.data)
    .gt("expires_at", now.toISOString())
    .maybeSingle();
  if (error) throw new Error(`getPlan failed for token ${parsedToken.data}: ${error.message}`);
  if (!data) return null;
  const parsedPlan = PlanSchema.safeParse(data.plan);
  if (!parsedPlan.success) {
    throw new Error(`stored plan for token ${parsedToken.data} no longer matches the schema: ${parsedPlan.error.issues[0].message}`);
  }
  return parsedPlan.data;
}
