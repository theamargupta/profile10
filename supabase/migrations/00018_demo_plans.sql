-- Freelance plan pages: amargupta.tech/plans/<token> (docs/specs/freelance-plan-pages.md).
-- One row per published plan. The plan is structured JSON rendered by one template, never HTML.
-- RLS is on and there is deliberately NO policy: anon and authenticated can read or write nothing.
-- Only the service role (which bypasses RLS) reads or writes this table, by token, from
-- src/lib/plans/plan-store.ts. The project is shared with setu-nextjs; nothing here touches its tables.
create table if not exists public.demo_plans (
  token       text primary key check (token ~ '^[A-Za-z0-9_-]{16,64}$'),
  plan        jsonb not null,
  expires_at  timestamptz not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.demo_plans enable row level security;

-- Supabase grants new public tables to anon and authenticated by default; with RLS on and no policy those
-- grants already see zero rows, and this removes them as a second lock.
revoke all on public.demo_plans from anon, authenticated;

-- plan_upsert purges expired rows with `where expires_at < now`.
create index if not exists demo_plans_expires_at_idx on public.demo_plans (expires_at);
