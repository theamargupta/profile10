import "server-only";
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { PlanSchema, TokenSchema, PLAN_TTL_DAYS } from "@/lib/plans/plan-schema";
import { unpublishPlan, upsertPlan } from "@/lib/plans/plan-store";

/**
 * Tools that publish and unpublish freelance plan pages at amargupta.tech/plans/<token>.
 * Auth: /api/mcp enforces the bearer / OAuth gate before any tool runs (same as the blog tools).
 * Spec: docs/specs/freelance-plan-pages.md
 */

function okJson(body: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(body) }] };
}

function errText(message: string) {
  return { content: [{ type: "text" as const, text: `Error: ${message}` }], isError: true };
}

// Plain `z.unknown()` for the plan: the handler validates it with PlanSchema so the error can name the field
// (`plan.title`), which the SDK's own input error would bury.
const UpsertArgs = {
  token: z.string().describe("16-64 characters of A-Z a-z 0-9 _ -. Unguessable; it is the page's only secret."),
  plan: z.unknown().describe("The plan: { title, prepared_for, summary, sections: [{ heading, paragraphs?, bullets? }] }. Plain text only."),
};
const UnpublishArgs = { token: z.string() };

export function registerPlanTools(server: McpServer) {
  server.registerTool(
    "plan_upsert",
    {
      description: [
        "Publish (or replace) a one-page plan at amargupta.tech/plans/<token>. The page is noindex.",
        `It expires ${PLAN_TTL_DAYS} days after this call; calling again for the same token restarts the clock.`,
        "The plan is structured JSON; the page template adds the honesty strip and the price range itself.",
      ].join("\n"),
      inputSchema: UpsertArgs,
    },
    async (args) => {
      const token = TokenSchema.safeParse(args.token);
      if (!token.success) return errText(`token: ${token.error.issues[0].message}`);
      const plan = PlanSchema.safeParse(args.plan);
      if (!plan.success) {
        const issue = plan.error.issues[0];
        return errText(`plan.${issue.path.join(".") || "(root)"}: ${issue.message}`);
      }
      try {
        const stored = await upsertPlan(token.data, plan.data);
        return okJson({ ...stored, path: `/plans/${stored.token}` });
      } catch (err) {
        return errText(err instanceof Error ? err.message : String(err));
      }
    },
  );

  server.registerTool(
    "plan_unpublish",
    {
      description: "Delete a published plan. Its URL answers 404 from the next visit. An unknown token answers deleted:false.",
      inputSchema: UnpublishArgs,
    },
    async (args) => {
      const token = TokenSchema.safeParse(args.token);
      if (!token.success) return errText(`token: ${token.error.issues[0].message}`);
      try {
        return okJson(await unpublishPlan(token.data));
      } catch (err) {
        return errText(err instanceof Error ? err.message : String(err));
      }
    },
  );
}
