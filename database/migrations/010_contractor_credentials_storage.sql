-- ============================================================
-- 010: Contractor Credentials Storage
-- Private bucket for credential documents (licenses, insurance, etc.)
-- Folder structure: {user_id}/{credential_type}/{filename}
-- ============================================================

insert into storage.buckets (id, name, public)
values ('contractor-credentials', 'contractor-credentials', false)
on conflict (id) do nothing;

-- ============================================================
-- Storage Policies
-- ============================================================

-- Users can upload to their own folder
create policy "Users can upload credentials"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'contractor-credentials'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can view their own credentials
create policy "Users can view own credentials"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'contractor-credentials'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can update their own credentials
create policy "Users can update own credentials"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'contractor-credentials'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own credentials
create policy "Users can delete own credentials"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'contractor-credentials'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
