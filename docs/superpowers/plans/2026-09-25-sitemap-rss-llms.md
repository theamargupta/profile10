# Plan — lane 1: new posts reach the sitemap, RSS and llms.txt within minutes

Spec: `../kamai/docs/superpowers/specs/2026-09-25-blog-to-google-design.md` (canonical; read it first). The
build loop is global Rule 0 (`/build-loop`). Leader: session `kamai-8e`. Test and gate commands: this repo's
`CLAUDE.md` / `docs/DOC-MAP.md`. Next.js 16.2.3 → context7 `/vercel/next.js/v16.2.2`.

**Files this lane owns (nobody else edits them):** `src/app/sitemap.ts`, `src/lib/queries.ts`,
`src/app/rss.xml/route.ts` (new), `src/app/llms.txt/route.ts` (new), `public/llms.txt` (deleted in phase 3),
and their tests. Lane 3 (SEO audit) works in this repo at the same time on other files; if you need one of
its files, message the leader rather than editing it.

## Phase 1 — the sitemap misses new posts (bug; reproduce first)
- Reproduce on production: `curl -s https://amargupta.tech/sitemap.xml | grep -c <newest published slug>`
  returns 0 while `/blog` lists it. Measured 2026-09-25 13:45 UTC: `x-vercel-cache: HIT`,
  `last-modified: 10:14:04 GMT`, `age: 12624`, despite `export const revalidate = 300`.
- Research before patching (context7 + the Next 16 caching/upgrade guide): sitemap.ts is "a special Route
  Handler that is cached by default"; how segment `revalidate` treats a supabase-js `fetch`; whether ISR
  regeneration is failing. State the hypothesis, try to DISPROVE it locally (`next build && next start`).
- A test that fails today, then the fix in `src/app/sitemap.ts` (and `src/lib/queries.ts` only if needed).
- Checkpoint: gate green, commit on your branch, message the leader with the SHA. **Push only your branch; the leader integrates into main and deploys** (a main push deploys amargupta.tech, and it goes out only on Amar's OK). After deploy (SHA, Production filter): the live
  sitemap contains the newest slug.

## Phase 2 — RSS feed
- Create `src/app/rss.xml/route.ts`: RSS 2.0 of published posts (title, link, pubDate, description =
  excerpt), fresh by the same rule as phase 1. Test first.
- Checkpoint: after deploy, `curl -sI https://amargupta.tech/rss.xml` is 200 `application/rss+xml` and the
  body lists the newest post.

## Phase 3 — llms.txt from data
- Create `src/app/llms.txt/route.ts` and delete `public/llms.txt` in the same commit (a public file wins
  over a route). Keep its profile sections; the headline becomes the site's "Senior Frontend Developer —
  AI & MCP" (the static file still says Full Stack; see commit a1ec730); "## Blog" lists the newest
  published posts (title, URL, excerpt). Test first.
- Checkpoint: after deploy, `curl -s https://amargupta.tech/llms.txt` shows the frontend headline and the
  newest post.
