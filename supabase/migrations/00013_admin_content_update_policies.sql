-- Allow authenticated users to edit other portfolio content tables.
create policy "Auth update projects"
on projects
for update
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

create policy "Auth update services"
on services
for update
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

create policy "Auth update experiences"
on experiences
for update
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

create policy "Auth update skill_categories"
on skill_categories
for update
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

create policy "Auth update socials"
on socials
for update
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');
