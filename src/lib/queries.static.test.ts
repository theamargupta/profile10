import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// The public pages read through queries.ts. If it reaches cookies() (via the
// cookie client in supabase/server.ts), every route that renders it — the
// footer is on all of them — becomes dynamic and the CDN never caches a page.
// Measured 2026-10-14: `private, no-store` + MISS on /, /blog and a post.
// Spec: docs/specs/public-pages-cdn-cache.md
const PUBLIC_DATA_MODULES = ["src/lib/queries.ts"];

describe("public data modules stay cookie-free", () => {
  it.each(PUBLIC_DATA_MODULES)("%s never imports the cookie client or next/headers", (file) => {
    const source = readFileSync(join(process.cwd(), file), "utf8");
    expect(source).not.toMatch(/@\/lib\/supabase\/server/);
    expect(source).not.toMatch(/next\/headers/);
  });
});
