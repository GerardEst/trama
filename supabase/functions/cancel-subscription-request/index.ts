import 'https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@16.2.0?target=deno'
import { profileSubscription } from '../_shared/subscription.ts'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  httpClient: Stripe.createFetchHttpClient(),
})
const allowedOrigins = ['https://trama.app', 'https://www.trama.app', 'http://localhost:4200']

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

// Les altres funcions de subscripció les invoca Stripe; aquesta, el navegador des de Trama.
Deno.serve(async (req) => {
  const origin = req.headers.get('origin') ?? ''
  const cors = {
    'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : '',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
  const respond = (body: string, status: number) =>
    new Response(body, { status, headers: { ...cors, 'Content-Type': 'application/json' } })

  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })
  if (req.method !== 'POST') return respond(JSON.stringify({ error: 'method_not_allowed' }), 405)

  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return respond(JSON.stringify({ error: 'no_token' }), 401)

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.slice('Bearer '.length))
    if (userError || !user) return respond(JSON.stringify({ error: 'invalid_token' }), 401)

    // The profile row has the same id as the auth user. Besides the Stripe webhooks, only this function writes it.
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_id')
      .eq('id', user.id)
      .maybeSingle()
    if (profileError) throw profileError
    if (!profile?.subscription_id) return respond(JSON.stringify({ error: 'no_subscription' }), 404)

    // Cancelling stops the renewal: the plan lasts until the end of the period already paid.
    const ending = await stripe.subscriptions.update(profile.subscription_id, { cancel_at_period_end: true })
    if (!ending.cancel_at_period_end) return respond(JSON.stringify({ error: 'not_cancelled' }), 500)

    // Written here too, so the profile shows it without waiting for the webhook.
    const { error: updateError } = await supabase
      .from('profiles')
      .update(profileSubscription(ending))
      .eq('id', user.id)
    if (updateError) throw updateError

    return respond(JSON.stringify({ message: 'Subscription canceled successfully' }), 200)
  } catch (err) {
    console.error('Could not cancel the subscription', err)
    return respond(JSON.stringify({ error: 'cancel_failed' }), 500)
  }
})
