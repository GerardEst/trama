/// <reference lib="deno.ns" />
import { profileSubscription } from './subscription.ts'

function assertEquals(actual: unknown, expected: unknown) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
  }
}

const end = Date.UTC(2026, 11, 19) / 1000

Deno.test('an active subscription that renews stays active until its next payment', () => {
  assertEquals(profileSubscription({ status: 'active', cancel_at_period_end: false, current_period_end: end }), {
    subscription_status: 'active',
    next_payment: new Date(end * 1000),
  })
})

Deno.test('an active subscription set to end with its period is canceled, with the plan until then', () => {
  assertEquals(profileSubscription({ status: 'active', cancel_at_period_end: true, current_period_end: end }), {
    subscription_status: 'canceled',
    next_payment: new Date(end * 1000),
  })
})

Deno.test('an unpaid subscription keeps its status even if it is set to end', () => {
  assertEquals(
    profileSubscription({ status: 'past_due', cancel_at_period_end: true, current_period_end: end }).subscription_status,
    'past_due',
  )
})

Deno.test('a subscription Stripe has ended is canceled', () => {
  assertEquals(
    profileSubscription({ status: 'canceled', cancel_at_period_end: true, current_period_end: end }).subscription_status,
    'canceled',
  )
})
