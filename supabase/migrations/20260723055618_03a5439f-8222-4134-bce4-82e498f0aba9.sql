
CREATE TABLE public.home_circles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  icon text,
  image_url text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.home_circles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.home_circles TO authenticated;
GRANT ALL ON public.home_circles TO service_role;

ALTER TABLE public.home_circles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active home_circles"
  ON public.home_circles FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can read all home_circles"
  ON public.home_circles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert home_circles"
  ON public.home_circles FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update home_circles"
  ON public.home_circles FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete home_circles"
  ON public.home_circles FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.home_circles (title, icon, sort_order, is_active) VALUES
  ('برامج التوعية الأمنية', 'ShieldCheck', 1, true),
  ('إعداد السياسات والإجراءات السيبرانية والتقنية', 'FileText', 2, true),
  ('الاستشارات السيبرانية والتقنية', 'Users', 3, true),
  ('الدعم الفني', 'Headphones', 4, true);
