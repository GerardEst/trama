import 'https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@16.2.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  httpClient: Stripe.createFetchHttpClient(),
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

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

  // Extract the JWT token from the Authorization header
  const authHeader = req.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('Invalid token')
    return new Response('No valid token provided', { status: 401 })
  }

  try {
    const { subscription_id, customer_id } = await req.json()

    if (!customer_id) {
      console.error('No customer ID provided')
      return new Response('Missing parameter', { status: 400 })
    }

    if (!subscription_id) {
      console.error('No subscription ID provided')
      return new Response('Missing parameter', { status: 400 })
    }

    // Fetch the subscription details
    const subscription = await stripe.subscriptions.retrieve(subscription_id)

    // Check if the subscription belongs to the customer
    if (subscription.customer !== customer_id) {
      console.error('Unauthorized user')
      return new Response('Not authorized', { status: 403 })
    }

    const cancelledSubscription = await stripe.subscriptions.cancel(
      subscription_id
    )

    if (cancelledSubscription.status !== 'canceled') {
      console.error('Status not canceled')
      return new Response('Failed to cancel subscription', { status: 500 })
    }

    return new Response(
      JSON.stringify({
        message: 'Subscription canceled successfully',
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
    return new Response(String(err?.message ?? err), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://www.textandplay.com',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      status: 500,
    })
  }
})
