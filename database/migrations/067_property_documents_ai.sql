-- Real document AI for property (vault) documents — mirrors what 044/066 give
-- property_system_documents, so Smart Intake can store its reading of a vault
-- doc at filing time:
--   ai_processed   — whether the AI has read this document.
--   ai_insights    — 3-6 short takeaway bullets shown in the vault UI.
--   extracted_text — the model's digest of the document's key content.
--   ai_error       — records the last analysis failure so the UI can surface it.

alter table public.property_documents
  add column if not exists ai_processed boolean not null default false,
  add column if not exists ai_insights jsonb not null default '[]'::jsonb,
  add column if not exists extracted_text text,
  add column if not exists ai_error text;
