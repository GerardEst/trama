-- Anyone could read and update every game, and any signed-in user could delete
-- them all. Players now save through `save_game`; only the author of a story
-- reads its games. Deleting a story still removes its games (ON DELETE CASCADE).
-- Apply only once the front that saves through `save_game` is live.
drop policy if exists "Anon can read their own game if game id and user_name match" on public.games;
drop policy if exists "Anon can update their own game if game id and user_name match" on public.games;
drop policy if exists "Enable insert for all users when id and user_name exist" on public.games;
drop policy if exists "Enable delete for auth users" on public.games;

create policy "Authors read the games of their stories" on public.games
  for select to authenticated
  using (exists (
    select 1 from public.stories
    where stories.id = games.story and stories.profile_id = (select auth.uid())
  ));

-- Nothing writes to the table directly any more, and TRUNCATE ignores policies.
revoke all on public.games from anon, authenticated;
grant select on public.games to authenticated;

-- The policy and the statistics both look games up by story.
create index if not exists games_story_idx on public.games (story);
