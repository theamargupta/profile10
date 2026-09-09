@AGENTS.md

# amargupta.tech — Personal Portfolio

> 📚 **Cross-repo technical reference:** the dense `file_path:line` corpus for this whole Setu repo-of-repos lives at [`Setu/docs/README.md`](/Volumes/maersk/amargupta/Documents/LatestProjects/PortfolioProject/Setu/docs/README.md). Open that index whenever you need code-level detail beyond this file — every linked sub-doc is line-cited so you can jump straight to source.

@docs/DOC-MAP.md — version-pinned context7 IDs per library. Read it before touching any
library API. **Zod here is v3, not v4** — do not carry an answer in from a sibling repo.
`npm run doc-map:check` fails if a row has gone stale.

## Overview
Personal portfolio + writing site. Next.js 16 frontend, heavy 3D/motion, Supabase as a lightweight content store (projects, writing, assets via Supabase Storage).

## Nested Context
- `src/app/` — routes + metadata conventions
- `src/components/` — section / three / motion / ui
- `src/lib/` — helpers + Supabase clients
- `supabase/` — migrations + storage buckets

## Tech Stack
- Next.js 16.2.3 (App Router, Turbopack), React 19, TypeScript strict
- Tailwind CSS v4 — CSS-first via `@theme` in `src/app/globals.css`. NO `tailwind.config.js`.
- `next-themes` for dark mode
- Three.js 0.183 + `@react-three/fiber` 9 + `@react-three/drei` 10 + `@react-three/postprocessing` 3
- GSAP 3.15 + `@gsap/react` 2
- Framer Motion 12, Lenis 1.3
- `@supabase/ssr` + `@supabase/supabase-js` (SSR-aware client)

## Commands
```bash
npm run dev     # Dev server
npm run build
npm run lint
```

## Env
```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
AMARGUPTA_MCP_BEARER=...   # shared secret for /api/mcp; see MCP section
```

## MCP
Streamable HTTP MCP at `/api/mcp` (POST + optional SSE GET). Two auth paths, either works:

1. **OAuth 2.1 + DCR (RFC 7591)** — for Claude.ai / Cursor / ChatGPT connector flows. Discovery at `/.well-known/oauth-protected-resource/api/mcp`. `/oauth/{register,authorize,token,revoke}` mirror the setu-nextjs pattern. The `mcp_oauth_*` tables are SHARED with setu-nextjs in Supabase project `avcnoywxnkajfuobftmr` — `validateResource` enforces resource binding so tokens don't cross apps. Single-operator gate: `/oauth/authorize` only mints tokens for `AMARGUPTA_OPERATOR_EMAIL` (default `theamargupta.tech@gmail.com`) after Supabase sign-in via `/admin`.
2. **Legacy static bearer** — `AMARGUPTA_MCP_BEARER` env var; paste the value into the client's `Authorization: Bearer …` header. Kept for back-compat with the original config below.

Tools (7):
- `blog_list_posts` — list drafts + published (filter by `published?`).
- `blog_get_post` — fetch by slug or uuid id, returns body + joined tags.
- `blog_create_post` — write a draft or publish-on-create. Slug derived from title; reading time estimated from body.
- `blog_update_post` — patch any subset of title / slug / excerpt / content / cover_image. Recomputes reading time if content changes.
- `blog_publish_post` — toggle `published` (stamps / clears `published_at`).
- `blog_list_tags` — full tag catalog.
- `blog_attach_tags_to_post` — link tags to a post by slug; creates missing tag rows on the fly.

Distinct from Auto-Blog (Swayam-owned, writes `blog_published`) — these tools target the manual `blog_posts` table. The `/blog` and `/blog/[slug]` routes blend both via `getCombinedBlogPosts` / `getCombinedBlogPostBySlug`.

Cursor / Claude Code config:
```json
{
  "mcpServers": {
    "amargupta-tech": {
      "url": "https://amargupta.tech/api/mcp",
      "headers": { "Authorization": "Bearer <AMARGUPTA_MCP_BEARER>" }
    }
  }
}
```

Source: `src/app/api/mcp/route.ts`, `src/lib/mcp/server.ts`, `src/lib/mcp/tools/blog.ts`, `src/lib/supabase/service-role.ts`.

## Conventions
- Server Components by default.
- 3D scenes: client-only, lazy-loaded via `next/dynamic { ssr: false }`, memoize geometries.
- GSAP: `useGSAP({ scope })` from `@gsap/react`.
- Respect `prefers-reduced-motion` everywhere.
- Images: `next/image`. Remote hosts already whitelisted in `next.config.ts` — add to that list if you add a new host.
- Supabase Storage URLs use the public bucket pattern configured in `next.config.ts`.

## THE BUILD LOOP (every feature and every bugfix, in this order)

The full rule lives in `~/.claude/CLAUDE.md` Rule 0 and loads every session. Bound
to this repo's actual commands:

1. **Docs first** — `@docs/DOC-MAP.md`, pinned to the installed version.
   **Zod here is v3.** Never carry an answer in from `devfrendlmsv1` or `usstaffingagent`.
2. **Research before patching, and before designing** — how did others do it, and
   how did they TEST it. If a page 404s or is JS-rendered, open it in
   Claude-in-Chrome; a failed fetch is not an empty web. *(Enforced: a failing
   test denies edits until you look something up.)*
3. **Spec** — `docs/specs/<feature>.md`. What it does, what it refuses to do, why.
4. **Plan** — the files to touch and the steps, **broken into phases**. Every
   file the plan creates or extends stays under 200 lines (split first, and say
   into what), and each phase is finished — green, clean, committed — before
   the next starts. The plan names each checkpoint.
5. **Tests first** — `npm test` (Vitest) for logic, `npm run test:e2e` (Playwright)
   for any user-facing flow. Confirm red for the right reason before writing code.
6. **Implement until green** — `npm run type-check` + `npm run lint` +
   `npm run lint:colors` + `npm test` + `npm run test:e2e`, then commit.
7. **Phase it** — small phases with checkpoints, executed inline.

## Rules
- No `tailwind.config.*` — Tailwind v4.
- Service-role Supabase key stays server-only. Never import into a client component.
- Never commit `.env*` files.

---

## App URLs (devfrend.com family)

| App | URL | Repo |
|---|---|---|
| amargupta.tech | https://amargupta.tech | `Profile10-amargupta.tech/` (this repo) |
| Blog AI | https://blogai.devfrend.com | `auto-blog-nextjs/` |
| Project Memory | https://pm.devfrend.com | `project-memory/` |
| Sandesh | https://sandesh.devfrend.com | `sandesh-nextjs/` |
| Sankalp | https://sankalp.devfrend.com | `sankalp/sankalp-nextjs/` |
| Sathi | https://sathi.devfrend.com | `sathi-nextjs/` |
| SEO AI | https://seoai.devfrend.com | `auto-seo-nextjs/` |
| Setu | https://setu.devfrend.com | `setu-nextjs/` |
| Sutra | https://sutra.devfrend.com | `sutra-main/` (Next.js marketing + Electron) |
| Swayam | https://swayam.devfrend.com | `swayam-nextjs/` |
