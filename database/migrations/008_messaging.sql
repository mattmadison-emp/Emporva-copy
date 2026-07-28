-- ============================================================
-- 008: Messaging System
-- Supports 1:1 and group conversations across all roles
-- (homeowner, contractor, multi-unit), with file attachments
-- ============================================================

-- ============================================================
-- Conversations
-- ============================================================
create table public.conversations (
  id uuid not null default gen_random_uuid(),
  title text,
  type text not null default 'direct' check (type in ('direct', 'group')),
  job_id uuid references public.jobs(id) on delete set null,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint conversations_pkey primary key (id)
);

create trigger conversations_updated_at
  before update on public.conversations
  for each row execute function public.update_updated_at();

-- ============================================================
-- Conversation Participants
-- Tracks membership and per-user read position
-- ============================================================
create table public.conversation_participants (
  id uuid not null default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('member', 'admin')),
  joined_at timestamptz not null default now(),
  last_read_at timestamptz not null default now(),
  constraint conversation_participants_pkey primary key (id),
  constraint conversation_participants_unique unique (conversation_id, user_id)
);

-- ============================================================
-- Messages
-- ============================================================
create table public.messages (
  id uuid not null default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text,
  message_type text not null default 'text' check (message_type in ('text', 'image', 'file', 'system')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint messages_pkey primary key (id)
);

create trigger messages_updated_at
  before update on public.messages
  for each row execute function public.update_updated_at();

-- ============================================================
-- Message Attachments
-- ============================================================
create table public.message_attachments (
  id uuid not null default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  file_url text not null,
  file_name text not null,
  file_type text not null,
  file_size bigint not null,
  created_at timestamptz not null default now(),
  constraint message_attachments_pkey primary key (id)
);

-- ============================================================
-- Helper: check if current user is a conversation participant
-- Used by RLS policies across all messaging tables
-- (created after tables so conversation_participants exists)
-- ============================================================
create or replace function public.is_conversation_participant(conv_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.conversation_participants
    where conversation_id = conv_id
      and user_id = auth.uid()
  );
$$ language sql security definer stable;

-- ============================================================
-- Indexes
-- ============================================================

-- Which conversations is this user in?
create index conversation_participants_user_idx
  on public.conversation_participants (user_id);

-- Who is in this conversation?
create index conversation_participants_conversation_idx
  on public.conversation_participants (conversation_id);

-- Message timeline within a conversation
create index messages_conversation_created_idx
  on public.messages (conversation_id, created_at desc);

-- Sender lookup
create index messages_sender_idx
  on public.messages (sender_id);

-- Attachments by message
create index message_attachments_message_idx
  on public.message_attachments (message_id);

-- Conversations linked to a job (partial — most conversations won't have one)
create index conversations_job_idx
  on public.conversations (job_id)
  where job_id is not null;

-- ============================================================
-- Row Level Security
-- ============================================================

-- Conversations
alter table public.conversations enable row level security;

create policy "Participants can view conversations"
  on public.conversations for select
  using (public.is_conversation_participant(id));

create policy "Authenticated users can create conversations"
  on public.conversations for insert
  to authenticated
  with check (auth.uid() = created_by);

create policy "Conversation creator can update"
  on public.conversations for update
  using (auth.uid() = created_by);

-- Conversation participants
alter table public.conversation_participants enable row level security;

create policy "Participants can view conversation members"
  on public.conversation_participants for select
  using (public.is_conversation_participant(conversation_id));

create policy "Conversation creator can add participants"
  on public.conversation_participants for insert
  to authenticated
  with check (
    exists (
      select 1 from public.conversations
      where id = conversation_id
        and created_by = auth.uid()
    )
    or user_id = auth.uid()
  );

create policy "Participants can update own read status"
  on public.conversation_participants for update
  using (auth.uid() = user_id);

create policy "Participants can leave conversations"
  on public.conversation_participants for delete
  using (auth.uid() = user_id);

-- Messages
alter table public.messages enable row level security;

create policy "Participants can view messages"
  on public.messages for select
  using (public.is_conversation_participant(conversation_id));

create policy "Participants can send messages"
  on public.messages for insert
  to authenticated
  with check (
    auth.uid() = sender_id
    and public.is_conversation_participant(conversation_id)
  );

create policy "Senders can update own messages"
  on public.messages for update
  using (auth.uid() = sender_id);

create policy "Senders can delete own messages"
  on public.messages for delete
  using (auth.uid() = sender_id);

-- Message attachments
alter table public.message_attachments enable row level security;

create policy "Participants can view attachments"
  on public.message_attachments for select
  using (
    exists (
      select 1 from public.messages m
      where m.id = message_id
        and public.is_conversation_participant(m.conversation_id)
    )
  );

create policy "Message sender can add attachments"
  on public.message_attachments for insert
  to authenticated
  with check (
    exists (
      select 1 from public.messages m
      where m.id = message_id
        and m.sender_id = auth.uid()
    )
  );

-- ============================================================
-- Storage bucket for message attachments
-- Folder structure: {conversation_id}/{filename}
-- ============================================================
insert into storage.buckets (id, name, public)
values ('message-attachments', 'message-attachments', false)
on conflict (id) do nothing;

create policy "Participants can upload message attachments"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'message-attachments'
    and public.is_conversation_participant(
      (storage.foldername(name))[1]::uuid
    )
  );

create policy "Participants can view message attachments"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'message-attachments'
    and public.is_conversation_participant(
      (storage.foldername(name))[1]::uuid
    )
  );

create policy "Users can delete own message attachments"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'message-attachments'
    and (owner::uuid) = auth.uid()
  );

-- ============================================================
-- Enable Supabase Realtime for live messaging
-- ============================================================
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.conversation_participants;
