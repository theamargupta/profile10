/**
 * JSON schema definition and validator for project import.
 *
 * Usage: paste a JSON object (or array of objects) matching `ProjectJson`
 * into the admin "Import JSON" panel. The validator returns structured
 * errors so the UI can show exactly what's wrong before hitting Supabase.
 */

export interface ProjectJson {
  /** Unique slug-id. Auto-derived from title if omitted. */
  id?: string;
  title: string;
  description?: string | null;
  demo_img?: string | null;
  live_url?: string | null;
  repo_url?: string | null;
  architecture?: string | null;
  featured?: boolean;
  sort_order?: number;
  /** Array of tool IDs or names (must already exist in the tools table). e.g. ["React", "typescript", "Next"] */
  tools?: string[];
  /** Plain feature strings. */
  features?: string[];
  /** Challenge / solution pairs. */
  challenges?: { title: string; solution: string }[];
}

export interface ValidationError {
  /** 0-based index when validating an array, -1 for single object. */
  index: number;
  field: string;
  message: string;
}

export interface ValidationResult {
  ok: boolean;
  errors: ValidationError[];
  projects: ProjectJson[];
}

/** Example JSON that users can copy as a starting point. */
export const PROJECT_JSON_TEMPLATE: ProjectJson = {
  id: "my-project-slug",
  title: "My Project",
  description: "A short description of the project.",
  demo_img: "https://example.com/image.png",
  live_url: "https://example.com",
  repo_url: "https://github.com/user/repo",
  architecture: "Next.js + Supabase + Tailwind",
  featured: false,
  sort_order: 0,
  tools: ["React", "TypeScript", "Supabase"],
  features: ["SSR support", "Realtime updates", "Auth integration"],
  challenges: [
    { title: "Performance at scale", solution: "Implemented edge caching with ISR" },
  ],
};

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function validateOne(raw: unknown, index: number): { errors: ValidationError[]; project: ProjectJson | null } {
  const errors: ValidationError[] = [];
  const e = (field: string, message: string) => errors.push({ index, field, message });

  if (!isObject(raw)) {
    e("(root)", "Expected a JSON object");
    return { errors, project: null };
  }

  const obj = raw as Record<string, unknown>;

  // ── required ──
  if (typeof obj.title !== "string" || obj.title.trim().length === 0) {
    e("title", "Required string, cannot be empty");
  }

  // ── optional strings ──
  for (const key of ["id", "description", "demo_img", "live_url", "repo_url", "architecture"] as const) {
    if (obj[key] !== undefined && obj[key] !== null && typeof obj[key] !== "string") {
      e(key, `Expected string or null, got ${typeof obj[key]}`);
    }
  }

  // ── optional boolean ──
  if (obj.featured !== undefined && typeof obj.featured !== "boolean") {
    e("featured", `Expected boolean, got ${typeof obj.featured}`);
  }

  // ── optional number ──
  if (obj.sort_order !== undefined && typeof obj.sort_order !== "number") {
    e("sort_order", `Expected number, got ${typeof obj.sort_order}`);
  }

  // ── tools ──
  if (obj.tools !== undefined) {
    if (!Array.isArray(obj.tools)) {
      e("tools", "Expected an array of tool id strings");
    } else {
      obj.tools.forEach((t, i) => {
        if (typeof t !== "string" || t.trim().length === 0) {
          e(`tools[${i}]`, "Each tool must be a non-empty string id");
        }
      });
    }
  }

  // ── features ──
  if (obj.features !== undefined) {
    if (!Array.isArray(obj.features)) {
      e("features", "Expected an array of strings");
    } else {
      obj.features.forEach((f, i) => {
        if (typeof f !== "string" || f.trim().length === 0) {
          e(`features[${i}]`, "Each feature must be a non-empty string");
        }
      });
    }
  }

  // ── challenges ──
  if (obj.challenges !== undefined) {
    if (!Array.isArray(obj.challenges)) {
      e("challenges", "Expected an array of {title, solution} objects");
    } else {
      obj.challenges.forEach((c, i) => {
        if (!isObject(c)) {
          e(`challenges[${i}]`, "Expected an object with title and solution");
        } else {
          const ch = c as Record<string, unknown>;
          if (typeof ch.title !== "string" || ch.title.trim().length === 0) {
            e(`challenges[${i}].title`, "Required non-empty string");
          }
          if (typeof ch.solution !== "string" || ch.solution.trim().length === 0) {
            e(`challenges[${i}].solution`, "Required non-empty string");
          }
        }
      });
    }
  }

  // ── warn about unknown keys ──
  const knownKeys = new Set([
    "id", "title", "description", "demo_img", "live_url", "repo_url",
    "architecture", "featured", "sort_order", "tools", "features", "challenges",
  ]);
  for (const key of Object.keys(obj)) {
    if (!knownKeys.has(key)) {
      e(key, `Unknown field "${key}" — will be ignored`);
    }
  }

  if (errors.some((err) => !err.message.startsWith("Unknown"))) {
    return { errors, project: null };
  }

  const title = (obj.title as string).trim();

  const project: ProjectJson = {
    id:
      typeof obj.id === "string" && obj.id.trim().length > 0
        ? obj.id.trim()
        : title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, ""),
    title,
    description: (obj.description as string) ?? null,
    demo_img: (obj.demo_img as string) ?? null,
    live_url: (obj.live_url as string) ?? null,
    repo_url: (obj.repo_url as string) ?? null,
    architecture: (obj.architecture as string) ?? null,
    featured: (obj.featured as boolean) ?? false,
    sort_order: (obj.sort_order as number) ?? 0,
    tools: Array.isArray(obj.tools) ? (obj.tools as string[]) : [],
    features: Array.isArray(obj.features) ? (obj.features as string[]) : [],
    challenges: Array.isArray(obj.challenges)
      ? (obj.challenges as { title: string; solution: string }[])
      : [],
  };

  return { errors, project };
}

/**
 * Parse + validate raw JSON text. Accepts a single object or an array.
 * Returns structured errors so the UI can display them inline.
 */
export function validateProjectJson(raw: string): ValidationResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {
      ok: false,
      errors: [{ index: -1, field: "(json)", message: "Invalid JSON — check for syntax errors" }],
      projects: [],
    };
  }

  const items = Array.isArray(parsed) ? parsed : [parsed];
  const allErrors: ValidationError[] = [];
  const projects: ProjectJson[] = [];

  items.forEach((item, i) => {
    const { errors, project } = validateOne(item, items.length > 1 ? i : -1);
    allErrors.push(...errors);
    if (project) projects.push(project);
  });

  const hasRealErrors = allErrors.some((e) => !e.message.startsWith("Unknown"));
  return { ok: !hasRealErrors, errors: allErrors, projects };
}
