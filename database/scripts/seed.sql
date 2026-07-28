-- ============================================================
-- EMPORVA SEED SCRIPT
-- ============================================================
-- Run this in the Supabase SQL Editor.
-- Creates demo users, properties, projects, work items,
-- milestones, approvals, payments, messages, and more.
--
-- Accounts:
--   Homeowners:  user1@emporva.com / emporva123
--                user2@emporva.com / emporva123
--   Contractors: contractor1@emporva.com / emporva123
--                contractor2@emporva.com / emporva123
--                contractor3@emporva.com / emporva123
--                contractor4@emporva.com / emporva123
-- ============================================================

-- Clean up any previous seed data (order matters due to FKs)
DO $$
DECLARE
  _emails text[] := ARRAY[
    'user1@emporva.com','user2@emporva.com',
    'contractor1@emporva.com','contractor2@emporva.com',
    'contractor3@emporva.com','contractor4@emporva.com'
  ];
  _uid uuid;
BEGIN
  FOR i IN 1..array_length(_emails, 1) LOOP
    SELECT id INTO _uid FROM auth.users WHERE email = _emails[i];
    IF _uid IS NOT NULL THEN
      -- Delete in dependency order
      DELETE FROM public.project_photos WHERE job_id IN (SELECT id FROM public.jobs WHERE user_id = _uid);
      DELETE FROM public.project_qa_threads WHERE job_id IN (SELECT id FROM public.jobs WHERE user_id = _uid);
      DELETE FROM public.project_approvals WHERE job_id IN (SELECT id FROM public.jobs WHERE user_id = _uid);
      DELETE FROM public.project_milestones WHERE job_id IN (SELECT id FROM public.jobs WHERE user_id = _uid);
      DELETE FROM public.project_documents WHERE job_id IN (SELECT id FROM public.jobs WHERE user_id = _uid);
      DELETE FROM public.payments WHERE job_id IN (SELECT id FROM public.jobs WHERE user_id = _uid);
      DELETE FROM public.job_team_assignments WHERE user_id = _uid;
      DELETE FROM public.work_items WHERE job_id IN (SELECT id FROM public.jobs WHERE user_id = _uid);
      DELETE FROM public.jobs WHERE user_id = _uid;
      DELETE FROM public.property_valuations WHERE user_id = _uid;
      DELETE FROM public.property_value_history WHERE user_id = _uid;
      DELETE FROM public.property_improvements WHERE user_id = _uid;
      DELETE FROM public.property_maintenance_logs WHERE user_id = _uid;
      DELETE FROM public.seasonal_task_completions WHERE user_id = _uid;
      DELETE FROM public.homeowner_tasks WHERE user_id = _uid;
      DELETE FROM public.properties WHERE user_id = _uid;
      DELETE FROM public.reviews WHERE reviewer_id = _uid;
      DELETE FROM public.credit_transactions WHERE user_id = _uid;
      DELETE FROM public.contractor_credentials WHERE user_id = _uid;
      DELETE FROM public.conversation_participants WHERE user_id = _uid;
      DELETE FROM public.team_members WHERE user_id = _uid;
      DELETE FROM public.contractor_contacts WHERE user_id = _uid;

      -- Delete messages in conversations this user is part of
      DELETE FROM public.messages WHERE conversation_id IN (
        SELECT conversation_id FROM public.conversation_participants WHERE user_id = _uid
      );
      DELETE FROM public.conversations WHERE id IN (
        SELECT conversation_id FROM public.conversation_participants WHERE user_id = _uid
      );

      -- Delete contractor stuff where they're referenced
      DELETE FROM public.reviews WHERE contractor_profile_id IN (SELECT id FROM public.contractor_profiles WHERE user_id = _uid);
      DELETE FROM public.work_items WHERE contractor_id = _uid;
      DELETE FROM public.contractor_profiles WHERE user_id = _uid;
      DELETE FROM public.homeowner_profiles WHERE user_id = _uid;
      DELETE FROM public.activity_log WHERE user_id = _uid;
      DELETE FROM public.user_settings WHERE user_id = _uid;
      DELETE FROM public.profiles WHERE id = _uid;
      DELETE FROM auth.refresh_tokens WHERE session_id IN (SELECT id FROM auth.sessions WHERE user_id = _uid);
      DELETE FROM auth.mfa_factors WHERE user_id = _uid;
      DELETE FROM auth.sessions WHERE user_id = _uid;
      DELETE FROM auth.identities WHERE user_id = _uid;
      DELETE FROM auth.users WHERE id = _uid;
    END IF;
  END LOOP;
END $$;


-- ============================================================
-- 1. CREATE AUTH USERS
-- ============================================================
-- Supabase stores passwords as crypt(password, gen_salt('bf'))
-- We insert directly into auth.users for seeding purposes.

INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  confirmation_token, raw_app_meta_data, raw_user_meta_data
) VALUES
-- Homeowners
(
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'user1@emporva.com',
  crypt('emporva123', gen_salt('bf')),
  now(), now(), now(), '',
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb
),
(
  '22222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'user2@emporva.com',
  crypt('emporva123', gen_salt('bf')),
  now(), now(), now(), '',
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb
),
-- Contractors
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'contractor1@emporva.com',
  crypt('emporva123', gen_salt('bf')),
  now(), now(), now(), '',
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb
),
(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'contractor2@emporva.com',
  crypt('emporva123', gen_salt('bf')),
  now(), now(), now(), '',
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb
),
(
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'contractor3@emporva.com',
  crypt('emporva123', gen_salt('bf')),
  now(), now(), now(), '',
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb
),
(
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'contractor4@emporva.com',
  crypt('emporva123', gen_salt('bf')),
  now(), now(), now(), '',
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb
);

-- Also insert identities for email login
INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'user1@emporva.com', '{"sub":"11111111-1111-1111-1111-111111111111","email":"user1@emporva.com"}'::jsonb, 'email', now(), now(), now()),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'user2@emporva.com', '{"sub":"22222222-2222-2222-2222-222222222222","email":"user2@emporva.com"}'::jsonb, 'email', now(), now(), now()),
  (gen_random_uuid(), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'contractor1@emporva.com', '{"sub":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa","email":"contractor1@emporva.com"}'::jsonb, 'email', now(), now(), now()),
  (gen_random_uuid(), 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'contractor2@emporva.com', '{"sub":"bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb","email":"contractor2@emporva.com"}'::jsonb, 'email', now(), now(), now()),
  (gen_random_uuid(), 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'contractor3@emporva.com', '{"sub":"cccccccc-cccc-cccc-cccc-cccccccccccc","email":"contractor3@emporva.com"}'::jsonb, 'email', now(), now(), now()),
  (gen_random_uuid(), 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'contractor4@emporva.com', '{"sub":"dddddddd-dddd-dddd-dddd-dddddddddddd","email":"contractor4@emporva.com"}'::jsonb, 'email', now(), now(), now());


-- ============================================================
-- 2. PROFILES
-- ============================================================
-- The on_auth_user_created trigger auto-creates profile rows
-- when we insert into auth.users. We UPDATE them with full data.

UPDATE public.profiles SET first_name = 'Sarah',  last_name = 'Mitchell', phone = '(512) 555-0101', role = 'homeowner',  preferred_contact = 'email', onboarding_completed = true, tier = 'premium' WHERE id = '11111111-1111-1111-1111-111111111111';
UPDATE public.profiles SET first_name = 'James',  last_name = 'Thornton', phone = '(512) 555-0102', role = 'homeowner',  preferred_contact = 'any',   onboarding_completed = true, tier = 'core'    WHERE id = '22222222-2222-2222-2222-222222222222';
UPDATE public.profiles SET first_name = 'Mike',   last_name = 'Torres',   phone = '(512) 555-1001', role = 'contractor', preferred_contact = 'phone', onboarding_completed = true, tier = 'premium' WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
UPDATE public.profiles SET first_name = 'Rachel', last_name = 'Kim',      phone = '(512) 555-1002', role = 'contractor', preferred_contact = 'email', onboarding_completed = true, tier = 'premium' WHERE id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
UPDATE public.profiles SET first_name = 'Carlos', last_name = 'Rivera',   phone = '(512) 555-1003', role = 'contractor', preferred_contact = 'any',   onboarding_completed = true, tier = 'core'    WHERE id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
UPDATE public.profiles SET first_name = 'Lisa',   last_name = 'Patel',    phone = '(512) 555-1004', role = 'contractor', preferred_contact = 'email', onboarding_completed = true, tier = 'premium' WHERE id = 'dddddddd-dddd-dddd-dddd-dddddddddddd';


-- ============================================================
-- 3. HOMEOWNER PROFILES + PROPERTIES
-- ============================================================
INSERT INTO public.homeowner_profiles (id, user_id) VALUES
  ('a0a01111-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111'),
  ('a0a01111-0001-0001-0001-000000000002', '22222222-2222-2222-2222-222222222222');

-- Sarah's property
INSERT INTO public.properties (id, user_id, homeowner_profile_id, address, property_type, year_built, square_footage, floors, hvac_type, hvac_age, water_heater_type, water_heater_age, roofing_type, roofing_age) VALUES
  ('00000001-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111', 'a0a01111-0001-0001-0001-000000000001', '142 Oak Lane, Austin, TX 78704', 'single-family', 2005, 2400, '2', 'central-ac', 8, 'tank', 6, 'asphalt-shingles', 12);

