-- Anyone could read every story, and every column, straight from the table.
-- Authors now read only their own; players and external fronts load one story
-- at a time, by id or slug, through the public `story` edge function.
-- Apply only once the front that loads stories through that function is live.
drop policy if exists "Enable read access for all users" on public.stories;
create policy "Authors read their own stories" on public.stories
  for select to authenticated
  using ((select auth.uid()) = profile_id);
