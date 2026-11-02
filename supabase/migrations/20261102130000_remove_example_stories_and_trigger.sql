-- New accounts no longer get a stored "Example Story": the dashboard shows an
-- example in memory and only saves it once the author changes it.
-- Also removes the stories that were only examples, empty drafts or old tests.
-- Kept: stories of the Gerard and David Esteve accounts, and "帮帮小皮！".

begin;

create schema if not exists backup;
create table if not exists backup.stories_removed_2026_11_02 as
  select * from public.stories where false;
alter table backup.stories_removed_2026_11_02 enable row level security;

with keep_owners as (
  select id from public.profiles where email = 'gesteve.12@gmail.com' or user_name = 'David Esteve'
), removed as (
  delete from public.stories
  where profile_id not in (select id from keep_owners) and name <> '帮帮小皮！'
  returning *
)
insert into backup.stories_removed_2026_11_02 select * from removed;

drop trigger if exists on_profile_created_create_first_story on public.profiles;
drop function if exists public.create_story();

commit;

-- Once nothing is missed, the backup can go:
--   drop table backup.stories_removed_2026_11_02;
--   drop schema backup;
