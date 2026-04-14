create policy "Auth insert projects"
on projects
for insert
with check (auth.role() = 'authenticated');

create policy "Auth insert services"
on services
for insert
with check (auth.role() = 'authenticated');

create policy "Auth insert experiences"
on experiences
for insert
with check (auth.role() = 'authenticated');

create policy "Auth insert skill_categories"
on skill_categories
for insert
with check (auth.role() = 'authenticated');

create policy "Auth insert socials"
on socials
for insert
with check (auth.role() = 'authenticated');
