

// // backend/services/subscription.state.ts
// import Stripe from "stripe";
// import User from "../models/User";
// import { stripe } from "./stripe.service";

// export type SubState =
//   | "none"
//   | "incomplete"
//   | "active"
//   | "trialing"
//   | "past_due"
//   | "unpaid"
//   | "canceled";

// // what your DB field allows
// type DbSubState = "incomplete" | "active" | "past_due" | null;

// export const LIVE_STATUSES: SubState[] = ["active", "trialing", "past_due", "unpaid"];
// const BLOCK_DUP_STATUSES: SubState[] = ["active", "trialing", "past_due", "unpaid", "incomplete"];

// function normalizeStripe(status?: string | null): SubState {
//   switch (status) {
//     case "active":
//     case "trialing":
//     case "past_due":
//     case "unpaid":
//     case "incomplete":
//     case "canceled":
//       return status as SubState;
//     default:
//       return "none";
//   }
// }

// function dbStatusFromStripe(status?: string | null): DbSubState {
//   switch (status) {
//     case "active":
//     case "trialing":     // treat trialing as active
//       return "active";
//     case "past_due":
//     case "unpaid":       // treat unpaid as past_due
//       return "past_due";
//     case "incomplete":
//       return "incomplete";
//     case "canceled":
//     default:
//       return null;
//   }
// }

// /** Try to attach a Stripe customer to the user by email (if missing). */
// async function attachCustomerByEmailIfMissing(userId: string) {
//   const user = await User.findById(userId);
//   if (!user) throw new Error("User not found");
//   if (user.stripeCustomerId || !user.email) return user;

//   const list = await stripe.customers.list({ email: user.email, limit: 1 });
//   const existing = list.data[0];
//   if (existing?.id) {
//     user.stripeCustomerId = existing.id;
//     await user.save();
//   }
//   return user;
// }

// /** Reconcile and persist latest subscription state for this user. */
// export async function getSubscriptionState(userId: string) {
//   // 1) ensure we have a customer id if Stripe already knows this email
//   let user = await attachCustomerByEmailIfMissing(userId);

//   // 2) fast-path: DB marked active with a subscription id
//   if (user.subscriptionStatus === "active" && user.stripeSubscriptionId) {
//     return { status: "active" as SubState, user };
//   }

//   // 3) if we have a customer, ask Stripe for latest non-canceled subscription
//   if (user.stripeCustomerId) {
//     const subs = await stripe.subscriptions.list({
//       customer: user.stripeCustomerId,
//       status: "all",
//       limit: 10,
//     });

//     const latest = subs.data
//       .slice()
//       .sort((a, b) => (b.created || 0) - (a.created || 0))
//       .find((s) => s.status !== "canceled");

//     if (latest) {
//       const broad: SubState = normalizeStripe(latest.status);
//       const db: DbSubState  = dbStatusFromStripe(latest.status);

//       await User.findByIdAndUpdate(userId, {
//         stripeSubscriptionId: latest.id,
//         subscriptionStatus: db,
//       });

//       user = (await User.findById(userId))!;
//       return { status: broad, user };
//     }
//   }

//   // 4) fallback: interpret current DB value
//   const broadFromDb: SubState = normalizeStripe(user.subscriptionStatus || null);
//   return { status: broadFromDb, user };
// }

// export async function shouldBlockNewCheckout(userId: string) {
//   const { status } = await getSubscriptionState(userId);
//   return BLOCK_DUP_STATUSES.includes(status);
// }















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
