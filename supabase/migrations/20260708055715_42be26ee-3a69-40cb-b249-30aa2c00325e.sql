
-- Allow the browser-side has_role() check (called via user_roles RLS or directly) to work under the authenticated role.
grant execute on function public.has_role(uuid, public.app_role) to authenticated;

-- Storage policies: admins can upload/manage the media bucket; everyone can read.
create policy "media public read" on storage.objects for select using (bucket_id = 'media');
create policy "media admin write" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.has_role(auth.uid(),'admin'));
create policy "media admin update" on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.has_role(auth.uid(),'admin'));
create policy "media admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.has_role(auth.uid(),'admin'));
