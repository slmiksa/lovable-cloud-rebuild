
create or replace function public.submit_contact_request(
  p_full_name text,
  p_phone text,
  p_email text,
  p_message text
) returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_no integer;
begin
  if coalesce(length(trim(p_full_name)),0) < 2 then raise exception 'invalid_name'; end if;
  if coalesce(length(trim(p_email)),0) < 5 then raise exception 'invalid_email'; end if;
  if coalesce(length(trim(p_message)),0) < 1 then raise exception 'invalid_message'; end if;

  insert into public.contact_requests (full_name, phone, email, message)
  values (trim(p_full_name), trim(p_phone), trim(p_email), trim(p_message))
  returning request_no into v_no;

  return v_no;
end;
$$;

grant execute on function public.submit_contact_request(text,text,text,text) to anon, authenticated;
