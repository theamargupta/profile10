-- Tools: authenticated CRUD
create policy "Auth insert tools"
on tools
for insert
with check (auth.role() = 'authenticated');

create policy "Auth update tools"
on tools
for update
using (auth.role() = 'authenticated');

create policy "Auth delete tools"
on tools
for delete
using (auth.role() = 'authenticated');

-- Project sub-tables: authenticated CRUD
create policy "Auth insert project_tools"
on project_tools
for insert
with check (auth.role() = 'authenticated');

create policy "Auth update project_tools"
on project_tools
for update
using (auth.role() = 'authenticated');

create policy "Auth delete project_tools"
on project_tools
for delete
using (auth.role() = 'authenticated');

create policy "Auth insert project_challenges"
on project_challenges
for insert
with check (auth.role() = 'authenticated');

create policy "Auth update project_challenges"
on project_challenges
for update
using (auth.role() = 'authenticated');

create policy "Auth delete project_challenges"
on project_challenges
for delete
using (auth.role() = 'authenticated');

create policy "Auth insert project_features"
on project_features
for insert
with check (auth.role() = 'authenticated');

create policy "Auth update project_features"
on project_features
for update
using (auth.role() = 'authenticated');

create policy "Auth delete project_features"
on project_features
for delete
using (auth.role() = 'authenticated');

-- Blog post tags junction: authenticated CRUD
create policy "Auth insert blog_post_tags"
on blog_post_tags
for insert
with check (auth.role() = 'authenticated');

create policy "Auth delete blog_post_tags"
on blog_post_tags
for delete
using (auth.role() = 'authenticated');

-- Delete policies for main content tables
create policy "Auth delete projects"
on projects
for delete
using (auth.role() = 'authenticated');

create policy "Auth delete services"
on services
for delete
using (auth.role() = 'authenticated');

create policy "Auth delete experiences"
on experiences
for delete
using (auth.role() = 'authenticated');

create policy "Auth delete skill_categories"
on skill_categories
for delete
using (auth.role() = 'authenticated');

create policy "Auth delete socials"
on socials
for delete
using (auth.role() = 'authenticated');

create policy "Auth delete blog_posts"
on blog_posts
for delete
using (auth.role() = 'authenticated');

create policy "Auth delete blog_tags"
on blog_tags
for delete
using (auth.role() = 'authenticated');
