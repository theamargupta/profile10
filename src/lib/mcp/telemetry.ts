import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

// MCP tool-call telemetry for amargupta.tech. Mirrors the sutra +
// setu-nextjs + project-memory wrap so all four MCPs land rows in the SAME
// public.mcp_tool_calls table (Supabase project avcnoywxnkajfuobftmr).
//
// Auth model here is a static bearer (AMARGUPTA_MCP_BEARER) or single-operator
// OAuth — there's no per-user multi-tenancy, so user_id stays null. The row
// still lets you slice by server_name='amargupta-tech'.
//
// Kill switch: MCP_TOOL_TELEMETRY=0 disables instantly.
// Hard rule: this module MUST NOT throw.

export interface ToolCallLogEntry {
  call_id: string;
  server_name: string;
  tool_name: string;
  user_id: string | null;
  duration_ms: number;
  outcome: "ok" | "error";
  error_short: string | null;
  args_summary: Record<string, string> | null;
  thread_id: string | null;
  routine_id: string | null;
  started_at: string;
}

const TELEMETRY_ENABLED = process.env.MCP_TOOL_TELEMETRY !== "0";

export function summarizeArgs(args: unknown): Record<string, string> | null {
  if (args === null || args === undefined) return null;
  if (typeof args !== "object") return null;
  const out: Record<string, string> = {};
  for (const [key, val] of Object.entries(args as Record<string, unknown>)) {
    if (val === null) out[key] = "null";
    else if (Array.isArray(val)) out[key] = `array[${val.length}]`;
    else out[key] = typeof val;
  }
  return out;
}

export function logToolCall(entry: ToolCallLogEntry): void {
  if (!TELEMETRY_ENABLED) return;
  void (async () => {
    try {
      const supabase = createServiceRoleClient();
      const { error } = await supabase.from("mcp_tool_calls").insert(entry);
      if (error) console.warn(`[mcp:telemetry] insert failed: ${error.message}`);
    } catch (err) {
      console.warn(`[mcp:telemetry] insert threw: ${(err as Error).message}`);
    }
  })();
}

export function buildLogEntry(input: {
  server_name: string;
  tool_name: string;
  args: unknown;
  startedAt: number;
  finishedAt: number;
  outcome: "ok" | "error";
  error_short: string | null;
}): ToolCallLogEntry {
  return {
    call_id: crypto.randomUUID(),
    server_name: input.server_name,
    tool_name: input.tool_name,
    user_id: null,
    duration_ms: input.finishedAt - input.startedAt,
    outcome: input.outcome,
    error_short: input.error_short,
    args_summary: summarizeArgs(input.args),
    thread_id: null,
    routine_id: null,
    started_at: new Date(input.startedAt).toISOString(),
  };
}
