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
```

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
