# Freelance plan pages: `/plans/<token>`

Design owner: amar-gupta-admin `docs/superpowers/specs/2026-11-01-freelance-leads-design.md` (decision 4, "Demo hosting").
Plan: `docs/superpowers/plans/2026-11-01-freelance-plan-pages.md` (this repo, lane 304, steps 1-4).
Amar, 2026-11-01: demos are hosted on *"amargupta.tech noindex"*.

## What it does

- Each freelance lead gets a one-page plan at `https://amargupta.tech/plans/<token>`. The token is chosen by the
  caller (admin), 16-64 characters of `A-Za-z0-9_-`, unguessable.
- The plan is **structured JSON**, validated by a Zod v3 schema (`src/lib/plans/plan-schema.ts`). No HTML is
  stored. One template (`src/components/plans/plan-view.tsx`) renders it as escaped React text, so there is
  nothing to sanitise (profile10 has no sanitiser dependency).
- MCP tool `plan_upsert` (token, plan) writes the row with `expires_at = now + 60 days`; calling it again for the
  same token replaces the plan and restarts the 60 days. MCP tool `plan_unpublish` (token) deletes the row.
  Both ride the existing `/api/mcp` bearer / OAuth gate. Each `plan_upsert` also deletes rows already expired.
- The page is rendered **per request** (`dynamic = "force-dynamic"`), never from the CDN: an unpublish or an
  expiry must take effect on the next visit. It reads the row with the service-role client, by token.

## What the page template always carries (never stored data)

- The honesty strip: "Plan hai, bana hua product nahi" / "This is a plan, not a finished product".
- The price range **$300-600** (Amar's answer, decision 3). No other number comes from the template.
- Both live in `src/lib/plans/plan-copy.ts` as constants, so a stored plan cannot leave them out.

## Never indexed

- `<meta name="robots" content="noindex, nofollow">` from the page's `generateMetadata`. The root layout sets
  `index: true, follow: true`; Next 16.2 `generate-metadata.md`: "`robots` ... defined in an earlier segment are
  overwritten by the last segment to define them".
- `X-Robots-Tag: noindex, nofollow` header for `/plans/:path*` in `next.config.ts` `headers()`.
- `robots.txt` does **not** disallow `/plans/`: Google reads `noindex` only on a page it may crawl.
- `sitemap.xml` has no `/plans/` entry.

## What it refuses

- An unknown, expired or unpublished token: HTTP **404** (a real status, not a streamed 200).
- A token that is not 16-64 URL-safe characters: 404 without a database read; the tool rejects it as an error.
- A plan with unknown keys, HTML-looking structure, more than 8 sections, or text over its length cap: the tool
  returns an error naming the field.
- Any anon or authenticated database access: `demo_plans` has RLS on and **no policy**; only the service role
  reads or writes it.
- A database error while reading the page is thrown (HTTP 500), never shown as "not found".

## Out of scope

- `src/app/api/mcp/route.ts` GET answers 401, not 405 (ADMIN-302). Not changed here.
- Admin side `plan-host.ts` (calls these tools): plan P7 in amar-gupta-admin.

## Data

`public.demo_plans` (`supabase/migrations/00018_demo_plans.sql`), project `avcnoywxnkajfuobftmr` shared with
setu-nextjs: `token text primary key`, `plan jsonb not null`, `expires_at timestamptz not null`,
`created_at`, `updated_at`. RLS on, no policy, privileges revoked from `anon` and `authenticated`.
