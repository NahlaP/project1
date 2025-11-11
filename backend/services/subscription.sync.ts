// backend/services/subscription.sync.ts
import Stripe from "stripe";
import User from "../models/User";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function refreshUserSubscriptionFromStripe(userId: string) {
  const user = await User.findById(userId);
  if (!user || !user.stripeSubscriptionId) return null;

  const sub = await stripe.subscriptions.retrieve(user.stripeSubscriptionId, {
    expand: ["items.data.price"],
  });

  const stripeStatus = sub.status; // active | trialing | incomplete | past_due | unpaid | canceled
  const status: "active" | "incomplete" | "past_due" | null =
    stripeStatus === "active" || stripeStatus === "incomplete" || stripeStatus === "past_due"
      ? stripeStatus
      : null;
  const priceId = sub.items.data[0]?.price?.id || null;
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id || null;

  user.subscriptionStatus = status;
  user.priceId = priceId;
  if (customerId && !user.stripeCustomerId) user.stripeCustomerId = customerId as string;
  (user as any).subscriptionStatusCheckedAt = new Date();

  await user.save();
  return { status, priceId };
}
