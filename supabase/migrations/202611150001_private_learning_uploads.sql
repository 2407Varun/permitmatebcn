-- Run once in the SQL Editor of a NEW development project.
-- This is an account-owned learning workspace, not a shared law-firm vault.
begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('learning-documents', 'learning-documents', false, 5242880,
        array['application/pdf', 'image/jpeg', 'image/png']);

-- A folder name alone is not security: these policies enforce it server-side.
create policy "learning_documents_insert_own"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'learning-documents'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and owner_id = (select auth.uid())::text
);

create policy "learning_documents_read_own"
on storage.objects for select to authenticated
using (
  bucket_id = 'learning-documents'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and owner_id = (select auth.uid())::text
);

create policy "learning_documents_delete_own"
on storage.objects for delete to authenticated
using (
  bucket_id = 'learning-documents'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and owner_id = (select auth.uid())::text
);

-- No UPDATE policy: overwriting a previous submission is deliberately disallowed.
commit;
