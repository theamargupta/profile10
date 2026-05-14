@AGENTS.md

# amargupta.tech — Personal Portfolio

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
This app exposes a Streamable HTTP MCP at `/api/mcp` (POST + optional SSE GET). Single-operator pattern — bearer-token auth via `AMARGUPTA_MCP_BEARER` env, service-role Supabase client server-side.

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

## Rules
- No `tailwind.config.*` — Tailwind v4.
- Service-role Supabase key stays server-only. Never import into a client component.
- Never commit `.env*` files.
