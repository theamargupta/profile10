create table if not exists experiences (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  company text not null,
  job_title text not null,
  employment_type text,
  location text,
  description text,
  start_date date not null,
  end_date date,
  sort_order int default 0,
  created_at timestamptz default now()
);
