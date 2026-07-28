-- Migration: Contractor Automations
-- Tables for workflow automation and execution tracking

-- Contractor automation workflows
CREATE TABLE public.contractor_automations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'general' CHECK (category = ANY (ARRAY['follow-up'::text, 'nurture'::text, 'maintenance'::text, 'referral'::text, 'general'::text])),
  trigger_type text NOT NULL,
  trigger_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  enabled boolean NOT NULL DEFAULT true,
  times_triggered integer NOT NULL DEFAULT 0,
  last_triggered timestamp with time zone,
  success_rate numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT contractor_automations_pkey PRIMARY KEY (id),
  CONSTRAINT contractor_automations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);

CREATE INDEX idx_contractor_automations_user_id ON public.contractor_automations(user_id);

-- Automation execution logs
CREATE TABLE public.automation_execution_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  automation_id uuid NOT NULL,
  user_id uuid NOT NULL,
  contact_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status = ANY (ARRAY['success'::text, 'failed'::text, 'skipped'::text, 'pending'::text])),
  triggered_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone,
  steps_completed integer NOT NULL DEFAULT 0,
  total_steps integer NOT NULL DEFAULT 0,
  details text NOT NULL DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT automation_execution_logs_pkey PRIMARY KEY (id),
  CONSTRAINT automation_execution_logs_automation_id_fkey FOREIGN KEY (automation_id) REFERENCES public.contractor_automations(id) ON DELETE CASCADE,
  CONSTRAINT automation_execution_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);

CREATE INDEX idx_automation_execution_logs_automation_id ON public.automation_execution_logs(automation_id);
CREATE INDEX idx_automation_execution_logs_user_id ON public.automation_execution_logs(user_id);

-- RLS
ALTER TABLE public.contractor_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_execution_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own automations" ON public.contractor_automations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own execution logs" ON public.automation_execution_logs FOR ALL USING (auth.uid() = user_id);
