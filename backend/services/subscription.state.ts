









import User from "../models/User";
import { decideNextFromStatus, reconcileUserFromStripe } from "./stripe.service";

export type SubState = "none" | "incomplete" | "active" | "past_due";

const toSubState = (s?: string | null): SubState => {
  if (!s) return "none";
  const v = s.toLowerCase();
  if (v === "active" || v === "trialing") return "active";
  if (v === "past_due" || v === "unpaid") return "past_due";
  if (v === "incomplete" || v === "incomplete_expired") return "incomplete";
  return "none";
};

/** Reconcile with Stripe, persist, and return normalized state + next + fresh user */
export async function getSubscriptionState(userId: string) {
  const recon = await reconcileUserFromStripe(userId);

  const statusNorm = toSubState(recon.status);
  await User.findByIdAndUpdate(
    userId,
    {
      ...(recon.customerId ? { stripeCustomerId: recon.customerId } : {}),
      ...(recon.subscriptionId ? { stripeSubscriptionId: recon.subscriptionId } : {}),
      ...(recon.priceId ? { priceId: recon.priceId } : {}),
      subscriptionStatus:
        statusNorm === "active" ? "active" :
        statusNorm === "past_due" ? "past_due" :
        statusNorm === "incomplete" ? "incomplete" : null
    },
    { new: true }
  );

  const fresh = await User.findById(userId);
  const next = decideNextFromStatus(recon.status);
  return { status: statusNorm, next, user: fresh! };
}
