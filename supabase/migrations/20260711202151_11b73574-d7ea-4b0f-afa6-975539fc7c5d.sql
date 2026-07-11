
-- 2FA codes (sent to admin email)
CREATE TABLE public.admin_2fa_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code_hash text not null,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  attempts int not null default 0,
  created_at timestamptz not null default now()
);
CREATE INDEX admin_2fa_codes_user_idx ON public.admin_2fa_codes(user_id, created_at desc);
GRANT ALL ON public.admin_2fa_codes TO service_role;
ALTER TABLE public.admin_2fa_codes ENABLE ROW LEVEL SECURITY;
-- No policies: only service_role via edge functions.

-- 2FA verified sessions
CREATE TABLE public.admin_2fa_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  verified_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '8 hours')
);
CREATE INDEX admin_2fa_sessions_user_idx ON public.admin_2fa_sessions(user_id, expires_at desc);
GRANT SELECT ON public.admin_2fa_sessions TO authenticated;
GRANT ALL ON public.admin_2fa_sessions TO service_role;
ALTER TABLE public.admin_2fa_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user reads own 2fa sessions" ON public.admin_2fa_sessions
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Helper: is the user 2FA-verified within the session window?
CREATE OR REPLACE FUNCTION public.has_valid_2fa(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_2fa_sessions
    WHERE user_id = _user_id AND expires_at > now()
  );
$$;
GRANT EXECUTE ON FUNCTION public.has_valid_2fa(uuid) TO authenticated, anon;

-- Update admin policies to also require 2FA
DROP POLICY IF EXISTS "admin clients" ON public.clients;
CREATE POLICY "admin clients" ON public.clients FOR ALL
  USING (public.has_role(auth.uid(),'admin') AND public.has_valid_2fa(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(),'admin') AND public.has_valid_2fa(auth.uid()));

DROP POLICY IF EXISTS "admin news" ON public.news;
CREATE POLICY "admin news" ON public.news FOR ALL
  USING (public.has_role(auth.uid(),'admin') AND public.has_valid_2fa(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(),'admin') AND public.has_valid_2fa(auth.uid()));

DROP POLICY IF EXISTS "admin offers" ON public.offers;
CREATE POLICY "admin offers" ON public.offers FOR ALL
  USING (public.has_role(auth.uid(),'admin') AND public.has_valid_2fa(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(),'admin') AND public.has_valid_2fa(auth.uid()));

DROP POLICY IF EXISTS "admin services" ON public.services;
CREATE POLICY "admin services" ON public.services FOR ALL
  USING (public.has_role(auth.uid(),'admin') AND public.has_valid_2fa(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(),'admin') AND public.has_valid_2fa(auth.uid()));

DROP POLICY IF EXISTS "admin slides" ON public.slides;
CREATE POLICY "admin slides" ON public.slides FOR ALL
  USING (public.has_role(auth.uid(),'admin') AND public.has_valid_2fa(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(),'admin') AND public.has_valid_2fa(auth.uid()));

DROP POLICY IF EXISTS "admin social" ON public.social_links;
CREATE POLICY "admin social" ON public.social_links FOR ALL
  USING (public.has_role(auth.uid(),'admin') AND public.has_valid_2fa(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(),'admin') AND public.has_valid_2fa(auth.uid()));

DROP POLICY IF EXISTS "admin systems" ON public.systems;
CREATE POLICY "admin systems" ON public.systems FOR ALL
  USING (public.has_role(auth.uid(),'admin') AND public.has_valid_2fa(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(),'admin') AND public.has_valid_2fa(auth.uid()));

DROP POLICY IF EXISTS "Admins can view contact requests" ON public.contact_requests;
CREATE POLICY "Admins can view contact requests" ON public.contact_requests FOR SELECT
  USING (public.has_role(auth.uid(),'admin') AND public.has_valid_2fa(auth.uid()));
DROP POLICY IF EXISTS "Admins can update contact requests" ON public.contact_requests;
CREATE POLICY "Admins can update contact requests" ON public.contact_requests FOR UPDATE
  USING (public.has_role(auth.uid(),'admin') AND public.has_valid_2fa(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(),'admin') AND public.has_valid_2fa(auth.uid()));
DROP POLICY IF EXISTS "Admins can delete contact requests" ON public.contact_requests;
CREATE POLICY "Admins can delete contact requests" ON public.contact_requests FOR DELETE
  USING (public.has_role(auth.uid(),'admin') AND public.has_valid_2fa(auth.uid()));

DROP POLICY IF EXISTS "admins can insert site_settings" ON public.site_settings;
CREATE POLICY "admins can insert site_settings" ON public.site_settings FOR INSERT
  WITH CHECK (public.has_role(auth.uid(),'admin') AND public.has_valid_2fa(auth.uid()));
DROP POLICY IF EXISTS "admins can update site_settings" ON public.site_settings;
CREATE POLICY "admins can update site_settings" ON public.site_settings FOR UPDATE
  USING (public.has_role(auth.uid(),'admin') AND public.has_valid_2fa(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(),'admin') AND public.has_valid_2fa(auth.uid()));
