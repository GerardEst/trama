import 'https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@16.2.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  httpClient: Stripe.createFetchHttpClient(),
})

Deno.serve(async (req) => {
  // Les altres funcions s'estan invocant desde stripe, aquesta desde textandplay
  // Per tant aquesta necessita una mica de CORS (no sé perquè, suposo que supabase ja permet per defecte stripe)
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': 'https://www.textandplay.com',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      status: 204,
    })
  }

  try {
    const { subscription_id } = await req.json()

    if (!subscription_id) {
      return new Response('Subscription ID is required', { status: 400 })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Cancela la suscripció. Hi ha també el delete, però és millor fer cancel
    const subscription = await stripe.subscriptions.cancel(subscription_id)

    if (subscription.status !== 'canceled') {
      return new Response('Failed to cancel subscription', { status: 500 })
    }

    return new Response(
      JSON.stringify({
        message: 'Subscription canceled successfully',
        data: subscription,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://www.textandplay.com',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
        status: 200,
      }
    )
  } catch (err) {
    return new Response(String(err?.message ?? err), { status: 500 })
  }
})
