/// <reference lib="deno.ns" />
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { createHandler } from './handler.ts'

// The service role bypasses RLS: authors only read their own rows from the table,
// and players reach other stories only through this function, by id or slug.
const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
  auth: { persistSession: false },
})

Deno.serve(createHandler(async (column, value) => {
  const { data, error } = await supabase
    .from('stories')
    .select('id, name, custom_id, tree, cumulativeMode, sharing, tapLink, tracking, footer')
    .eq(column, value)
    .maybeSingle()
  if (error) throw error
  return data
}))
