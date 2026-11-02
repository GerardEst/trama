-- Converts the stories saved before the current format to the only format the
-- editor and @trama/engine read now:
--   * entryPoint: every story has one; old stories started at node_0
--   * text: rich-text HTML; #ref and [category] become explicit tokens
--   * nodes always have a type, routes always have rules, requirements use target
--   * property events use the alterProperty action
-- Stories already in the current format come out unchanged.

begin;

create schema if not exists backup;
create table if not exists backup.stories_before_format_2026_11_02 as
  select id, tree from public.stories;
alter table backup.stories_before_format_2026_11_02 enable row level security;

-- Plain text as the old rich-text editor converted it when opened. Only names
-- the story defines become variables, so a literal "#1" stays text.
create function pg_temp.trama_rich_text(source text, refs jsonb, known jsonb) returns text language plpgsql as $$
declare
  result text;
  key text;
  kind text;
begin
  if source is null or source = '' then return source; end if;
  if source ~* '^\s*<(p|h[1-6]|ul|ol|blockquote|pre|div)\M' then return source; end if;

  -- Text content only needs &, < and > escaped. Escaping quotes as &#39; would
  -- create #39, which the next step would take for a variable.
  result := replace(replace(replace(source, '&', '&amp;'), '<', '&lt;'), '>', '&gt;');

  for key in select distinct m[1] from regexp_matches(result, '#([A-Za-z0-9_]+)', 'g') as m where known ? m[1] loop
    kind := coalesce(refs->key->>'type',
      case when key like 'stat\_%' then 'stat' when key like 'condition\_%' then 'condition' else 'property' end);
    result := regexp_replace(result, '#' || key || '(?![A-Za-z0-9_])',
      '<span data-trama-variable="" data-kind="' || kind || '" data-key="' || key || '">#' || key || '</span>', 'g');
  end loop;

  result := regexp_replace(result, '\r\n?|\n', '<br>', 'g');
  result := '<p>' || regexp_replace(result, '\[([A-Za-z0-9_]+)\]',
    '</p><div data-trama-category="" data-key="\1">[\1]</div><p>', 'g') || '</p>';
  return replace(result, '<p></p>', '');
end $$;

create function pg_temp.trama_events(events jsonb) returns jsonb language sql as $$
  select coalesce(jsonb_agg(case when e->>'type' = 'property'
    then e || '{"action": "alterProperty"}' else e end), '[]'::jsonb)
  from jsonb_array_elements(case when jsonb_typeof(events) = 'array' then events else '[]' end) e
$$;

create function pg_temp.trama_tree(tree jsonb) returns jsonb language plpgsql as $$
declare
  refs jsonb := case when jsonb_typeof(tree->'refs') = 'object' then tree->'refs' else '{}' end;
  known jsonb;
  nodes jsonb := '[]';
  node jsonb;
  start jsonb;
begin
  -- Variables a story defines: its references, text-input properties and properties set by events.
  select coalesce(jsonb_agg(distinct name), '[]') into known from (
    select jsonb_object_keys(refs) as name
    union select n->'userTextOptions'->>'property' from jsonb_array_elements(tree->'nodes') n
    union select e->>'target' from jsonb_array_elements(tree->'nodes') n,
      jsonb_array_elements(case when jsonb_typeof(n->'events') = 'array' then n->'events' else '[]' end) e
    where e->>'type' = 'property'
    union select e->>'target' from jsonb_array_elements(tree->'nodes') n,
      jsonb_array_elements(case when jsonb_typeof(n->'answers') = 'array' then n->'answers' else '[]' end) a,
      jsonb_array_elements(case when jsonb_typeof(a->'events') = 'array' then a->'events' else '[]' end) e
    where e->>'type' = 'property'
  ) names where name is not null;

  for node in select * from jsonb_array_elements(case when jsonb_typeof(tree->'nodes') = 'array' then tree->'nodes' else '[]' end) loop
    if not node ? 'type' then node := node || '{"type": "content"}'; end if;
    if node->>'type' <> 'group' and jsonb_typeof(node->'text') = 'string' then
      node := jsonb_set(node, '{text}', to_jsonb(pg_temp.trama_rich_text(node->>'text', refs, known)));
    end if;
    if jsonb_typeof(node->'events') = 'array' then node := jsonb_set(node, '{events}', pg_temp.trama_events(node->'events')); end if;

    if jsonb_typeof(node->'answers') = 'array' then
      node := jsonb_set(node, '{answers}', (
        select coalesce(jsonb_agg(
          case when jsonb_typeof(a->'text') = 'string' then jsonb_set(a, '{text}', to_jsonb(pg_temp.trama_rich_text(a->>'text', refs, known))) else a end
          || case when jsonb_typeof(a->'events') = 'array' then jsonb_build_object('events', pg_temp.trama_events(a->'events')) else '{}' end
          || case when jsonb_typeof(a->'requirements') = 'array' then jsonb_build_object('requirements', (
               select coalesce(jsonb_agg(case when r->>'target' is null and r ? 'id'
                 then (r - 'id') || jsonb_build_object('target', r->'id') else r end), '[]'::jsonb)
               from jsonb_array_elements(a->'requirements') r)) else '{}' end
        ), '[]'::jsonb)
        from jsonb_array_elements(node->'answers') a));
    end if;

    if jsonb_typeof(node->'conditions') = 'array' then
      node := jsonb_set(node, '{conditions}', (
        select coalesce(jsonb_agg(case when c ? 'rules' then c
          else (c - 'ref' - 'comparator' - 'value') || jsonb_build_object('rules',
            case when c ? 'ref' then jsonb_build_array(jsonb_strip_nulls(jsonb_build_object(
              'ref', c->'ref', 'comparator', c->'comparator', 'value', c->'value'))) else '[]'::jsonb end)
        end), '[]'::jsonb)
        from jsonb_array_elements(node->'conditions') c));
    end if;

    nodes := nodes || jsonb_build_array(node);
  end loop;

  tree := jsonb_set(tree, '{nodes}', nodes);
  if not tree ? 'entryPoint' then
    -- Same placement the editor used for old stories: left of node_0, above the graph.
    select jsonb_build_object(
      'left', coalesce((n->>'left')::numeric, 0) - 180,
      'top', (select coalesce(min((m->>'top')::numeric), 0) from jsonb_array_elements(nodes) m) - 100,
      'targetNodeId', 'node_0')
    into start
    from jsonb_array_elements(nodes) n
    where n->>'id' = 'node_0' and n->>'type' <> 'group';
    tree := tree || jsonb_build_object('entryPoint', coalesce(start, '{"left": 5000, "top": 5000}'));
  end if;
  return tree;
end $$;

update public.stories
set tree = pg_temp.trama_tree(tree)
where tree is distinct from pg_temp.trama_tree(tree);

commit;

-- Once the stories play and edit correctly, the backup can go:
--   drop table backup.stories_before_format_2026_11_02;
