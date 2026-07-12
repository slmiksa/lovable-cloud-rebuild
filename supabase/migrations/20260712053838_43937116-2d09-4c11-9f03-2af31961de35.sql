ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS contact_email TEXT,
  ADD COLUMN IF NOT EXISTS contact_address TEXT;

UPDATE public.site_settings
SET
  contact_phone = COALESCE(contact_phone, '800 304 0304'),
  contact_email = COALESCE(contact_email, 'info@lamhasec.com'),
  contact_address = COALESCE(contact_address, 'الرياض، المملكة العربية السعودية')
WHERE id = true;