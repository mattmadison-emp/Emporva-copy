-- ============================================================
-- 056: Property photos storage bucket
--
-- The Property Edit modal uploads property photos to a 'property-photos'
-- bucket, but that bucket was never created — so every property photo
-- upload fails and the dashboard never shows a photo. This creates the
-- private bucket and its owner-folder-gated storage RLS policies.
--
-- Path layout: {user_id}/property/{file}.{ext}  →  foldername[1] = auth.uid()
-- Photos are served via signed URLs (private bucket), matching the app.
-- Idempotent — safe to re-run. Run in the Supabase SQL editor.
-- ============================================================

insert into storage.buckets (id, name, public)
values ('property-photos', 'property-photos', false)
on conflict (id) do nothing;

drop policy if exists "Users can upload own property photos"        on storage.objects;
drop policy if exists "Users can view own property photos"          on storage.objects;
drop policy if exists "Users can update own property photos"        on storage.objects;
drop policy if exists "Users can delete own property photos"        on storage.objects;

create policy "Users can upload own property photos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'property-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users can view own property photos"
  on storage.objects for select to authenticated
  using (bucket_id = 'property-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users can update own property photos"
  on storage.objects for update to authenticated
  using (bucket_id = 'property-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users can delete own property photos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'property-photos' and (storage.foldername(name))[1] = auth.uid()::text);
