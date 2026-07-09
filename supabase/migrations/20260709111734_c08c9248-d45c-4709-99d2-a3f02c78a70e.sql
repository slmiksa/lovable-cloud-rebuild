
-- Sequence for human-friendly request numbers
CREATE SEQUENCE IF NOT EXISTS public.contact_request_number_seq START 1001;

CREATE TABLE public.contact_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_no INTEGER NOT NULL DEFAULT nextval('public.contact_request_number_seq'),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  admin_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT contact_requests_request_no_unique UNIQUE (request_no),
  CONSTRAINT contact_requests_full_name_len CHECK (char_length(full_name) BETWEEN 2 AND 120),
  CONSTRAINT contact_requests_phone_len CHECK (char_length(phone) BETWEEN 6 AND 30),
  CONSTRAINT contact_requests_email_len CHECK (char_length(email) BETWEEN 5 AND 200),
  CONSTRAINT contact_requests_message_len CHECK (char_length(message) BETWEEN 1 AND 700)
);

ALTER SEQUENCE public.contact_request_number_seq OWNED BY public.contact_requests.request_no;

GRANT INSERT ON public.contact_requests TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.contact_requests TO authenticated;
GRANT ALL ON public.contact_requests TO service_role;
GRANT USAGE ON SEQUENCE public.contact_request_number_seq TO anon, authenticated, service_role;

ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a new request
CREATE POLICY "Anyone can submit contact requests"
ON public.contact_requests FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only admins can read / update / delete
CREATE POLICY "Admins can view contact requests"
ON public.contact_requests FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update contact requests"
ON public.contact_requests FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete contact requests"
ON public.contact_requests FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER contact_requests_set_updated_at
BEFORE UPDATE ON public.contact_requests
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX contact_requests_created_at_idx ON public.contact_requests (created_at DESC);
CREATE INDEX contact_requests_status_idx ON public.contact_requests (status);
