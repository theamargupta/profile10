# `supabase/` Context

## Migrations
- Existing migrations use a five-digit prefix and snake_case name, for example `00017_admin_full_crud_policies.sql`.
- New migrations should use the next prefix and never edit old migrations unless explicitly requested.
- Enable RLS for new tables.
- Add explicit policies for select/insert/update/delete as needed.
- Use `auth.uid()` for user ownership and the existing admin policy pattern for admin-only content management.
- Keep public reads limited to published portfolio content.
- Make seed data idempotent where practical and never include secrets.

## Storage
- Public buckets are acceptable for published portfolio assets.
- Private buckets should be used for drafts, unpublished media, or admin-only uploads.
- Storage policies must match bucket intent and operation type.
- Public image URLs must remain compatible with `next.config.ts` remote image settings.

## Review
- For schema changes, check dependent TypeScript helpers and route data fetches.
- For destructive changes, document migration risk and expected data impact.
