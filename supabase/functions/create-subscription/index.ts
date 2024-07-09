// Setup type definitions for built-in Supabase Runtime APIs
import 'https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts'

import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async (req) => {
  // TODO - Aqui hauria de rebre l'email, i després amb aixo pos fer un update de supabase
  // pero estic rebent com a maxim el clientid de strapi

  // TODO - Ames, no està retornant res de la db, és un escandol.
  // Potser les credencials no estan ben posades a l'env

  // Tot això corre als servidors de supabase, per tant ja té allà les credencials aquestes
  // Authorization no sé d'on surt ni què fa
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Testejar en local ES FACIL
    // pero no hi ha la taula entonses k ago
    // https://supabase.com/docs/guides/functions/deploy

    // const { data, error } = await supabase
    //   .from('profiles')
    //   .update({ full_name: 'true' })
    //   .eq('user_name', 'Gerard') // De moment em cambio a mi a saco
    //   .select()

    // El select funciona perfecte, pero l'update no. Els RLS son super permisius per tots dos
    // Limitar a supabase_admin fa que no funcioni. Nose com s'hauria de fer perquè es pugués fer
    // desde funcions
    const { data, error } = await supabase.from('profiles').select()

    console.log(data)

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
