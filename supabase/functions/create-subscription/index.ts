// Setup type definitions for built-in Supabase Runtime APIs
import 'https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@16.2.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  // This is needed to use the Fetch API rather than relying on the Node http
  // package.
  httpClient: Stripe.createFetchHttpClient(),
})

Deno.serve(async (req) => {
  try {
    // La edge function a supabase rep tota la info per part del webhook de stripe a la req
    const stripeInfo = await req.json()
    // Creem un client de supabase, es a dir la instancia que fem servir per fer queries a la db etc
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Agafem el que ens interessa de l'objecte rebut
    const subscription = stripeInfo.data.object
    const customerId = subscription.customer
    // Necessitem agafar tota la info del customer (apart de l'id que ja tenim) per obtenir el mail
    const customer = await stripe.customers.retrieve(customerId)

    // Fem la query a supabase, guardant info de la suscripció per tenir-ho a ma i no estar fent calls a stripe
    const { data, error } = await supabase
      .from('profiles')
      .update({
        subscription_id: subscription.id,
        subscription_status: subscription.status,
        customer_id: customerId,
        plan: subscription.plan.nickname,
      })
      .eq('email', customer.email)
      .select()

    if (error) {
      throw error
    }

    // Retornem la resposta adient
    return new Response(
      JSON.stringify({ message: 'Subscription created successfully', data }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (err) {
    // En cas d'error retornem l'error
    return new Response(String(err?.message ?? err), { status: 500 })
  }
})
