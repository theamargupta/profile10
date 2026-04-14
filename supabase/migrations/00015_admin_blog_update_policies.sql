create policy "Auth update blog_posts"
on blog_posts
for update
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

create policy "Auth insert blog_posts"
on blog_posts
for insert
with check (auth.role() = 'authenticated');

create policy "Auth update blog_tags"
on blog_tags
for update
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

create policy "Auth insert blog_tags"
on blog_tags
for insert
with check (auth.role() = 'authenticated');

-- Allow authenticated users to read ALL blog posts (including drafts) for admin
create policy "Auth read all blog_posts"
on blog_posts
for select
using (auth.role() = 'authenticated');
