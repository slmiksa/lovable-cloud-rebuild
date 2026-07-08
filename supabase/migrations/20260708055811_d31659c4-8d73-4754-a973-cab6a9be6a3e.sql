
revoke execute on function public.has_role(uuid, public.app_role) from authenticated, anon, public;
grant execute on function public.has_role(uuid, public.app_role) to service_role;

drop policy if exists "media public read" on storage.objects;
create policy "media admin read" on storage.objects for select to authenticated
  using (bucket_id = 'media' and public.has_role(auth.uid(),'admin'));
