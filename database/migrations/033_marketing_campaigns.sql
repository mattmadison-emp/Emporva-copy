-- Migration: Marketing Campaigns
-- Tables for campaign management and recipient tracking

CREATE TABLE public.marketing_campaigns (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'post-job' CHECK (type = ANY (ARRAY['post-job'::text, 'seasonal'::text, 'maintenance'::text, 'referral'::text])),
  status text NOT NULL DEFAULT 'draft' CHECK (status = ANY (ARRAY['draft'::text, 'active'::text, 'paused'::text, 'completed'::text])),
  channel text NOT NULL DEFAULT 'email' CHECK (channel = ANY (ARRAY['email'::text, 'sms'::text, 'both'::text])),
  subject text NOT NULL DEFAULT '',
  preview_text text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  total_sent integer NOT NULL DEFAULT 0,
  total_opened integer NOT NULL DEFAULT 0,
  total_clicked integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  last_sent_at timestamp with time zone,
  next_send_at timestamp with time zone,
  CONSTRAINT marketing_campaigns_pkey PRIMARY KEY (id),
  CONSTRAINT marketing_campaigns_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);

CREATE INDEX idx_marketing_campaigns_user_id ON public.marketing_campaigns(user_id);

CREATE TABLE public.campaign_recipients (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL,
  user_id uuid NOT NULL,
  contact_id uuid,
  name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status = ANY (ARRAY['pending'::text, 'delivered'::text, 'opened'::text, 'clicked'::text, 'bounced'::text, 'unsubscribed'::text])),
  sent_at timestamp with time zone,
  opened_at timestamp with time zone,
  clicked_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT campaign_recipients_pkey PRIMARY KEY (id),
  CONSTRAINT campaign_recipients_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.marketing_campaigns(id) ON DELETE CASCADE,
  CONSTRAINT campaign_recipients_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT campaign_recipients_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.contractor_contacts(id)
);

CREATE INDEX idx_campaign_recipients_campaign_id ON public.campaign_recipients(campaign_id);

-- RLS
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_recipients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own campaigns" ON public.marketing_campaigns FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own campaign recipients" ON public.campaign_recipients FOR ALL USING (auth.uid() = user_id);
