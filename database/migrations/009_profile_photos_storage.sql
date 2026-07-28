-- ============================================================
-- 009: Profile Photos Storage
-- Public bucket for avatars and cover photos (all roles)
-- Folder structure: {user_id}/avatar.ext or {user_id}/cover.ext
-- ============================================================

-- Add cover_photo_url to contractor_profiles
alter table public.contractor_profiles
  add column if not exists cover_photo_url text;

-- ============================================================
-- Storage bucket — public so profile images can be viewed
-- without authentication (needed for public contractor pages)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('profile-photos', 'profile-photos', true)
on conflict (id) do nothing;

-- ============================================================
-- Storage Policies
-- ============================================================

-- Users can upload to their own folder
create policy "Users can upload profile photos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Anyone can view profile photos (public bucket)
create policy "Anyone can view profile photos"
  on storage.objects for select
  using (
    bucket_id = 'profile-photos'
  );

-- Users can update their own photos
create policy "Users can update own profile photos"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own photos
create policy "Users can delete own profile photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
