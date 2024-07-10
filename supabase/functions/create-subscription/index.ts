// Setup type definitions for built-in Supabase Runtime APIs
import 'https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@16.2.0?target=deno'
// import Stripe from 'npm:stripe'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  // This is needed to use the Fetch API rather than relying on the Node http
  // package.
  httpClient: Stripe.createFetchHttpClient(),
})

Deno.serve(async (req) => {
  try {
    const stripeInfo = await req.json()
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const customerId = stripeInfo.data.object.customer
    const customer = await stripe.customers.retrieve(customerId)

    const { data, error } = await supabase
      .from('profiles')
      .update({ subscription: true })
      .eq('email', customer.email)
      .select()

    if (error) {
      throw error
    }

    // TODO - Crec que no caldria passarli tot lo que hem retornat.
    // Pude puc treure tot el select directament i ja està.
    // A la response no sé què passar o si cal posar algo apart del 200
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
