
CREATE TABLE public.certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text,
  website_url text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.certifications TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.certifications TO authenticated;
GRANT ALL ON public.certifications TO service_role;

ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read active certifications"
  ON public.certifications FOR SELECT
  USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins manage certifications"
  ON public.certifications FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_certifications_updated_at
  BEFORE UPDATE ON public.certifications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed section_texts entries for contact & certifications, if missing
INSERT INTO public.section_texts (key, eyebrow, title, description, icon)
VALUES
  ('contact', 'ابقَ على تواصل', 'تواصل معنا الآن', 'اترك بياناتك وسيقوم فريق Lamha Secure بالتواصل معك في أقرب وقت لمناقشة احتياجاتك الأمنية والتقنية.', 'Mail'),
  ('certifications', 'اعتماداتنا', 'الشهادات الاحترافية', 'نفتخر باعتماداتنا وشهاداتنا من كبرى الجهات المتخصصة في الأمن السيبراني.', 'BadgeCheck')
ON CONFLICT (key) DO NOTHING;
