create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  title text not null,
  description text not null,
  icon text,
  sort_order int default 0
);
