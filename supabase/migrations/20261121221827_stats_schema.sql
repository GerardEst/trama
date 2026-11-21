-- The statistics are not part of the application: keep them apart in their own
-- schema. Its tables stay out of the API (no grants); only the two functions are
-- callable, with the `stats` schema exposed in the Data API settings.

create schema if not exists stats;
grant usage on schema stats to anon, authenticated;

alter table public.stats_excluded_profiles set schema stats;
alter table stats.stats_excluded_profiles rename to excluded_profiles;
alter table public.play_starts set schema stats;

-- Function bodies name their tables, so they are recreated rather than moved.
drop function public.start_play(uuid);
drop function public.public_stats();

-- Players record a start through this function; nobody writes to the table.
-- Starts by excluded accounts, or of their stories, are not recorded.
create function stats.start_play(story_id uuid) returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (select 1 from stats.excluded_profiles where profile_id = (select auth.uid())) then
    return;
  end if;

  insert into stats.play_starts (story)
  select s.id from public.stories s
  where s.id = story_id
    and not exists (select 1 from stats.excluded_profiles e where e.profile_id = s.profile_id);
end $$;

revoke all on function stats.start_play(uuid) from public;
grant execute on function stats.start_play(uuid) to anon, authenticated;

-- Only counts, never rows. Active users signed in or edited a story in the last
-- 30 days: a session that stays open does not update last_sign_in_at.
create function stats.summary() returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with excluded as (
    select profile_id from stats.excluded_profiles
  ),
  counted_stories as (
    select id, created_at from public.stories
    where profile_id is null or profile_id not in (select profile_id from excluded)
  ),
  counted_plays as (
    select p.created_at from stats.play_starts p
    where p.story in (select id from counted_stories)
  ),
  active_users as (
    select id from auth.users where last_sign_in_at > now() - interval '30 days'
    union
    select profile_id from public.stories where updated_at > now() - interval '30 days'
  )
  select jsonb_build_object(
    'active_users_30d', (select count(*) from active_users
                         where id is not null and id not in (select profile_id from excluded)),
    'stories', (select count(*) from counted_stories),
    'stories_30d', (select count(*) from counted_stories where created_at > now() - interval '30 days'),
    'plays', (select count(*) from counted_plays),
    'plays_7d', (select count(*) from counted_plays where created_at > now() - interval '7 days'),
    'plays_30d', (select count(*) from counted_plays where created_at > now() - interval '30 days'),
    'updated_at', now()
  )
$$;

revoke all on function stats.summary() from public;
grant execute on function stats.summary() to anon, authenticated;
