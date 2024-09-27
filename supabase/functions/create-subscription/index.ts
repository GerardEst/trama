// Setup type definitions for built-in Supabase Runtime APIs
import 'https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  // This is needed to use the Fetch API rather than relying on the Node http package.
  httpClient: Stripe.createFetchHttpClient(),
})

// Creem un client de supabase, es a dir la instancia que fem servir per fer queries a la db etc
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

Deno.serve(async (req) => {
  try {
    // Verify the Stripe webhook signature
    const stripeSignature = req.headers.get('stripe-signature')
    if (!stripeSignature) {
      throw new Error('No Stripe signature found')
    }
    const webhookSecret = Deno.env.get('CREATE_SUBSCRIPTION_WEBHOOK_SECRET')
    if (!webhookSecret) {
      throw new Error('Stripe webhook secret is not set')
    }

    // Es fa així per verificar la signatura del webhook de stripe. El constructEvent és crucial
    let stripeEvent
    const body = await req.text()
    try {
      stripeEvent = await stripe.webhooks.constructEventAsync(
        body,
        stripeSignature,
        webhookSecret
      )
    } catch (err) {
      console.error(`Webhook signature verification failed.`, err)
      return new Response('Invalid signature', { status: 400 })
    }

    // Now process the verified Stripe event
    const subscription = stripeEvent.data.object
    const customerId = subscription.customer
    const customer = await stripe.customers.retrieve(customerId)

    // Fem la query a supabase, guardant info de la suscripció per tenir-ho a ma i no estar fent calls a stripe
    const { data, error } = await supabaseAdmin
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
      JSON.stringify({ message: 'Subscription created successfully' }),
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
