// Setup type definitions for built-in Supabase Runtime APIs
import 'https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@16.2.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  httpClient: Stripe.createFetchHttpClient(),
})

Deno.serve(async (req) => {
  try {
    // Parse the request body
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

    // Cancel the subscription in Stripe
    const subscription = await stripe.subscriptions.cancel(subscription_id)

    // Check if subscription was successfully canceled
    if (subscription.status !== 'canceled') {
      return new Response('Failed to cancel subscription', { status: 500 })
    }

    // Update user's profile in Supabase to reflect the canceled subscription
    const { data, error } = await supabase
      .from('profiles')
      .update({
        subscription_id: null, // Optionally remove the subscription ID
        subscription_status: 'canceled', // Update status to canceled
        subscription: false, // Set subscription to false
      })
      .eq('subscription_id', subscription_id) // Find the user by subscription ID

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ message: 'Subscription canceled successfully', data }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (err) {
    return new Response(String(err?.message ?? err), { status: 500 })
  }
})
