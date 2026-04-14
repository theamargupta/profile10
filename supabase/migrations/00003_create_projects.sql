create table if not exists projects (
  id text primary key,
  title text not null,
  description text,
  demo_img text,
  live_url text,
  repo_url text,
  featured boolean default false,
  sort_order int default 0,
  architecture text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists project_tools (
  project_id text not null references projects(id) on delete cascade,
  tool_id text not null references tools(id) on delete cascade,
  sort_order int default 0,
  primary key (project_id, tool_id)
);

create table if not exists project_challenges (
  id uuid primary key default gen_random_uuid(),
  project_id text not null references projects(id) on delete cascade,
  title text not null,
  solution text not null,
  sort_order int default 0
);

create table if not exists project_features (
  id uuid primary key default gen_random_uuid(),
  project_id text not null references projects(id) on delete cascade,
  feature text not null,
  sort_order int default 0
);
