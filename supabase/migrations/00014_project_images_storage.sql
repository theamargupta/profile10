-- Storage bucket for project images uploaded from admin panel.
insert into storage.buckets (id, name, public)
values ('project-images', 'project-images', true)
on conflict (id) do nothing;

create policy "Public read project-images"
on storage.objects
for select
using (bucket_id = 'project-images');

create policy "Auth upload project-images"
on storage.objects
for insert
with check (
  bucket_id = 'project-images'
  and auth.role() = 'authenticated'
);
