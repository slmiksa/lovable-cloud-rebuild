INSERT INTO public.section_texts (key, eyebrow, title, description, icon)
VALUES ('clients_page', 'شركاؤنا', 'عملاؤنا', 'نفخر بثقة عملائنا من مختلف القطاعات في حماية أعمالهم الرقمية وتطوير حلولهم التقنية.', 'Users')
ON CONFLICT (key) DO NOTHING;