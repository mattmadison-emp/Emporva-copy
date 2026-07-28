-- Migration: Social Content
-- Table for AI-generated social media content management

CREATE TABLE public.social_content (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  job_id uuid,
  source_job_title text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'completed-job' CHECK (type = ANY (ARRAY['before-after'::text, 'completed-job'::text, 'tip'::text, 'testimonial'::text, 'milestone'::text, 'seasonal'::text])),
  platform text NOT NULL DEFAULT 'instagram' CHECK (platform = ANY (ARRAY['instagram'::text, 'facebook'::text, 'linkedin'::text, 'nextdoor'::text, 'tiktok'::text])),
  caption text NOT NULL DEFAULT '',
  hashtags jsonb NOT NULL DEFAULT '[]'::jsonb,
  image_url text NOT NULL DEFAULT '',
  secondary_image_url text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'ready' CHECK (status = ANY (ARRAY['draft'::text, 'ready'::text, 'scheduled'::text, 'posted'::text])),
  scheduled_date timestamp with time zone,
  engagement_tip text NOT NULL DEFAULT '',
  best_time_to_post text NOT NULL DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT social_content_pkey PRIMARY KEY (id),
  CONSTRAINT social_content_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT social_content_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id)
);

CREATE INDEX idx_social_content_user_id ON public.social_content(user_id);
CREATE INDEX idx_social_content_job_id ON public.social_content(job_id);

-- RLS
ALTER TABLE public.social_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own social content" ON public.social_content FOR ALL USING (auth.uid() = user_id);
