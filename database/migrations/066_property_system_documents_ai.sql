-- Real document AI for system documents:
--   extracted_text — the model's structured extraction of the document's key content,
--                    reused as context by the "Ask AI" chat (avoids re-reading the file).
--   ai_error       — records the last analysis failure so the UI can surface it.

alter table public.property_system_documents
  add column if not exists extracted_text text,
  add column if not exists ai_error text;
