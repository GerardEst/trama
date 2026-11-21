-- Public, aggregate-only statistics for an external board, plus an anonymous
-- record of every game started in the playground, whether or not its story has
-- tracking on.

-- Accounts that never count in the statistics: the team's own.
create table public.stats_excluded_profiles (
  profile_id uuid primary key references auth.users (id) on delete cascade
);
alter table public.stats_excluded_profiles enable row level security;
revoke all on public.stats_excluded_profiles from anon, authenticated;

insert into public.stats_excluded_profiles (profile_id)
select id from auth.users
where id in ('7ed38c0d-dbe8-40d0-8f2d-5f3b2c2a771d', 'd41a81c2-06a8-4a35-86b6-53acb6baab86');

-- Only which story was started and when: no player, path or result.
create table public.play_starts (
  id bigint generated always as identity primary key,
  story uuid not null references public.stories (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.play_starts enable row level security;
revoke all on public.play_starts from anon, authenticated;
create index play_starts_story_idx on public.play_starts (story);
create index play_starts_created_at_idx on public.play_starts (created_at);

-- Players record a start through this function; nobody writes to the table.
-- Starts by excluded accounts, or of their stories, are not recorded.
create function public.start_play(story_id uuid) returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (select 1 from public.stats_excluded_profiles where profile_id = (select auth.uid())) then
    return;
  end if;

  insert into public.play_starts (story)
  select s.id from public.stories s
  where s.id = story_id
    and not exists (select 1 from public.stats_excluded_profiles e where e.profile_id = s.profile_id);
end $$;

revoke all on function public.start_play(uuid) from public;
grant execute on function public.start_play(uuid) to anon, authenticated;

-- Only counts, never rows. Active users signed in or edited a story in the last
-- 30 days: a session that stays open does not update last_sign_in_at.
create function public.public_stats() returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with excluded as (
    select profile_id from public.stats_excluded_profiles
  ),
  counted_stories as (
    select id, created_at from public.stories
    where profile_id is null or profile_id not in (select profile_id from excluded)
  ),
  counted_plays as (
    select p.created_at from public.play_starts p
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

revoke all on function public.public_stats() from public;
grant execute on function public.public_stats() to anon, authenticated;
