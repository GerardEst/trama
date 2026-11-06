-- Players save their game through this function instead of writing to the table.
-- They are usually anonymous, so no policy can tell whose game a row is: the
-- random game id the player's browser generated is what lets it update the row.
create function public.save_game(
  game_id uuid,
  story_id uuid,
  player_name text,
  game_path jsonb,
  game_result jsonb
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  saved integer;
begin
  if game_id is null or jsonb_typeof(game_path) is distinct from 'array'
    or jsonb_typeof(game_result) is distinct from 'object' then
    raise exception 'invalid_game' using errcode = '22023';
  end if;
  if pg_column_size(game_path) > 524288 or pg_column_size(game_result) > 65536 then
    raise exception 'game_too_large' using errcode = '22023';
  end if;
  if not exists (select 1 from public.stories where id = story_id and tracking) then
    raise exception 'story_not_tracked' using errcode = '22023';
  end if;

  insert into public.games (id, story, user_name, path, result)
  values (game_id, story_id, coalesce(nullif(left(player_name, 200), ''), 'anonymous'), game_path, game_result)
  on conflict (id) do update
    set user_name = excluded.user_name, path = excluded.path, result = excluded.result
    where games.story = excluded.story;

  -- A game id already used by another story cannot be taken over.
  get diagnostics saved = row_count;
  if saved = 0 then
    raise exception 'game_belongs_to_another_story' using errcode = '22023';
  end if;
end $$;

revoke all on function public.save_game(uuid, uuid, text, jsonb, jsonb) from public;
grant execute on function public.save_game(uuid, uuid, text, jsonb, jsonb) to anon, authenticated;
