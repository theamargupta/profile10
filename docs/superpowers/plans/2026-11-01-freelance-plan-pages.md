# Freelance plan pages on amargupta.tech — Phase P6 (profile10 half)

Leader: `amar-gupta-admin-0d`. Source plan: amar-gupta-admin `docs/superpowers/plans/2026-11-01-freelance-leads.md`
on branch `milestone/freelance-leads` (read it with
`git -C /Users/amargupta/Documents/setu/amar-gupta-admin show milestone/freelance-leads:docs/superpowers/plans/2026-11-01-freelance-leads.md`;
spec: same branch, `docs/superpowers/specs/2026-11-01-freelance-leads-design.md`).
This lane does P6 steps 1–4 in profile10. **Step 5 (admin `lib/freelance-leads/plan-host.ts`) moved to P7**
(leader, 2026-11-01: one lane, one repo).

Who: sonnet · high

Amar, 2026-11-01: demos are hosted on *"amargupta.tech noindex"*. Each lead gets a one-page plan at
`/plans/<token>`, made from structured JSON, never indexed, gone after 60 days.

- **Create:** `src/lib/mcp/tools/plans.ts`, `src/lib/plans/plan-store.ts`, `src/lib/plans/plan-schema.ts`,
  `supabase/migrations/00018_demo_plans.sql`, `tests/e2e/plans-noindex.spec.ts`, route `src/app/plans/[token]/page.tsx`.
- **Modify:** `src/lib/mcp/server.ts` (register next to `registerBlogTools`, line 66), `next.config.ts`
  (`X-Robots-Tag: noindex, nofollow` for `/plans/:path*` in `headers()`, line 38), `src/app/sitemap.test.ts`
  (asserts no `/plans/`).

1. Read this repo's `CLAUDE.md` and `docs/DOC-MAP.md` first — **Zod is v3 here** (`^3.25.76`), Next 16.2.3; the
   gate adds `npm run lint:colors`. `src/app/api/mcp/route.ts` GET answers 401 not 405 (`route.ts:118-128`): out of
   scope, filed as ADMIN-302; do not change it.
2. Red: a plan page carries `<meta name="robots" content="noindex, nofollow">` — the root layout sets
   `index: true, follow: true` (`src/app/layout.tsx:63`), so the page's `generateMetadata` overrides it — and the
   header; robots.txt does NOT disallow `/plans/` (Google reads noindex only on a crawlable page); the sitemap has
   no `/plans/`; an unknown or expired token is a 404; the honesty strip ("Plan hai, bana hua product nahi" /
   "This is a plan, not a finished product") and the price range ($300–600, Amar's answer) are in the page
   template, not in stored data. The E2E file sits under `testDir: "./tests/e2e"` (`playwright.config.ts:7`);
   confirm with `npx playwright test --list`.
3. Tool `plan_upsert` (token, plan as structured JSON validated by a Zod v3 schema in `plan-schema.ts`,
   `expires_at` 60 days) and `plan_unpublish`. No HTML is stored: one template renders the JSON.
4. Migration: RLS on, **no** anon or authenticated policy, read only by the service role by token. Project
   `avcnoywxnkajfuobftmr` (shared with setu-nextjs) is reached by the `mcp__claude_ai_Supabase__*` tools
   (leader checked 2026-11-01). **Message the leader before the dry run**; BEGIN/ROLLBACK dry run first; the leader
   says when to apply.

Gate: this repo's own gate (CLAUDE.md) — typecheck, lint, `lint:colors`, unit, E2E. Commit on your lane branch.
Never push, never deploy (one deploy per milestone; the leader asks Amar). SHA to the leader, then
`progress.sh finish --base milestone/freelance-plans`.
