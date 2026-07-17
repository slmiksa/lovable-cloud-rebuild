
CREATE TABLE public.whatsapp_faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.whatsapp_faqs TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.whatsapp_faqs TO authenticated;
GRANT ALL ON public.whatsapp_faqs TO service_role;

ALTER TABLE public.whatsapp_faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active FAQs"
  ON public.whatsapp_faqs FOR SELECT
  USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert FAQs"
  ON public.whatsapp_faqs FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update FAQs"
  ON public.whatsapp_faqs FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete FAQs"
  ON public.whatsapp_faqs FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER whatsapp_faqs_set_updated_at
  BEFORE UPDATE ON public.whatsapp_faqs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.whatsapp_faqs (question, answer, sort_order) VALUES
  ('ما هي الخدمات التي تقدمونها؟', 'نقدّم حلولاً متكاملة في الأمن السيبراني والحلول التقنية والبرمجية والاستشارات: اختبار الاختراق، أمن الشبكات، أمن السحابة، الاستجابة للحوادث، والحوكمة والامتثال.', 1),
  ('هل تقدمون دعماً على مدار الساعة؟', 'نعم، فريق مركز العمليات الأمنية (SOC) لدينا يعمل 24/7 لرصد التهديدات والاستجابة الفورية لأي حادث سيبراني.', 2),
  ('كيف أحصل على عرض سعر؟', 'تواصل معنا عبر واتساب أو راسلنا على sales@lamhasec.com وسيقوم فريقنا بدراسة احتياجك وإرسال عرض مخصص خلال 24 ساعة.', 3),
  ('هل تخدمون الشركات الصغيرة؟', 'بالتأكيد. لدينا باقات مرنة تناسب الشركات الناشئة والصغيرة والمتوسطة، إضافة إلى حلول مؤسسية للجهات الكبرى.', 4);
