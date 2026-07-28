-- Migration: Lead Import
-- Tables for email integration and lead processing

CREATE TABLE public.connected_email_accounts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email text NOT NULL,
  provider text NOT NULL CHECK (provider = ANY (ARRAY['gmail'::text, 'outlook'::text, 'yahoo'::text, 'imap'::text])),
  status text NOT NULL DEFAULT 'connected' CHECK (status = ANY (ARRAY['connected'::text, 'syncing'::text, 'error'::text, 'disconnected'::text])),
  last_sync timestamp with time zone,
  leads_imported integer NOT NULL DEFAULT 0,
  unread_leads integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT connected_email_accounts_pkey PRIMARY KEY (id),
  CONSTRAINT connected_email_accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);

CREATE INDEX idx_connected_email_accounts_user_id ON public.connected_email_accounts(user_id);

CREATE TABLE public.email_leads (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  account_id uuid NOT NULL,
  subject text NOT NULL DEFAULT '',
  from_name text NOT NULL DEFAULT '',
  from_email text NOT NULL DEFAULT '',
  received_at timestamp with time zone NOT NULL DEFAULT now(),
  snippet text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'new' CHECK (status = ANY (ARRAY['new'::text, 'processing'::text, 'processed'::text, 'review'::text, 'rejected'::text])),
  confidence integer NOT NULL DEFAULT 0,
  extracted_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  labels jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT email_leads_pkey PRIMARY KEY (id),
  CONSTRAINT email_leads_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT email_leads_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.connected_email_accounts(id) ON DELETE CASCADE
);

CREATE INDEX idx_email_leads_user_id ON public.email_leads(user_id);
CREATE INDEX idx_email_leads_account_id ON public.email_leads(account_id);

CREATE TABLE public.lead_filter_rules (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  condition jsonb NOT NULL DEFAULT '{}'::jsonb,
  action text NOT NULL DEFAULT 'flag',
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT lead_filter_rules_pkey PRIMARY KEY (id),
  CONSTRAINT lead_filter_rules_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);

CREATE INDEX idx_lead_filter_rules_user_id ON public.lead_filter_rules(user_id);

-- RLS
ALTER TABLE public.connected_email_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_filter_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own email accounts" ON public.connected_email_accounts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own email leads" ON public.email_leads FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own filter rules" ON public.lead_filter_rules FOR ALL USING (auth.uid() = user_id);
