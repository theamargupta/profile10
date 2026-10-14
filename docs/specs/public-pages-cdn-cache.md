# Public pages served from the CDN

Plan: `docs/superpowers/plans/2026-10-14-public-pages-cdn-cache.md` (lane 6).

## Cause

Every public page answered `cache-control: private, no-cache, no-store` with `x-vercel-cache: MISS`
(measured 2026-10-14 on `/`, `/blog` and a post), so every visit and every crawler hit ran a function.
profile10 used 24.9% of the team's Fluid Active CPU over 30 days.

`src/lib/queries.ts` built its Supabase client with `createClient()` from `src/lib/supabase/server.ts`,
and that function awaits `cookies()`. The footer (`getSocials`) is rendered by the root layout, so
**every** route reached `cookies()`. The `revalidate = 3600` on `/blog` and `/blog/[slug]` had no effect.

Next 16.2 docs (`02-guides/production-checklist.md`): *"Request-time APIs like `cookies` and
`searchParams` opt the entire route into Dynamic Rendering."*

## The fix

- Every read in `src/lib/queries.ts` uses `createStaticClient()` (`src/lib/supabase/static.ts`), the
  same anon key with no cookies. **`src/lib/queries.ts` must never import `@/lib/supabase/server`**,
  and `src/lib/queries.static.test.ts` guards that.
- `getContactSubmissions` is the only read that needs the signed-in user (RLS
  `auth.role() = 'authenticated'`). It moves to `src/lib/admin-queries.ts` and keeps the cookie client.
  Only `/admin` imports it.
- Why the rows are the same: with no session the cookie client runs as `anon` too. Every public table's
  SELECT policy is `using (true)`. `blog_posts` also lets authenticated users read drafts, but every blog
  query filters on `published = true`. Row counts per query were compared before and after, on real data.
- `/blog/[slug]` and `/project/[slug]` have no `generateStaticParams`, so the docs say they stay
  dynamic: *"It is mandatory to return an array from `generateStaticParams`, as failing to do so will
  result in the route being dynamically rendered."* Both return `[]` now, and each path is rendered on
  its first visit, then cached. *"To statically render all paths the first time they are visited,
  return an empty array from `generateStaticParams`."*
- `/` lists recent posts, including Auto-Blog posts that Swayam writes from another app. Those never call
  our `revalidatePath`, so `/` gets `revalidate = 3600`, the same as `/blog`. Without that, `/` would
  be fully static and would never show an Auto-Blog post until the next deploy.

## The revalidate contract

One helper, `revalidatePublicPages()` (`src/lib/revalidate-public-pages.ts`), calls
`revalidatePath('/', 'layout')`. Per-path calls are not enough: socials render in the footer of every route,
the profile renders in every post's AuthorBio, and a post appears on `/`, `/blog` and in every post's ReadNext.
Writes are rare, and an invalidated page only re-renders on its next visit, so invalidating every page is cheap.
Next 16.2 docs (`revalidatePath.md`, "Revalidating all data"): *"This will purge the Client Cache, and invalidate
all cached data for revalidation on the next page visit."* They also say *"`revalidatePath` can be called in
Server Functions and Route Handlers"*, and the MCP tools run inside the `/api/mcp` Route Handler.

**It runs only after a successful write.** A failed write returns (MCP) or redirects (admin) before the call.
`blog.revalidate.test.ts` and `admin/revalidate-public-pages.test.ts` test both paths.

| Write | Revalidates |
|---|---|
| MCP `blog_update_post`, `blog_publish_post` (publish and unpublish), `blog_attach_tags_to_post` | every public page |
| MCP `blog_create_post` | every public page if `published`; nothing for a draft |
| Every `/admin` action except the contact inbox (34 actions; a source test fails if a new one forgets) | every public page, plus the per-path calls it already made |
| `/admin` contact inbox (mark read, delete) | `/admin` only, because contact data is never public |
| Auto-Blog (Swayam) writes to `blog_published` | **nothing here.** `/` and `/blog` re-render at most hourly (`revalidate = 3600`), so **an Auto-Blog post can take up to 1 h to appear** on `/` and `/blog`. Its own page `/blog/<slug>` renders on its first visit. |

**A multi-step write revalidates as soon as its first public row lands** (Codex review, 2026-10-14). The admin
JSON import revalidates after each project insert, the admin blog create/update actions revalidate after the
post write (before the tag sync), and `blog_attach_tags_to_post` revalidates after it creates a
tag. So a later failure in the same call (project 2, or the post-tag link) still leaves the cache invalidated
for the rows that were written. Both cases are tested.

## What stays dynamic, and why

- `/admin`, `/api/*`, `/oauth/*`: these need the session or the request.
- `sitemap.ts`, `rss.xml`, `llms.txt`: still `force-dynamic`, and this lane does not change them.
  `sitemap.ts:6` says why: with `revalidate = 300` a new post stayed out of the sitemap. They are small,
  and mostly bots fetch them. **Possible follow-up:** give each one a `revalidate` and call
  `revalidatePath` on publish, as the pages do now. Measure their share of invocations first.

## What this refuses to do

- No `export const dynamic = 'force-static'`. It would make `cookies()` return empty values and hide
  the next accidental use of a Request-time API. The guard test catches that instead.
- No change to RLS or to any table.
