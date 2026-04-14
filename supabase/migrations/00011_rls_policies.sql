-- Enable RLS on all tables
alter table profiles enable row level security;
alter table tools enable row level security;
alter table projects enable row level security;
alter table project_tools enable row level security;
alter table project_challenges enable row level security;
alter table project_features enable row level security;
alter table experiences enable row level security;
alter table skill_categories enable row level security;
alter table services enable row level security;
alter table socials enable row level security;
alter table blog_posts enable row level security;
alter table blog_tags enable row level security;
alter table blog_post_tags enable row level security;
alter table contact_submissions enable row level security;

-- Public read access for portfolio content
create policy "Public read profiles" on profiles for select using (true);
create policy "Public read tools" on tools for select using (true);
create policy "Public read projects" on projects for select using (true);
create policy "Public read project_tools" on project_tools for select using (true);
create policy "Public read project_challenges" on project_challenges for select using (true);
create policy "Public read project_features" on project_features for select using (true);
create policy "Public read experiences" on experiences for select using (true);
create policy "Public read skill_categories" on skill_categories for select using (true);
create policy "Public read services" on services for select using (true);
create policy "Public read socials" on socials for select using (true);
create policy "Public read blog_tags" on blog_tags for select using (true);
create policy "Public read blog_post_tags" on blog_post_tags for select using (true);

-- Blog posts: only published ones are publicly readable
create policy "Public read published blog_posts" on blog_posts for select using (published = true);

-- Contact form: anyone can insert, only authenticated can read/manage
create policy "Public insert contact" on contact_submissions for insert with check (true);
create policy "Auth read contact" on contact_submissions for select using (auth.role() = 'authenticated');
create policy "Auth update contact" on contact_submissions for update using (auth.role() = 'authenticated');
create policy "Auth delete contact" on contact_submissions for delete using (auth.role() = 'authenticated');
