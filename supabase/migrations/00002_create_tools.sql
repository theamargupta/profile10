create table if not exists tools (
  id text primary key,
  name text not null,
  icon text not null,
  color text,
  created_at timestamptz default now()
);
