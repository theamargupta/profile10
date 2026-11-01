import { z } from "zod";

/**
 * Shape of a freelance plan page (docs/specs/freelance-plan-pages.md).
 * Zod v3 (docs/DOC-MAP.md): `.strict()` rejects unknown keys, `.safeParse` returns `error.issues`.
 * Plain text only. The page renders every string as an escaped React text node, so no HTML is stored
 * and nothing needs sanitising.
 */

/** A plan is gone this many days after its last upsert (Amar, 2026-11-01). */
export const PLAN_TTL_DAYS = 60;

/** Caller-chosen, unguessable, URL-safe. 16 characters is the floor so a token cannot be walked. */
export const TokenSchema = z.string().regex(/^[A-Za-z0-9_-]{16,64}$/, "token must be 16-64 characters of A-Z a-z 0-9 _ -");

const SectionSchema = z
  .object({
    heading: z.string().min(1).max(100),
    paragraphs: z.array(z.string().min(1).max(1200)).max(6).optional(),
    bullets: z.array(z.string().min(1).max(300)).max(10).optional(),
  })
  .strict()
  .refine((s) => (s.paragraphs?.length ?? 0) + (s.bullets?.length ?? 0) > 0, {
    message: "a section needs at least one paragraph or bullet",
  });

export const PlanSchema = z
  .object({
    title: z.string().min(1).max(120),
    prepared_for: z.string().min(1).max(120),
    summary: z.string().min(1).max(600),
    sections: z.array(SectionSchema).min(1).max(8),
  })
  .strict();

export type Plan = z.infer<typeof PlanSchema>;
