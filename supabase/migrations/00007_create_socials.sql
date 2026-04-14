create table if not exists socials (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  name text not null,
  href text not null,
  icon text not null,
  color text,
  sort_order int default 0
);
