import 'https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@16.2.0?target=deno'

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
    const webhookSecret = Deno.env.get('UPDATE_SUBSCRIPTION_WEBHOOK_SECRET')
    if (!webhookSecret) {
      throw new Error('Stripe webhook secret is not set')
    }

    // Es fa així per verificar la signatura del webhook de stripe. El constructEvent és crucial
    const body = await req.text()
    let stripeEvent
    try {
      stripeEvent = await stripe.webhooks.constructEventAsync(
        body,
        stripeSignature,
        webhookSecret
      )
    } catch (err) {
      console.error(`Webhook signature verification failed.`)
      return new Response('Invalid signature', { status: 400 })
    }

    const subscription = stripeEvent.data.object

    // Get the next payment date
    const nextPaymentDate = new Date(subscription.current_period_end * 1000)

    const customerId = subscription.customer

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({
        subscription_status: subscription.status,
        plan: subscription.plan.nickname,
        next_payment: nextPaymentDate,
      })
      .eq('customer_id', customerId)

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ message: 'Subscription updated successfully' }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (err) {
    return new Response(String(err?.message ?? err), { status: 500 })
  }
})
