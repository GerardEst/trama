-- Authors could insert stories under any profile_id. Only allow their own.
drop policy if exists "Enable insert for authenticated users only" on public.stories;
create policy "Enable insert for authenticated users as themselves" on public.stories
  for insert to authenticated
  with check ((select auth.uid()) = profile_id);
