# `src/lib/` Context

> 📚 **Cross-repo technical reference:** the dense `file_path:line` corpus for this whole Setu repo-of-repos lives at [`Setu/docs/README.md`](/Volumes/maersk/amargupta/Documents/LatestProjects/PortfolioProject/Setu/docs/README.md). Open that index whenever you need code-level detail beyond this file — every linked sub-doc is line-cited so you can jump straight to source.

## Scope
Shared helpers, Supabase clients, formatting utilities, and server-only integrations.

## Supabase Clients
- SSR client: use `@supabase/ssr` for Server Components, route handlers, and cookie-aware reads.
- Browser client: keep in its own client-safe module and only use `NEXT_PUBLIC_SUPABASE_URL` plus `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Service-role client: keep in its own server-only file, import `'server-only'`, and read `SUPABASE_SERVICE_ROLE_KEY` only on the server.

## Rules
- Never import a service-role client into a file with `'use client'`.
- Do not place secret env reads in shared modules that can enter the client bundle.
- Keep fetch/data helpers typed and explicit about nullable content.
- Prefer small single-purpose helpers over broad utility buckets.
- Preserve existing Supabase helper names and import paths unless refactoring is requested.
