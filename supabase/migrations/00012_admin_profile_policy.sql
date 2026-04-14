-- Allow authenticated users to update portfolio profile content.
create policy "Auth update profiles"
on profiles
for update
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');
