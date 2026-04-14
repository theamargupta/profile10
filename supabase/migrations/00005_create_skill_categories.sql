create table if not exists skill_categories (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  category text not null,
  skills text not null,
  sort_order int default 0
);
