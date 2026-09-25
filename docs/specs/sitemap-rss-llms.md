# Sitemap, RSS and llms.txt: fresh from the data

Canonical design: `../kamai/docs/superpowers/specs/2026-09-25-blog-to-google-design.md` (lane 1 of it).
Plan: `docs/superpowers/plans/2026-09-25-sitemap-rss-llms.md`.

## What it does

- `/sitemap.xml` lists every published post (`blog_posts` + `blog_published`, deduped) with its real lastmod,
  and a post shows up on the first request after it is published.
- `/rss.xml` is RSS 2.0 of published posts (title, link, pubDate, description = excerpt), just as fresh.
- `/llms.txt` is generated: the profile block (frontend first, matching the site) plus the newest posts.

## Why the sitemap was stale (measured 2026-09-25, not recalled)

Production: the newest post (published 02:45 UTC) was on `/blog` and missing from `/sitemap.xml` at 13:50 UTC;
`x-vercel-cache: HIT`, `last-modified 10:14:04 GMT`, with `export const revalidate = 300`.

Local `next build`: `/sitemap.xml` built as `○` static, revalidate 5m, and the supabase-js requests
(`/rest/v1/blog_posts…`, `/rest/v1/projects…`) were written to `.next/cache/fetch-cache` with
`revalidate: 300`. Next 16 docs (`caching-without-cache-components.md`): the segment `revalidate` is "the
default revalidation time" and fetches "discovered before a Request-time API is used" are cached. So two
stale-while-revalidate caches were stacked: the ISR page and the Data Cache under it (on Vercel the Data
Cache outlives deployments). With sparse sitemap traffic each regeneration still read old data.

Fix: `export const dynamic = "force-dynamic"`. Per the same doc it is equivalent to `cache: 'no-store'` on
every fetch in the route and renders it per request. The sitemap is a few requests a day; two small
PostgREST reads per request cost nothing.

## What it refuses

- A retry, a shorter `revalidate`, or cache-busting to hide the lag. None of them removes the stacked cache.
- A hand-written `public/llms.txt`: a file in `public/` wins over a route, and it goes stale by design.

## Found while building it (2026-09-25)

- **lastmod was "now" on every crawl.** Once the sitemap rendered per request, `new Date()` stamped `/`,
  `/about`, `/projects` and every project with the request time. Every lastmod now comes from a record
  (post date, project `updated_at`); `/about` has none, so it carries no lastmod.
- **Excerpts carried raw markdown.** Auto-Blog excerpts were cut from `body_md` with only HTML stripped,
  so 20 of 41 posts showed `[text](https://…)` on `/blog`, and the widest URL overflowed a mobile card by
  13px. `lib/plain-excerpt.ts` makes plain text for the cards, the RSS descriptions and llms.txt alike.
- **/blog listed 12 posts twice.** Those slugs exist in both `blog_posts` and `blog_published`;
  `getCombinedBlogPosts` now keeps the manual one, as the by-slug lookup already did.
