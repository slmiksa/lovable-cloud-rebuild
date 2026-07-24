
CREATE TABLE public.section_texts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  eyebrow TEXT,
  title TEXT,
  description TEXT,
  icon TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.section_texts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.section_texts TO authenticated;
GRANT ALL ON public.section_texts TO service_role;

ALTER TABLE public.section_texts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read section_texts" ON public.section_texts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can insert section_texts" ON public.section_texts FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update section_texts" ON public.section_texts FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete section_texts" ON public.section_texts FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.set_section_texts_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER section_texts_updated_at BEFORE UPDATE ON public.section_texts FOR EACH ROW EXECUTE FUNCTION public.set_section_texts_updated_at();

INSERT INTO public.section_texts (key, eyebrow, title, description, icon) VALUES
  ('services', 'خدماتنا', 'حلول متكاملة لأمنك الرقمي', 'نقدم باقة شاملة من خدمات الأمن السيبراني والحلول التقنية والبرمجية والاستشارات لحماية أعمالك ودعم نموها بثقة.', 'ShieldCheck'),
  ('offers', 'أحدث عروضنا', 'باقات مصمّمة لحماية مؤسستك', NULL, 'Sparkles'),
  ('systems', 'منصاتنا', 'تطبيقاتنا وأنظمتنا', 'اضغط على أي نظام لعرض تفاصيله. تعمل جميع منصاتنا بشكل متكامل لحماية مؤسستك من جميع الزوايا.', 'ServerCog'),
  ('clients', 'عملاء Lamha Secure', 'يثقون بنا', NULL, 'Users'),
  ('news', NULL, 'أهم أخبار Lamha Secure', NULL, 'Newspaper'),
  ('circles', NULL, NULL, NULL, 'Grid');
