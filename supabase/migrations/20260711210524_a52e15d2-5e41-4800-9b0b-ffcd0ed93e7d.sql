CREATE OR REPLACE FUNCTION public.has_valid_2fa(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_2fa_sessions s
    JOIN auth.users u ON u.id = s.user_id
    WHERE s.user_id = _user_id
      AND s.expires_at > now()
      AND s.verified_at >= COALESCE(u.last_sign_in_at, 'epoch'::timestamptz)
  );
$$;