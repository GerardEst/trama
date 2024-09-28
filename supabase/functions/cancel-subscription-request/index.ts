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
    return new Response('No valid token provided', { status: 401 })
  }
  const token = authHeader.split(' ')[1]

  try {
    // Verify the JWT token and get the user details
    const {
      data: { user },
      validationError,
    } = await supabase.auth.getUser(token)
    if (validationError || !user) {
      return new Response('Invalid token', { status: 401 })
    }

    // Fetch the subscription details from supabase
    const { data, queryError } = await supabase
      .from('profiles')
      .select('subscription_id')
      .eq('email', user.email)

    if (queryError) {
      return new Response('No subscription found', { status: 404 })
    }

    console.log(data)
    const cancelledSubscription = await stripe.subscriptions.cancel(
      data[0].subscription_id
    )

    if (cancelledSubscription.status !== 'canceled') {
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
