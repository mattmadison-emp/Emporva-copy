-- Migration: Team Members
-- Tables for contractor team management and job assignments

CREATE TABLE public.team_members (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  role text NOT NULL DEFAULT '',
  color text NOT NULL DEFAULT 'bg-blue-500',
  hourly_rate numeric NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT team_members_pkey PRIMARY KEY (id),
  CONSTRAINT team_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);

CREATE INDEX idx_team_members_user_id ON public.team_members(user_id);

-- Job team assignments (which team members are assigned to which scheduled jobs)
CREATE TABLE public.job_team_assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  work_item_id uuid NOT NULL,
  team_member_id uuid NOT NULL,
  assigned_date date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT job_team_assignments_pkey PRIMARY KEY (id),
  CONSTRAINT job_team_assignments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT job_team_assignments_work_item_id_fkey FOREIGN KEY (work_item_id) REFERENCES public.work_items(id) ON DELETE CASCADE,
  CONSTRAINT job_team_assignments_team_member_id_fkey FOREIGN KEY (team_member_id) REFERENCES public.team_members(id) ON DELETE CASCADE
);

CREATE INDEX idx_job_team_assignments_user_id ON public.job_team_assignments(user_id);
CREATE INDEX idx_job_team_assignments_work_item_id ON public.job_team_assignments(work_item_id);
CREATE INDEX idx_job_team_assignments_team_member_id ON public.job_team_assignments(team_member_id);

-- RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_team_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own team members" ON public.team_members FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own team assignments" ON public.job_team_assignments FOR ALL USING (auth.uid() = user_id);
