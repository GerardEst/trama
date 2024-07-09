// Setup type definitions for built-in Supabase Runtime APIs
import 'https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts'

import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async (req) => {
  // Aqui hauria de rebre l'email, i després amb aixo pos fer un update de supabase
  // pero estic rebent com a maxim el clientid de strapi

  // Ames, no està retornant res de la db, és un escandol.
  // Potser les credencials no estan ben posades a l'env
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data, error } = await supabase.from('profiles').select('*')

    if (error) {
      throw error
    }

    return new Response(JSON.stringify({ data }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    return new Response(String(err?.message ?? err), { status: 500 })
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/create-subscription' \
    --header 'Authorization: Bearer ' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
