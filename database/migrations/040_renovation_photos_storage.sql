-- Storage bucket for renovation photo uploads (Inspiration Board / Generate New)
insert into storage.buckets (id, name, public)
values ('renovation-photos', 'renovation-photos', true)
on conflict (id) do nothing;

-- Allow authenticated users to upload to their own folder
create policy "Users can upload renovation photos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'renovation-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to read their own photos
create policy "Users can read own renovation photos"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'renovation-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow public read access (bucket is public for getPublicUrl)
create policy "Public read access for renovation photos"
  on storage.objects for select
  to anon
  using (bucket_id = 'renovation-photos');
