-- ============================================================
-- 055: Fix upload persistence (storage + table RLS)
--
-- Root cause: the buckets system-documents, project-photos, and
-- property-documents exist, but their storage.objects RLS policies were
-- never applied to production (migration 044 is not idempotent and fails
-- on re-run; 045/054 were never applied). With RLS enabled on
-- storage.objects and no INSERT policy, every upload to these buckets is
-- denied — so file-backed features (system documents, gallery photos,
-- the document vault) silently fail to persist while pure-DB-insert
-- features work.
--
-- This migration is fully idempotent (drop-if-exists + create) and safe
-- to re-run. Run it in the Supabase SQL editor against the project DB.
-- ============================================================

-- Ensure the private buckets exist (no-op if already created).
insert into storage.buckets (id, name, public) values
  ('system-documents',  'system-documents',  false),
  ('property-documents', 'property-documents', false),
  ('project-photos',     'project-photos',     false)
on conflict (id) do nothing;

-- ============================================================
-- Table RLS — owner-scoped (auth.uid() = user_id)
-- ============================================================
alter table public.property_system_documents enable row level security;

drop policy if exists "Users can view own system documents"   on public.property_system_documents;
drop policy if exists "Users can insert own system documents" on public.property_system_documents;
drop policy if exists "Users can update own system documents" on public.property_system_documents;
drop policy if exists "Users can delete own system documents" on public.property_system_documents;

create policy "Users can view own system documents"
  on public.property_system_documents for select using (auth.uid() = user_id);
create policy "Users can insert own system documents"
  on public.property_system_documents for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own system documents"
  on public.property_system_documents for update using (auth.uid() = user_id);
create policy "Users can delete own system documents"
  on public.property_system_documents for delete using (auth.uid() = user_id);

alter table public.property_documents enable row level security;

drop policy if exists "Users can view own property documents"   on public.property_documents;
drop policy if exists "Users can insert own property documents" on public.property_documents;
drop policy if exists "Users can update own property documents" on public.property_documents;
drop policy if exists "Users can delete own property documents" on public.property_documents;

create policy "Users can view own property documents"
  on public.property_documents for select using (auth.uid() = user_id);
create policy "Users can insert own property documents"
  on public.property_documents for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own property documents"
  on public.property_documents for update using (auth.uid() = user_id);
create policy "Users can delete own property documents"
  on public.property_documents for delete using (auth.uid() = user_id);

-- ============================================================
-- Storage RLS — user-folder gated: {user_id}/...  →  foldername[1] = auth.uid()
-- ============================================================

-- system-documents
drop policy if exists "Users can upload own system documents" on storage.objects;
drop policy if exists "Users can view own system documents"   on storage.objects;
drop policy if exists "Users can update own system documents" on storage.objects;
drop policy if exists "Users can delete own system documents" on storage.objects;

create policy "Users can upload own system documents"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'system-documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users can view own system documents"
  on storage.objects for select to authenticated
  using (bucket_id = 'system-documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users can update own system documents"
  on storage.objects for update to authenticated
  using (bucket_id = 'system-documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users can delete own system documents"
  on storage.objects for delete to authenticated
  using (bucket_id = 'system-documents' and (storage.foldername(name))[1] = auth.uid()::text);

-- property-documents
drop policy if exists "Users can upload own property documents"         on storage.objects;
drop policy if exists "Users can view own property documents storage"   on storage.objects;
drop policy if exists "Users can update own property documents storage" on storage.objects;
drop policy if exists "Users can delete own property documents storage" on storage.objects;

create policy "Users can upload own property documents"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'property-documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users can view own property documents storage"
  on storage.objects for select to authenticated
  using (bucket_id = 'property-documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users can update own property documents storage"
  on storage.objects for update to authenticated
  using (bucket_id = 'property-documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users can delete own property documents storage"
  on storage.objects for delete to authenticated
  using (bucket_id = 'property-documents' and (storage.foldername(name))[1] = auth.uid()::text);

-- project-photos (broad authenticated read, owner-folder write/delete)
drop policy if exists "Auth users can read project photos"            on storage.objects;
drop policy if exists "Users can upload project photos to their folder" on storage.objects;
drop policy if exists "Users can delete their own project photos"      on storage.objects;

create policy "Auth users can read project photos"
  on storage.objects for select to authenticated
  using (bucket_id = 'project-photos');
create policy "Users can upload project photos to their folder"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'project-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users can delete their own project photos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'project-photos' and (storage.foldername(name))[1] = auth.uid()::text);
