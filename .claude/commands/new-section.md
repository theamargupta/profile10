---
description: Scaffold a new portfolio section using existing App Router and Supabase conventions.
argument-hint: "<section-name> [data-source]"
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

Create a new portfolio section for `$ARGUMENTS`.

Steps:
1. Read `CLAUDE.md`, `src/app/CLAUDE.md`, `src/components/CLAUDE.md`, and `src/lib/CLAUDE.md`.
2. Inspect existing section/component patterns before writing code.
3. Prefer a Server Component. Use a Supabase SSR client only when content is dynamic.
4. Keep exports metadata-friendly: stable component names, typed props, and no browser APIs in server files.
5. If the section needs motion, isolate it in a small client component and respect `prefers-reduced-motion`.
6. Use `next/image` for images and confirm remote hosts are allowed in `next.config.ts`.
7. Run `npm run lint` when source files change.

Do not create `tailwind.config.*`, add dependencies, or move existing routes.