-- James's property
INSERT INTO public.properties (id, user_id, homeowner_profile_id, address, property_type, year_built, square_footage, floors, hvac_type, hvac_age, water_heater_type, water_heater_age, roofing_type, roofing_age) VALUES
  ('00000001-0001-0001-0001-000000000002', '22222222-2222-2222-2222-222222222222', 'a0a01111-0001-0001-0001-000000000002', '88 Elm Street, Round Rock, TX 78681', 'townhouse', 2012, 1800, '2', 'heat-pump', 4, 'tankless', 3, 'metal', 5);


-- ============================================================
-- 4. CONTRACTOR PROFILES
-- ============================================================
INSERT INTO public.contractor_profiles (id, user_id, business_name, company_type, primary_trade, secondary_trades, years_in_business, service_zips, travel_radius, emergency_available, licensing_status, insurance_status, selected_plan, credit_balance) VALUES
  -- Mike Torres: General Contractor / Carpentry
  ('cc000001-0001-0001-0001-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Torres Construction LLC', 'small-team', 'General Contractor', '{Carpentry,Drywall}', 15, '78704', '25', true, 'licensed', 'full-coverage', 'premium', 50),
  -- Rachel Kim: Plumbing
  ('cc000001-0001-0001-0001-000000000002', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Kim Plumbing & Drain', 'solo', 'Plumbing', '{}', 8, '78704', '50', true, 'licensed', 'general-liability', 'premium', 30),
  -- Carlos Rivera: Electrical
  ('cc000001-0001-0001-0001-000000000003', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Rivera Electric', 'small-team', 'Electrical', '{HVAC}', 12, '78681', '25', false, 'licensed', 'full-coverage', 'core', 15),
  -- Lisa Patel: HVAC / Roofing
  ('cc000001-0001-0001-0001-000000000004', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Patel Home Services', 'multi-crew', 'HVAC', '{Roofing,Painting}', 20, '78704', '100', true, 'licensed', 'full-coverage', 'premium', 75);


-- ============================================================
-- 5. TEAM MEMBERS (for contractors)
-- ============================================================
INSERT INTO public.team_members (id, user_id, name, role, color, hourly_rate) VALUES
  -- Mike Torres's team
  ('00e00001-0001-0001-0001-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Jake Williams', 'Framing Lead', 'bg-blue-500', 55),
  ('00e00001-0001-0001-0001-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Dan Murphy', 'Finish Carpenter', 'bg-amber-500', 48),
  ('00e00001-0001-0001-0001-000000000003', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Sam Ortiz', 'Apprentice', 'bg-violet-500', 28),
  -- Lisa Patel's team
  ('00e00001-0001-0001-0001-000000000004', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Raj Mehta', 'HVAC Tech', 'bg-emerald-500', 52),
  ('00e00001-0001-0001-0001-000000000005', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Tomoko Sato', 'Roofer', 'bg-rose-500', 45);


-- ============================================================
-- 6. SARAH'S PROJECTS (user1 — the main demo user)
-- ============================================================

-- PROJECT 1: Kitchen Renovation (in-progress, 60%)
INSERT INTO public.jobs (id, user_id, homeowner_profile_id, title, category, description, location, budget_range, timeline, status, is_project, estimated_budget, actual_spend, progress, start_date, estimated_completion, quotes_received) VALUES
  ('00b00001-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111', 'a0a01111-0001-0001-0001-000000000001',
   'Kitchen Renovation', 'General Contractor',
   'Full kitchen remodel including new cabinets, countertops, backsplash, plumbing fixtures, and electrical upgrades. Opening wall between kitchen and dining room.',
   '142 Oak Lane, Austin, TX 78704', '$25,000 - $40,000', '6-8 weeks', 'in-progress',
   true, 35000, 18500, 60,
   CURRENT_DATE - INTERVAL '28 days', CURRENT_DATE + INTERVAL '21 days', 3);

-- Work items for Kitchen Renovation
INSERT INTO public.work_items (id, job_id, contractor_id, title, description, trade, status, estimated_budget, agreed_price, start_date, end_date) VALUES
  -- General contractor (Mike Torres) — framing & cabinets
  ('00c00001-0001-0001-0001-000000000001', '00b00001-0001-0001-0001-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'Demo & Framing', 'Remove existing cabinets, tear out wall between kitchen and dining, reframe opening with beam', 'General Contractor',
   'completed', '$8,000 - $10,000', 9500,
   CURRENT_DATE - INTERVAL '28 days', CURRENT_DATE - INTERVAL '18 days'),
  -- General contractor — cabinet install
  ('00c00001-0001-0001-0001-000000000002', '00b00001-0001-0001-0001-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'Cabinet & Countertop Install', 'Install custom shaker cabinets and quartz countertops', 'Carpentry',
   'in-progress', '$12,000 - $15,000', 14000,
   CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE + INTERVAL '7 days'),
  -- Plumber (Rachel Kim) — kitchen plumbing
  ('00c00001-0001-0001-0001-000000000003', '00b00001-0001-0001-0001-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   'Kitchen Plumbing Rough-In & Fixtures', 'Relocate sink plumbing, install new disposal, connect dishwasher', 'Plumbing',
   'completed', '$3,000 - $4,000', 3800,
   CURRENT_DATE - INTERVAL '20 days', CURRENT_DATE - INTERVAL '14 days'),
  -- Electrician (Carlos Rivera) — kitchen electrical
  ('00c00001-0001-0001-0001-000000000004', '00b00001-0001-0001-0001-000000000001', 'cccccccc-cccc-cccc-cccc-cccccccccccc',
   'Electrical Upgrades', 'Add under-cabinet lighting, new outlets, upgrade to 20-amp kitchen circuit', 'Electrical',
   'assigned', '$2,500 - $3,500', 3200,
   CURRENT_DATE + INTERVAL '3 days', CURRENT_DATE + INTERVAL '10 days');

-- Milestones for Kitchen Renovation
INSERT INTO public.project_milestones (id, job_id, title, description, status, due_date, completed_at, sort_order) VALUES
  ('00d00001-0001-0001-0001-000000000001', '00b00001-0001-0001-0001-000000000001', 'Demolition Complete', 'Existing kitchen gutted, wall removed, structural beam installed', 'completed', CURRENT_DATE - INTERVAL '22 days', (CURRENT_DATE - INTERVAL '23 days')::timestamptz, 1),
  ('00d00001-0001-0001-0001-000000000002', '00b00001-0001-0001-0001-000000000001', 'Plumbing & Electrical Rough-In', 'All rough plumbing and wiring in place before drywall', 'completed', CURRENT_DATE - INTERVAL '14 days', (CURRENT_DATE - INTERVAL '15 days')::timestamptz, 2),
  ('00d00001-0001-0001-0001-000000000003', '00b00001-0001-0001-0001-000000000001', 'Drywall & Paint', 'Patch drywall, texture, and paint kitchen walls', 'completed', CURRENT_DATE - INTERVAL '8 days', (CURRENT_DATE - INTERVAL '9 days')::timestamptz, 3),
  ('00d00001-0001-0001-0001-000000000004', '00b00001-0001-0001-0001-000000000001', 'Cabinet Installation', 'All cabinets mounted, aligned, and hardware installed', 'in-progress', CURRENT_DATE + INTERVAL '3 days', NULL, 4),
  ('00d00001-0001-0001-0001-000000000005', '00b00001-0001-0001-0001-000000000001', 'Countertop & Backsplash', 'Quartz countertops templated, fabricated, and installed', 'pending', CURRENT_DATE + INTERVAL '10 days', NULL, 5),
  ('00d00001-0001-0001-0001-000000000006', '00b00001-0001-0001-0001-000000000001', 'Final Fixtures & Punch List', 'Sink, faucet, disposal, final electrical trim, cleanup', 'pending', CURRENT_DATE + INTERVAL '18 days', NULL, 6);

-- Approvals for Kitchen Renovation
INSERT INTO public.project_approvals (id, job_id, submitted_by, type, title, description, amount, status, reviewed_by, reviewed_at, review_note) VALUES
  ('a0000001-0001-0001-0001-000000000001', '00b00001-0001-0001-0001-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'estimate', 'Initial Project Estimate', 'Full kitchen renovation scope and pricing', 35000, 'approved', '11111111-1111-1111-1111-111111111111', CURRENT_DATE - INTERVAL '30 days', 'Approved — lets get started!'),
  ('a0000001-0001-0001-0001-000000000002', '00b00001-0001-0001-0001-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'change_order', 'Upgrade to Soft-Close Hinges', 'Upgrade all cabinet hinges to soft-close — adds to material cost', 450, 'approved', '11111111-1111-1111-1111-111111111111', CURRENT_DATE - INTERVAL '5 days', 'Yes, worth it'),
  ('a0000001-0001-0001-0001-000000000003', '00b00001-0001-0001-0001-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'milestone', 'Countertop Deposit', 'Quartz fabricator requires 50% deposit to begin templating', 3200, 'pending', NULL, NULL, NULL);

-- Q&A for Kitchen Renovation
INSERT INTO public.project_qa_threads (id, job_id, question, category, asked_by, response, responded_by, responded_at, status) VALUES
  ('0a000001-0001-0001-0001-000000000001', '00b00001-0001-0001-0001-000000000001', 'Will the new layout accommodate a 36" range or do we need to stick with 30"?', 'scope', '11111111-1111-1111-1111-111111111111', 'Great news — with the wall removed, we have room for a 36" range. I''ll update the cabinet plan to accommodate it.', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', (CURRENT_DATE - INTERVAL '12 days')::timestamptz, 'answered'),
  ('0a000001-0001-0001-0001-000000000002', '00b00001-0001-0001-0001-000000000001', 'What backsplash material do you recommend for the quartz counters?', 'materials', '11111111-1111-1111-1111-111111111111', NULL, NULL, NULL, 'pending');

-- Payments for Kitchen Renovation
INSERT INTO public.payments (id, job_id, work_item_id, payer_id, payee_id, amount, description, payment_type, payment_method, status) VALUES
  ('0ae00001-0001-0001-0001-000000000001', '00b00001-0001-0001-0001-000000000001', '00c00001-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 5000, 'Kitchen demo & framing deposit', 'deposit', 'card', 'completed'),
  ('0ae00001-0001-0001-0001-000000000002', '00b00001-0001-0001-0001-000000000001', '00c00001-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 4500, 'Kitchen demo & framing — final', 'final', 'card', 'completed'),
  ('0ae00001-0001-0001-0001-000000000003', '00b00001-0001-0001-0001-000000000001', '00c00001-0001-0001-0001-000000000003', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 3800, 'Kitchen plumbing — full payment', 'full', 'bank_transfer', 'completed'),
  ('0ae00001-0001-0001-0001-000000000004', '00b00001-0001-0001-0001-000000000001', '00c00001-0001-0001-0001-000000000002', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 7000, 'Cabinet install — 50% deposit', 'deposit', 'card', 'completed');


-- PROJECT 2: Bathroom Remodel (earlier stage, 25%)
INSERT INTO public.jobs (id, user_id, homeowner_profile_id, title, category, description, location, budget_range, timeline, status, is_project, estimated_budget, actual_spend, progress, start_date, estimated_completion, quotes_received) VALUES
  ('00b00001-0001-0001-0001-000000000002', '11111111-1111-1111-1111-111111111111', 'a0a01111-0001-0001-0001-000000000001',
   'Master Bathroom Remodel', 'Plumbing',
   'Gut and rebuild master bathroom: new tile, walk-in shower conversion, double vanity, heated floors.',
   '142 Oak Lane, Austin, TX 78704', '$15,000 - $22,000', '4-6 weeks', 'in-progress',
   true, 18000, 4200, 25,
   CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '32 days', 2);

-- Work items for Bathroom Remodel
INSERT INTO public.work_items (id, job_id, contractor_id, title, description, trade, status, estimated_budget, agreed_price, start_date, end_date) VALUES
  -- Plumber (Rachel Kim) — bathroom plumbing
  ('00c00001-0001-0001-0001-000000000005', '00b00001-0001-0001-0001-000000000002', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   'Bathroom Plumbing', 'Move drain for walk-in shower, install double vanity plumbing, heated floor manifold', 'Plumbing',
   'in-progress', '$5,000 - $7,000', 6200,
   CURRENT_DATE - INTERVAL '8 days', CURRENT_DATE + INTERVAL '5 days'),
  -- General contractor (Mike Torres) — tile & finish
  ('00c00001-0001-0001-0001-000000000006', '00b00001-0001-0001-0001-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'Tile & Finish Work', 'Floor tile, shower tile, vanity install, trim', 'General Contractor',
   'open', '$8,000 - $11,000', NULL,
   NULL, NULL),
  -- Electrician (Carlos Rivera) — bathroom electrical
  ('00c00001-0001-0001-0001-000000000007', '00b00001-0001-0001-0001-000000000002', 'cccccccc-cccc-cccc-cccc-cccccccccccc',
   'Bathroom Electrical', 'GFCI outlets, exhaust fan upgrade, vanity lighting, heated floor thermostat', 'Electrical',
   'quoted', '$1,800 - $2,500', 2200,
   CURRENT_DATE + INTERVAL '5 days', CURRENT_DATE + INTERVAL '9 days');

-- Milestones for Bathroom Remodel
INSERT INTO public.project_milestones (id, job_id, title, description, status, due_date, completed_at, sort_order) VALUES
  ('00d00001-0001-0001-0001-000000000007', '00b00001-0001-0001-0001-000000000002', 'Demo & Gut', 'Strip bathroom to studs', 'completed', CURRENT_DATE - INTERVAL '6 days', (CURRENT_DATE - INTERVAL '7 days')::timestamptz, 1),
  ('00d00001-0001-0001-0001-000000000008', '00b00001-0001-0001-0001-000000000002', 'Plumbing Rough-In', 'Relocate shower drain, rough in double vanity supply lines', 'in-progress', CURRENT_DATE + INTERVAL '2 days', NULL, 2),
  ('00d00001-0001-0001-0001-000000000009', '00b00001-0001-0001-0001-000000000002', 'Waterproofing & Heated Floor', 'Kerdi membrane, heated floor mat, slope to drain', 'pending', CURRENT_DATE + INTERVAL '10 days', NULL, 3),
  ('00d00001-0001-0001-0001-000000000010', '00b00001-0001-0001-0001-000000000002', 'Tile Installation', 'Floor tile, shower walls, niche', 'pending', CURRENT_DATE + INTERVAL '18 days', NULL, 4),
  ('00d00001-0001-0001-0001-000000000011', '00b00001-0001-0001-0001-000000000002', 'Fixtures & Final', 'Vanity, mirror, accessories, final plumbing connections', 'pending', CURRENT_DATE + INTERVAL '28 days', NULL, 5);

-- Approvals for Bathroom Remodel
INSERT INTO public.project_approvals (id, job_id, submitted_by, type, title, description, amount, status) VALUES
  ('a0000001-0001-0001-0001-000000000004', '00b00001-0001-0001-0001-000000000002', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'estimate', 'Plumbing Scope & Estimate', 'Detailed plumbing work for bathroom remodel', 6200, 'approved'),
  ('a0000001-0001-0001-0001-000000000005', '00b00001-0001-0001-0001-000000000002', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'change_order', 'Upgrade to Rain Shower Head', 'Client requested 12" rain shower head with handheld — requires larger supply line', 380, 'pending');

-- Payments for Bathroom Remodel
INSERT INTO public.payments (id, job_id, work_item_id, payer_id, payee_id, amount, description, payment_type, payment_method, status) VALUES
  ('0ae00001-0001-0001-0001-000000000005', '00b00001-0001-0001-0001-000000000002', '00c00001-0001-0001-0001-000000000005', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 3100, 'Bathroom plumbing — 50% deposit', 'deposit', 'card', 'completed');


-- PROJECT 3: HVAC Replacement (almost done, 85%)
INSERT INTO public.jobs (id, user_id, homeowner_profile_id, title, category, description, location, budget_range, timeline, status, is_project, estimated_budget, actual_spend, progress, start_date, estimated_completion, quotes_received) VALUES
  ('00b00001-0001-0001-0001-000000000003', '11111111-1111-1111-1111-111111111111', 'a0a01111-0001-0001-0001-000000000001',
   'HVAC System Replacement', 'HVAC',
   'Replace 18-year-old central AC with high-efficiency heat pump system. Includes new ductwork in attic.',
   '142 Oak Lane, Austin, TX 78704', '$8,000 - $12,000', '3-5 days', 'in-progress',
   true, 10500, 8900, 85,
   CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '2 days', 2);

-- Work items for HVAC
INSERT INTO public.work_items (id, job_id, contractor_id, title, description, trade, status, estimated_budget, agreed_price, start_date, end_date) VALUES
  ('00c00001-0001-0001-0001-000000000008', '00b00001-0001-0001-0001-000000000003', 'dddddddd-dddd-dddd-dddd-dddddddddddd',
   'Heat Pump Installation', 'Remove old AC unit, install 3-ton heat pump, new refrigerant lines, thermostat', 'HVAC',
   'in-progress', '$8,000 - $10,000', 9200,
   CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '1 day'),
  ('00c00001-0001-0001-0001-000000000009', '00b00001-0001-0001-0001-000000000003', 'dddddddd-dddd-dddd-dddd-dddddddddddd',
   'Ductwork Replacement', 'Replace deteriorated flex duct in attic with rigid duct', 'HVAC',
   'completed', '$1,500 - $2,500', 1800,
   CURRENT_DATE - INTERVAL '4 days', CURRENT_DATE - INTERVAL '2 days');

-- Milestones for HVAC
INSERT INTO public.project_milestones (id, job_id, title, description, status, due_date, completed_at, sort_order) VALUES
  ('00d00001-0001-0001-0001-000000000012', '00b00001-0001-0001-0001-000000000003', 'Old System Removal', 'Disconnect and remove existing AC and air handler', 'completed', CURRENT_DATE - INTERVAL '4 days', (CURRENT_DATE - INTERVAL '4 days')::timestamptz, 1),
  ('00d00001-0001-0001-0001-000000000013', '00b00001-0001-0001-0001-000000000003', 'Ductwork Replacement', 'New rigid ductwork installed in attic', 'completed', CURRENT_DATE - INTERVAL '2 days', (CURRENT_DATE - INTERVAL '2 days')::timestamptz, 2),
  ('00d00001-0001-0001-0001-000000000014', '00b00001-0001-0001-0001-000000000003', 'Heat Pump Install & Commission', 'Mount outdoor unit, connect refrigerant lines, commission system', 'in-progress', CURRENT_DATE + INTERVAL '1 day', NULL, 3),
  ('00d00001-0001-0001-0001-000000000015', '00b00001-0001-0001-0001-000000000003', 'Final Inspection & Walkthrough', 'City inspection, thermostat setup, homeowner walkthrough', 'pending', CURRENT_DATE + INTERVAL '2 days', NULL, 4);

-- Payments for HVAC
INSERT INTO public.payments (id, job_id, work_item_id, payer_id, payee_id, amount, description, payment_type, payment_method, status) VALUES
  ('0ae00001-0001-0001-0001-000000000006', '00b00001-0001-0001-0001-000000000003', '00c00001-0001-0001-0001-000000000008', '11111111-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 4600, 'HVAC install — 50% deposit', 'deposit', 'card', 'completed'),
  ('0ae00001-0001-0001-0001-000000000007', '00b00001-0001-0001-0001-000000000003', '00c00001-0001-0001-0001-000000000009', '11111111-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 1800, 'Ductwork — full payment on completion', 'full', 'bank_transfer', 'completed'),
  ('0ae00001-0001-0001-0001-000000000008', '00b00001-0001-0001-0001-000000000003', '00c00001-0001-0001-0001-000000000008', '11111111-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 2500, 'HVAC install — milestone payment after ductwork', 'milestone', 'card', 'completed');


-- ============================================================
-- 7. JAMES'S PROJECT (user2 — secondary demo)
-- ============================================================

-- Deck & Patio (open, 0%)
INSERT INTO public.jobs (id, user_id, homeowner_profile_id, title, category, description, location, budget_range, timeline, status, is_project, estimated_budget, actual_spend, progress, start_date, estimated_completion, quotes_received) VALUES
  ('00b00001-0001-0001-0001-000000000004', '22222222-2222-2222-2222-222222222222', 'a0a01111-0001-0001-0001-000000000002',
   'Composite Deck & Patio', 'General Contractor',
   'Build 400 sq ft composite deck off the back of the house with integrated lighting and stair access to yard.',
   '88 Elm Street, Round Rock, TX 78681', '$12,000 - $18,000', '2-3 weeks', 'open',
   true, 15000, 0, 0,
   CURRENT_DATE + INTERVAL '14 days', CURRENT_DATE + INTERVAL '42 days', 1);

INSERT INTO public.work_items (id, job_id, contractor_id, title, description, trade, status, estimated_budget, agreed_price, start_date, end_date) VALUES
  ('00c00001-0001-0001-0001-000000000010', '00b00001-0001-0001-0001-000000000004', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'Deck Framing & Decking', 'Pressure-treated frame, composite decking, railing, stairs', 'General Contractor',
   'quoted', '$10,000 - $14,000', 12500,
   CURRENT_DATE + INTERVAL '14 days', CURRENT_DATE + INTERVAL '35 days'),
  ('00c00001-0001-0001-0001-000000000011', '00b00001-0001-0001-0001-000000000004', 'cccccccc-cccc-cccc-cccc-cccccccccccc',
   'Deck Lighting & Outlet', 'Low-voltage deck lighting, one GFCI outlet for grill', 'Electrical',
   'open', '$1,200 - $1,800', NULL, NULL, NULL);


-- ============================================================
-- 8. CONTRACTOR REVIEWS (so ratings show up)
-- ============================================================
INSERT INTO public.reviews (id, contractor_profile_id, reviewer_id, job_id, rating, comment, job_title, platform, sentiment, verified) VALUES
  (gen_random_uuid(), 'cc000001-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111', NULL, 5, 'Mike''s team did an incredible job with the kitchen demo. Clean, fast, and communicated every step.', 'Kitchen Demo & Framing', 'emporva', 'positive', true),
  (gen_random_uuid(), 'cc000001-0001-0001-0001-000000000002', '11111111-1111-1111-1111-111111111111', NULL, 5, 'Rachel is the best plumber we''ve ever worked with. Showed up early, explained everything, very fair pricing.', 'Kitchen Plumbing', 'emporva', 'positive', true),
  (gen_random_uuid(), 'cc000001-0001-0001-0001-000000000004', '11111111-1111-1111-1111-111111111111', NULL, 4, 'Lisa''s crew replaced our HVAC in record time. Minor delay on day 2 but they made up for it.', 'HVAC Replacement', 'emporva', 'positive', true),
  (gen_random_uuid(), 'cc000001-0001-0001-0001-000000000001', '22222222-2222-2222-2222-222222222222', NULL, 4, 'Got a quote for a deck project. Very detailed and professional. Looking forward to working together.', 'Deck Quote', 'emporva', 'positive', false);


-- ============================================================
-- 9. CONVERSATIONS (messaging between homeowner and contractors)
-- ============================================================
INSERT INTO public.conversations (id, title, type, job_id, created_by) VALUES
  ('c0e00001-0001-0001-0001-000000000001', 'Kitchen Renovation', 'direct', '00b00001-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111'),
  ('c0e00001-0001-0001-0001-000000000002', 'Bathroom Remodel', 'direct', '00b00001-0001-0001-0001-000000000002', '11111111-1111-1111-1111-111111111111'),
  ('c0e00001-0001-0001-0001-000000000003', 'HVAC Replacement', 'direct', '00b00001-0001-0001-0001-000000000003', '11111111-1111-1111-1111-111111111111');

INSERT INTO public.conversation_participants (conversation_id, user_id, role) VALUES
  ('c0e00001-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111', 'member'),
  ('c0e00001-0001-0001-0001-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'member'),
  ('c0e00001-0001-0001-0001-000000000002', '11111111-1111-1111-1111-111111111111', 'member'),
  ('c0e00001-0001-0001-0001-000000000002', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'member'),
  ('c0e00001-0001-0001-0001-000000000003', '11111111-1111-1111-1111-111111111111', 'member'),
  ('c0e00001-0001-0001-0001-000000000003', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'member');

INSERT INTO public.messages (conversation_id, sender_id, content, message_type) VALUES
  -- Kitchen conversation
  ('c0e00001-0001-0001-0001-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Hi Sarah! Demo is wrapping up today. The wall came down clean — no surprises behind it. I''ll send photos tonight.', 'text'),
  ('c0e00001-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111', 'That''s great news Mike! Can''t wait to see the open layout. Quick question — when will the cabinets arrive?', 'text'),
  ('c0e00001-0001-0001-0001-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Cabinets are scheduled for delivery this Thursday. We''ll start install on Friday morning. Everything is on track!', 'text'),
  -- Bathroom conversation
  ('c0e00001-0001-0001-0001-000000000002', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Sarah, I found some old galvanized pipes behind the shower wall. I recommend replacing them while we have access — it''ll save a lot of trouble down the road.', 'text'),
  ('c0e00001-0001-0001-0001-000000000002', '11111111-1111-1111-1111-111111111111', 'Good catch Rachel. How much would that add to the cost?', 'text'),
  ('c0e00001-0001-0001-0001-000000000002', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'About $380 for the pipe replacement and a rain shower head upgrade I think you''d love. I''ll submit a change order with details.', 'text'),
  -- HVAC conversation
  ('c0e00001-0001-0001-0001-000000000003', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Hi Sarah! Ductwork is done and the new heat pump is mounted. We''re connecting refrigerant lines tomorrow. Should be up and running by end of day.', 'text'),
  ('c0e00001-0001-0001-0001-000000000003', '11111111-1111-1111-1111-111111111111', 'Amazing progress Lisa! Will you handle scheduling the city inspection?', 'text'),
  ('c0e00001-0001-0001-0001-000000000003', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Absolutely — I already submitted the permit. Inspector should come out the day after we finish commissioning. I''ll keep you posted!', 'text');


-- ============================================================
-- 10. CREDIT TRANSACTIONS (contractor credits)
-- ============================================================
INSERT INTO public.credit_transactions (contractor_profile_id, user_id, type, credits, description) VALUES
  ('cc000001-0001-0001-0001-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'purchase', 50, 'Starter pack — 50 credits'),
  ('cc000001-0001-0001-0001-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'usage', -2, 'Unlocked lead: Kitchen Renovation'),
  ('cc000001-0001-0001-0001-000000000002', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'purchase', 25, 'Starter pack — 25 credits'),
  ('cc000001-0001-0001-0001-000000000003', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'purchase', 10, 'Starter pack — 10 credits'),
  ('cc000001-0001-0001-0001-000000000004', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'purchase', 50, 'Starter pack — 50 credits'),
  ('cc000001-0001-0001-0001-000000000004', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'bonus', 25, 'Referral bonus');


-- ============================================================
-- 11. TEAM MEMBER ASSIGNMENTS
-- ============================================================
INSERT INTO public.job_team_assignments (user_id, work_item_id, team_member_id, assigned_date) VALUES
  -- Mike's team on Kitchen Demo & Framing
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00c00001-0001-0001-0001-000000000001', '00e00001-0001-0001-0001-000000000001', CURRENT_DATE - INTERVAL '28 days'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00c00001-0001-0001-0001-000000000001', '00e00001-0001-0001-0001-000000000003', CURRENT_DATE - INTERVAL '28 days'),
  -- Mike's team on Cabinet Install
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00c00001-0001-0001-0001-000000000002', '00e00001-0001-0001-0001-000000000001', CURRENT_DATE - INTERVAL '7 days'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00c00001-0001-0001-0001-000000000002', '00e00001-0001-0001-0001-000000000002', CURRENT_DATE - INTERVAL '7 days'),
  -- Lisa's team on HVAC
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '00c00001-0001-0001-0001-000000000008', '00e00001-0001-0001-0001-000000000004', CURRENT_DATE - INTERVAL '5 days'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '00c00001-0001-0001-0001-000000000009', '00e00001-0001-0001-0001-000000000004', CURRENT_DATE - INTERVAL '4 days'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '00c00001-0001-0001-0001-000000000009', '00e00001-0001-0001-0001-000000000005', CURRENT_DATE - INTERVAL '4 days');


-- ============================================================
-- DONE
-- ============================================================
-- Log in as user1@emporva.com / emporva123 to see the homeowner
-- dashboard with 3 active projects at various stages.
--
-- Log in as contractor1@emporva.com / emporva123 to see the
-- contractor dashboard with active jobs, team, calendar, etc.
