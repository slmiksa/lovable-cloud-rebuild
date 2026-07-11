create extension if not exists pg_net;

create or replace function public.notify_contact_request_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform net.http_post(
    url := 'https://nwiftvgwcsqgwmsfmlgs.supabase.co/functions/v1/send-contact-emails',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object(
      'requestNo', new.request_no,
      'fullName', new.full_name,
      'phone', new.phone,
      'email', new.email,
      'message', new.message
    )
  );

  return new;
exception
  when others then
    return new;
end;
$$;

drop trigger if exists contact_requests_send_email on public.contact_requests;
create trigger contact_requests_send_email
after insert on public.contact_requests
for each row
execute function public.notify_contact_request_email();