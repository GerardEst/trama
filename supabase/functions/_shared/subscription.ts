/** The fields of a Stripe subscription that the profile keeps. */
export interface SubscriptionPeriod {
  status: string
  cancel_at_period_end: boolean
  current_period_end: number
}

/**
 * The subscription as the profile stores it. Cancelling only stops the renewal:
 * an active subscription set to end with its period is already `canceled` for
 * Trama, which keeps the plan until `next_payment` (DatabaseService.userPlanIs).
 */
export function profileSubscription(subscription: SubscriptionPeriod) {
  const ending = subscription.status === 'active' && subscription.cancel_at_period_end
  return {
    subscription_status: ending ? 'canceled' : subscription.status,
    next_payment: new Date(subscription.current_period_end * 1000),
  }
}
