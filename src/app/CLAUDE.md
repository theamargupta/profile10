# `src/app/` Context

## Scope
App Router routes, layouts, metadata, route handlers, and global providers.

## Rules
- Server Components by default. Add `'use client'` only for browser APIs, animation hooks, theme state, or WebGL.
- Read the relevant Next.js 16 docs in `node_modules/next/dist/docs/` before changing App Router APIs, metadata APIs, caching, or route handlers.
- Keep route metadata close to the route via `metadata` or `generateMetadata`.
- Use `next/image` for all meaningful images and keep remote hosts aligned with `next.config.ts`.
- `next-themes` provider belongs at the app provider/root boundary so theme state is available without duplicating providers.
- Lenis should be mounted once at the root/provider layer. Do not instantiate Lenis in individual pages or sections.
- Keep route handlers server-only and never expose `SUPABASE_SERVICE_ROLE_KEY`.

## Motion
- Respect `prefers-reduced-motion` for route-level transitions, Lenis behavior, and animated sections.
- Avoid blocking initial route render with heavy client components. Lazy-load 3D and complex motion.
