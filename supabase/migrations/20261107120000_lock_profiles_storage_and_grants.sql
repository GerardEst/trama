-- Users could update every column of their own profile: plan, subscription status,
-- next payment and the Stripe customer and subscription ids the webhooks match on.
-- The app never writes profiles from the browser; only the Stripe webhooks do,
-- with the service role.
drop policy if exists "Enable update only own data for users" on public.profiles;
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;

-- Same columns as profiles and its policies apply (security_invoker): signed-in users only.
revoke all on public.user_safe_profiles from anon, authenticated;
grant select on public.user_safe_profiles to authenticated;

-- Stories are read by players through the `story` function; only authors use the table.
-- TRUNCATE ignores policies, so nobody outside the server gets it.
revoke all on public.stories from anon;
revoke truncate, references, trigger on public.stories from authenticated;

-- Story images. The bucket is public, so image URLs keep working without a read
-- policy; the old one let anyone list every file, and the paths reveal user and
-- story ids. Authors still read their own files, which removing them requires.
drop policy if exists "Allow read access to everyone" on storage.objects;
create policy "Authors read their own images" on storage.objects
  for select to authenticated
  using (bucket_id = 'images' and owner_id = (select auth.uid())::text);

-- Authors upload only into their own folder: <user id>/<story id>/<file>.
drop policy if exists "Only auth users can insert images" on storage.objects;
create policy "Authors upload images to their own folder" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'images' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Only object owners can update the object" on storage.objects;
create policy "Authors update their own images" on storage.objects
  for update to authenticated
  using (bucket_id = 'images' and owner_id = (select auth.uid())::text)
  with check (bucket_id = 'images' and owner_id = (select auth.uid())::text
    and (storage.foldername(name))[1] = (select auth.uid())::text);

-- Uploads are WebP files from the image optimizer, under 100 KB so far. No SVG,
-- which can carry scripts.
update storage.buckets
set file_size_limit = 2097152, allowed_mime_types = array['image/webp', 'image/jpeg', 'image/png']
where id = 'images';

-- A trigger function: nobody needs to call it through the API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- The app does not use GraphQL; it only exposed the schema to anyone with the public key.
drop extension if exists pg_graphql;
