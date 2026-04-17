---
description: Add a project content row and storage assets through Supabase-safe SQL conventions.
argument-hint: "<project-slug>"
allowed-tools: Read, Write, Glob, Grep, Bash
---

Add a project entry for slug `$ARGUMENTS`.

Steps:
1. Inspect migrations and helpers to confirm the project table name and schema.
2. If a `projects` table or equivalent cannot be found, stop and report.
3. Create a SQL helper or migration-compatible insert for the new row; do not hard-code secrets.
4. Upload or reference assets in the correct public Supabase Storage bucket.
5. Ensure image URLs match `next.config.ts` remote image configuration.
6. Preserve existing slug, ordering, and featured-project conventions.
7. Run the narrowest relevant verification command.

Never expose `SUPABASE_SERVICE_ROLE_KEY` to a client bundle or `NEXT_PUBLIC_` variable.
