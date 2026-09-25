# SEO audit — measured, repeatable, and the fixes it names

Plan: `docs/superpowers/plans/2026-09-25-seo-audit.md` (lane 3). Context spec:
`../kamai/docs/superpowers/specs/2026-09-25-blog-to-google-design.md`.

## What it does

- **`scripts/seo-audit/`** measures a live site (production by default) and prints JSON facts per page:
  status, `<title>`, meta description, canonical, robots, `og:*`, `twitter:*`, `<h1>` count, heading-level
  skips, `<img>` without `alt`, JSON-LD types, and for every `Article`/`BlogPosting` node the Google-
  recommended fields it lacks. It also checks host/slash redirects and that a missing slug is a 404.
  - `page-facts.mjs` — pure: HTML → facts. Unit-tested.
  - `run.mjs` — fetches the pages and prints the report. `node scripts/seo-audit/run.mjs [baseUrl]`.
  - Lighthouse (SEO + Performance, mobile and desktop) runs beside it through `npx lighthouse@13.5.0`
    against the Playwright Chromium binary; its scores go in the audit doc, not in this script.
- **`docs/seo-audit-2026-09-25.md`** records every finding: measured value, page, severity. Before/after
  numbers are appended after the fixes deploy, from the same script.
- **Fixes** (phase 2) are the high-severity findings, one commit each, each with a test that failed first.
  First among them: a per-post Open Graph image (`src/app/blog/[slug]/opengraph-image.tsx`) so a post
  without a cover still has an `og:image`, and the JSON-LD `image` is the post's own.

## What it refuses

- Calling the site "SEO-proof" from a checklist. Only measured facts go in the audit.
- Editing lane 1's files (`src/app/sitemap.ts`, `src/lib/queries.ts`, `src/app/rss.xml/`,
  `src/app/llms.txt/`, `public/llms.txt`). Findings there go in the audit and to the leader.
- Adding Lighthouse as a dependency. It is pinned in the `npx` call; the repo does not need it installed.
- Writing to production data. The audit only reads.
