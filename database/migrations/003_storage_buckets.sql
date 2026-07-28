-- ============================================================
-- Storage Buckets
-- ============================================================

-- Property photos bucket (private - requires auth to access)
insert into storage.buckets (id, name, public)
values ('property-photos', 'property-photos', false)
on conflict (id) do nothing;

-- ============================================================
-- Storage Policies
-- ============================================================

-- Allow authenticated users to upload to their own folder
create policy "Users can upload property photos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'property-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to view their own photos
create policy "Users can view own property photos"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'property-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to update their own photos
create policy "Users can update own property photos"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'property-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to delete their own photos
create policy "Users can delete own property photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'property-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
