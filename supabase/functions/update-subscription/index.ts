import 'https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@16.2.0?target=deno'

Deno.serve(async (req) => {
  try {
    const stripeInfo = await req.json()
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('ADMIN_SUPABASE_SECRET') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const subscription = stripeInfo.data.object
    const customerId = subscription.customer

    const { data, error } = await supabase
      .from('profiles')
      .update({
        subscription_status: subscription.status,
        plan: subscription.plan.nickname,
      })
      .eq('customer_id', customerId)
      .select()

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ message: 'Subscription updated successfully', data }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (err) {
    return new Response(String(err?.message ?? err), { status: 500 })
  }
})
