-- Migration: Renovation Scenarios
-- Stores AI-generated renovation visualization scenarios

CREATE TABLE public.renovation_scenarios (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  job_id uuid NOT NULL,
  source_photo_url text NOT NULL DEFAULT '',
  name text NOT NULL,
  style_description text NOT NULL DEFAULT '',
  generated_image_url text NOT NULL DEFAULT '',
  estimated_cost_low numeric(12,2),
  estimated_cost_high numeric(12,2),
  estimated_timeline text NOT NULL DEFAULT '',
  roi_estimate text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status = ANY (ARRAY['pending'::text, 'generating'::text, 'completed'::text, 'failed'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT renovation_scenarios_pkey PRIMARY KEY (id),
  CONSTRAINT renovation_scenarios_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT renovation_scenarios_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE
);

CREATE INDEX idx_renovation_scenarios_user_id ON public.renovation_scenarios(user_id);
CREATE INDEX idx_renovation_scenarios_job_id ON public.renovation_scenarios(job_id);

ALTER TABLE public.renovation_scenarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own renovation scenarios" ON public.renovation_scenarios FOR ALL USING (auth.uid() = user_id);
