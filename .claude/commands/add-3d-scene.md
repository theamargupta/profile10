---
description: Add a client-only React Three Fiber scene with lazy loading and reduced-motion fallback.
argument-hint: "<scene-name>"
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

Scaffold a new R3F scene for `$ARGUMENTS`.

Steps:
1. Read `CLAUDE.md` and `src/components/CLAUDE.md`.
2. Inspect current 3D/canvas patterns under `src/components/`.
3. Create the scene as a `'use client'` component.
4. Export a wrapper that uses `next/dynamic` with `{ ssr: false }` and `Suspense`.
5. Add a `prefers-reduced-motion` guard with a non-WebGL fallback.
6. Memoize static geometries/materials and avoid per-frame object allocation.
7. Keep Three/R3F imports out of Server Components.
8. Run `npm run lint` and, when practical, `npm run build`.

Do not add dependencies or introduce global rendering side effects.
