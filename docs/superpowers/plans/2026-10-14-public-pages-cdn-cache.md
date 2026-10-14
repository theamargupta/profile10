# profile10: public pages served from the CDN, not a function per hit

Leader: `amar-gupta-admin-51`. Amar approved this on 2026-10-14 ~22:20 IST ("profile10 cache fix abhi"): build it, gate it,
have Codex review it, deploy it. The build loop is global Rule 0. One lane: one small phase plus a guard, and one owner.

## Why

profile10 used 1 h 38 m of the team's 4 h Fluid Active CPU in 30 days (24.9%), 2–6 min a day. Every public page
answers `cache-control: private, no-cache, no-store` with `x-vercel-cache: MISS` (measured 2026-10-14 on `/`,
`/blog` and a post). So every visitor and every crawler runs a function. `src/app/blog/page.tsx:8` and
`src/app/blog/[slug]/page.tsx:16` declare `revalidate = 3600`, but `src/lib/queries.ts:1` imports `createClient` from
`src/lib/supabase/server.ts`, which awaits `cookies()` (line 5). A Dynamic API makes the route dynamic, so ISR never
applies. `src/lib/supabase/static.ts` (`createStaticClient`, no cookies, the same anon key) already exists, and
`src/lib/feeds/*` use it.

## Phase 1: public reads go cookie-free, and publishing revalidates

1. Step 1 of the loop: read the Next docs for the installed version (DOC-MAP), on Dynamic APIs / `cookies()` opting
   out of static rendering, ISR `revalidate`, and `revalidatePath`/`revalidateTag`. Quote the sentences you relied on.
2. Red first. Write a test that fails today: `src/lib/queries.ts` must not import `@/lib/supabase/server` (or a
   source-level guard that public-route data modules never reach `cookies()`). Also run `next build`: today `/blog`,
   `/blog/[slug]`, `/` and `/project/[slug]` show as ƒ (dynamic). Record that output.
3. Switch every query in `src/lib/queries.ts` that public pages use to `createStaticClient()`. Before you switch any
   query, check that its tables are readable by the anon role exactly as they are today. Without a session the cookie
   client is the anon role too, so the rows must be identical. Prove it for each query on real data: same row count
   before and after. `/admin` and anything that needs the signed-in user keep the cookie client.
4. Publishing must still show up quickly. `src/lib/mcp/tools/blog.ts:273` promises "appears on amargupta.tech/blog
   within seconds (route is force-dynamic)". After a publish, update or unpublish, call `revalidatePath('/blog')` and
   `revalidatePath('/blog/<slug>')` (plus `/`, if the home page lists posts), and fix that sentence. Do the same in the
   `/admin` blog actions, if they write posts. A test should prove the publish path calls revalidate.
5. Leave `sitemap.ts`, `rss.xml` and `llms.txt` alone. sitemap.ts:6 explains why it is per request. Note in the spec
   whether they are worth a follow-up.
6. Gate: `npm run type-check`, `npm run lint`, `npm run lint:colors`, `npm test`, `npm run test:e2e` (routes + blog
   specs), and `next build` showing the public routes as ○/● (static/ISR). Codex (`-m gpt-5.6-terra`, read-only)
   reviews the diff; fix its findings. Commit, then send the leader the SHA.

Spec (NEW file, does not exist yet): `docs/specs/public-pages-cdn-cache.md`, a short one with the cause, the fix, the revalidate contract, and what
stays dynamic.

## Leader-only (never the lane)

Push, then the manual deploy (`DEPLOY_SKIP_DOMAIN=1 bash scripts/deploy-prod.sh`, `vercel curl`, promote). Step 8:
two requests to `/blog`, where the second shows `x-vercel-cache: HIT` (or STALE); then publish nothing new, but
check that the newest post's page renders. The CPU effect gets measured on the next closed billing bucket.

## Checkpoint

| Phase | Done when |
|---|---|
| 1 | red→green guard + build output ƒ→○/●, gate exit 0, Codex findings fixed, SHA sent |
