drop policy if exists "Users delete own report photos" on storage.objects;
create policy "Users delete own report photos" on storage.objects for delete to authenticated
  using (bucket_id='report-photos' and (storage.foldername(name))[1]=(select auth.uid())::text);