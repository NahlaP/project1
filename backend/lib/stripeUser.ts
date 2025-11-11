// backend/lib/stripeUser.ts
import User from "../models/User";

/** Save (or update) the Stripe customer id on the user */
export async function saveStripeCustomerId(userId: string, stripeCustomerId: string) {
  try {
    await User.findByIdAndUpdate(userId, { stripeCustomerId }, { new: true });
  } catch {
    // soft-fail
  }
}

/** Save subscription details on the user */
export async function saveStripeSubscription(
  userId: string,
  params: { id: string; status: string; current_period_end?: number | null; priceId?: string | null }
) {
  const currentPeriodEnd =
    params.current_period_end ? new Date(params.current_period_end * 1000) : null;

  try {
    await User.findByIdAndUpdate(
      userId,
      {
        stripeSubscriptionId: params.id,
        subscriptionStatus:
          params.status === "active" || params.status === "trialing"
            ? "active"
            : params.status === "past_due"
            ? "past_due"
            : params.status === "incomplete" || params.status === "incomplete_expired"
            ? "incomplete"
            : null,
        // store last-picked price id if you want it on the user
        ...(params.priceId ? { priceId: params.priceId } : {}),
        // @ts-ignore if your schema doesn't have this field
        currentPeriodEnd,
      },
      { new: true }
    );
  } catch {
    // soft-fail
  }
}
