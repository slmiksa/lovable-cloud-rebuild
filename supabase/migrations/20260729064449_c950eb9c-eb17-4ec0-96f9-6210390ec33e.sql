ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS support_type text NOT NULL DEFAULT 'whatsapp',
  ADD COLUMN IF NOT EXISTS support_value text;

ALTER TABLE public.site_settings
  DROP CONSTRAINT IF EXISTS site_settings_support_type_check;
ALTER TABLE public.site_settings
  ADD CONSTRAINT site_settings_support_type_check CHECK (support_type IN ('whatsapp','email'));

UPDATE public.site_settings SET support_value = COALESCE(support_value, '966552553315') WHERE id = true;