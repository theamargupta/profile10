---
description: Create the next Supabase migration using local numbering, RLS, and ownership policies.
argument-hint: "<snake_case_name>"
allowed-tools: Read, Write, Glob, Grep, Bash
---

Create a Supabase migration for `$ARGUMENTS`.

Steps:
1. Read `supabase/CLAUDE.md`.
2. Inspect `supabase/migrations/` and use the next numeric prefix in the existing five-digit pattern, for example `00018_snake_case.sql`.
3. Use lowercase snake_case filenames.
4. Include `alter table ... enable row level security` for new tables.
5. Add explicit policies using `auth.uid()` for owner/admin access where applicable.
6. Keep public read policies intentional and narrow.
7. If adding storage buckets, define bucket policy and allowed operations explicitly.
8. Do not edit old migrations unless the user explicitly requests it.

Report the created migration path and any follow-up SQL that must be run manually.
