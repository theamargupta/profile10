import { z } from "zod";

/**
 * A demo under a plan: 2–5 scenes from a fixed catalog (admin spec 2026-11-01-freelance-leads-design.md, "Amendment
 * 2026-11-12" → "What a demo is"; admin plan 2026-11-12-freelance-demos P1). Mirrored from admin
 * lib/freelance-leads/model/demo-schema.ts (Zod v4 there, v3 here: `.strict()` for `z.strictObject`); keep the limits
 * identical. Plain text only: every string renders as an escaped React text node, nothing as a link.
 * Other kinds' fields are dropped before validation: the model sends `language: ''` on flow scenes (measured).
 */
export const SCENE_KINDS = ["chat", "table", "flow", "form", "dashboard", "code"] as const;

const s = (max: number) => z.string().min(1).max(max);
const MessageSchema = z.object({ from: z.enum(["customer", "assistant", "staff", "system"]), text: s(400) }).strict();
const StepSchema = z.object({ label: s(60), detail: z.string().max(200).optional(), on_error: z.string().max(160).optional() }).strict();
const FieldSchema = z.object({ label: s(60), type: z.enum(["text", "number", "date", "select", "textarea"]), sample: z.string().max(120) }).strict();
const StatSchema = z.object({ label: s(40), value: s(24) }).strict();

const SceneSchema = z
  .object({
    kind: z.enum(SCENE_KINDS),
    heading: s(80),
    caption: s(200),
    messages: z.array(MessageSchema).max(12).optional(),
    columns: z.array(s(40)).max(6).optional(),
    rows: z.array(z.array(z.string().max(120))).max(10).optional(),
    steps: z.array(StepSchema).max(8).optional(),
    fields: z.array(FieldSchema).max(8).optional(),
    submit_label: z.string().max(30).optional(),
    result: z.string().max(300).optional(),
    stats: z.array(StatSchema).max(6).optional(),
    language: z.enum(["sql", "typescript", "json", "yaml"]).optional(),
    code: z.string().max(3000).refine((c) => c.split("\n").length <= 60, { message: "at most 60 lines" }).optional(),
  })
  .strict()
  .refine((x) => {
    const len = (a?: unknown[]) => a?.length ?? 0;
    const table = len(x.columns) >= 2 && len(x.rows) >= 1 && (x.rows ?? []).every((r) => r.length === len(x.columns));
    switch (x.kind) {
      case "chat": return len(x.messages) >= 2;
      case "table": return table;
      case "flow": return len(x.steps) >= 2;
      case "form": return len(x.fields) >= 1 && Boolean(x.submit_label) && Boolean(x.result);
      case "dashboard": return len(x.stats) >= 1 && (len(x.columns) === 0 || table);
      case "code": return Boolean(x.language) && Boolean(x.code);
    }
  }, { message: "the scene lacks its kind's fields, or a row's cells do not match the columns" });

const KIND_FIELDS: Record<(typeof SCENE_KINDS)[number], string[]> = {
  chat: ["messages"], table: ["columns", "rows"], flow: ["steps"], form: ["fields", "submit_label", "result"],
  dashboard: ["stats", "columns", "rows"], code: ["language", "code"],
};
const KNOWN = new Set(Object.values(KIND_FIELDS).flat());
function keepKindFields(scene: unknown) {
  if (!scene || typeof scene !== "object" || Array.isArray(scene)) return scene;
  const x = scene as Record<string, unknown>;
  const own = KIND_FIELDS[x.kind as keyof typeof KIND_FIELDS];
  if (!own) return scene;
  return Object.fromEntries(Object.entries(x).filter(([k]) => !KNOWN.has(k) || own.includes(k)));
}

export const DemoSchema = z
  .object({
    title: s(120),
    prepared_for: s(120),
    summary: s(400),
    scenes: z.array(z.preprocess(keepKindFields, SceneSchema)).min(2).max(5),
    assumptions: z.array(s(200)).min(1).max(6),
  })
  .strict();

export type Demo = z.infer<typeof DemoSchema>;
export type Scene = Demo["scenes"][number];
