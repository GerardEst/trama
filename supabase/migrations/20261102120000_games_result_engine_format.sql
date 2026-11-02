-- Saved games now store the final player state exactly as @trama/engine keeps it:
--   { "properties": { "name": "Ada" }, "stats": { "stat_gold": 5 }, "conditions": ["condition_key"] }
-- instead of { "stats": [{ "id", "amount" }], "conditions": [{ "id" }] }.
-- Tab and window tracking was removed, so external_events is no longer written.

begin;

-- Keep the previous values outside the API-exposed schema until the change is verified.
create schema if not exists backup;
create table if not exists backup.games_before_engine_format as
  select id, result, external_events from public.games;

update public.games
set result = jsonb_build_object(
  'properties', case when jsonb_typeof(result::jsonb->'properties') = 'object' then result::jsonb->'properties' else '{}'::jsonb end,
  'stats', coalesce((
    select jsonb_object_agg(stat->>'id', (stat->>'amount')::numeric)
    from jsonb_array_elements(result::jsonb->'stats') as stat
    where stat->>'id' is not null and (stat->>'amount') ~ '^-?[0-9]+(\.[0-9]+)?$'
  ), '{}'::jsonb),
  'conditions', coalesce((
    select jsonb_agg(case when jsonb_typeof(condition) = 'string' then condition #>> '{}' else condition->>'id' end)
    from jsonb_array_elements(case when jsonb_typeof(result::jsonb->'conditions') = 'array' then result::jsonb->'conditions' else '[]'::jsonb end) as condition
    where jsonb_typeof(condition) = 'string' or condition->>'id' is not null
  ), '[]'::jsonb)
)
where jsonb_typeof(result::jsonb->'stats') = 'array';

alter table public.games drop column if exists external_events;

commit;

-- Once statistics look right, the backup can go:
--   drop table backup.games_before_engine_format;
