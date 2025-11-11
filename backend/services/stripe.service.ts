


// // backend/services/stripe.service.ts
// import Stripe from "stripe";
// import User from "../models/User";

// /** Pin an API version (or keep your project-wide one). */
// export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
//   // apiVersion: "2025-09-30.clover", // uncomment if you want to pin
// });

// /* ────────────────────────────────────────────────────────────────
//    Helpers
// ──────────────────────────────────────────────────────────────── */

// function ensureOrigin(url?: string, fallback = "http://localhost:3000") {
//   const origin = (url || fallback).trim();
//   if (!/^https?:\/\//i.test(origin)) {
//     throw new Error("FRONTEND_ORIGIN must include http:// or https://");
//   }
//   return origin.replace(/\/+$/, "");
// }

// async function findStripeCustomerByEmail(email?: string | null) {
//   if (!email) return null;
//   const list = await stripe.customers.list({ email, limit: 1 });
//   return list.data[0] || null;
// }

// /** Prefer an active/trialing subscription; else newest one (by created). */
// function pickBestSub(subs: Stripe.ApiList<Stripe.Subscription>["data"]) {
//   const preferred =
//     subs.find((s) => s.status === "active" || s.status === "trialing") ||
//     subs
//       .slice()
//       .sort((a, b) => (b.created || 0) - (a.created || 0))[0];

//   return preferred || null;
// }

// /** Decide app destination from a Stripe status. */
// export function decideNextFromStatus(
//   status?: string | null
// ): "dashboard" | "checkout" | "choose-plan" {
//   if (!status) return "choose-plan";
//   const s = status.toLowerCase();
//   if (s === "active" || s === "trialing") return "dashboard";
//   if (s === "incomplete" || s === "past_due" || s === "unpaid") return "checkout";
//   return "choose-plan";
// }

// /* ────────────────────────────────────────────────────────────────
//    Customer & Checkout
// ──────────────────────────────────────────────────────────────── */

// /** Ensure exactly one Stripe customer per app user. */
// export async function ensureCustomer(userId: string) {
//   const user = await User.findById(userId);
//   if (!user) throw new Error("User not found");

//   // Reuse stored ID if it exists & is valid
//   if (user.stripeCustomerId) {
//     try {
//       await stripe.customers.retrieve(user.stripeCustomerId);
//       return { user, customerId: user.stripeCustomerId };
//     } catch {
//       // fall through → we'll recreate/attach by email
//     }
//   }

//   // Try to link existing by email (avoid duplicates)
//   const existing = await findStripeCustomerByEmail((user.email || "").toLowerCase());
//   if (existing) {
//     user.stripeCustomerId = existing.id;
//     await user.save();
//     return { user, customerId: existing.id };
//   }

//   // Create new
//   const customer = await stripe.customers.create({
//     email: user.email || undefined,
//     name: user.fullName || undefined,
//     metadata: { appUserId: String(user._id) },
//   });

//   user.stripeCustomerId = customer.id;
//   await user.save();

//   return { user, customerId: customer.id };
// }

// /** Hosted Checkout session (optional if you use Elements). */
// export async function createCheckout(userId: string, priceId: string) {
//   const { user, customerId } = await ensureCustomer(userId);
//   const ORIGIN = ensureOrigin(process.env.FRONTEND_ORIGIN);

//   const session = await stripe.checkout.sessions.create(
//     {
//       mode: "subscription",
//       customer: customerId,
//       line_items: [{ price: priceId, quantity: 1 }],
//       allow_promotion_codes: true,
//       success_url: `${ORIGIN}/welcome?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${ORIGIN}/checkout?canceled=1&priceId=${encodeURIComponent(priceId)}`,
//       client_reference_id: String(user._id),
//       metadata: { userId: String(user._id) },
//       subscription_data: {
//         metadata: { userId: String(user._id), priceId },
//       },
//     },
//     {
//       idempotencyKey: `checkout:${user._id}:${priceId}`,
//     }
//   );

//   return session;
// }

// /* ────────────────────────────────────────────────────────────────
//    Subscription Lookup / Reconciliation (used by /api/me)
// ──────────────────────────────────────────────────────────────── */

// /** Return the “best” subscription for this customer (active/trialing preferred). */
// export async function getBestSubscriptionForCustomer(customerId: string) {
//   const subs = await stripe.subscriptions.list({
//     customer: customerId,
//     status: "all",
//     expand: ["data.items.data.price"],
//     limit: 20,
//   });
//   return pickBestSub(subs.data);
// }

// /**
//  * Reconcile a user against Stripe, trying in order:
//  * 1) existing stripeSubscriptionId → refresh from Stripe
//  * 2) stripeCustomerId → list + pick best sub
//  * 3) email → find customer → list + pick best sub
//  *
//  * Returns what you should persist on the user + drive routing with decideNextFromStatus().
//  */
// export async function reconcileUserFromStripe(userId: string) {
//   const user = await User.findById(userId);
//   if (!user) throw new Error("User not found");

//   let subscriptionId: string | null = user.stripeSubscriptionId || null;
//   let customerId: string | null = user.stripeCustomerId || null;
//   let status: string | null = user.subscriptionStatus || null;
//   let priceId: string | null = user.priceId || null;

//   // 1) Refresh by known subscription id
//   if (subscriptionId) {
//     try {
//       const sub = await stripe.subscriptions.retrieve(subscriptionId, {
//         expand: ["items.data.price"],
//       });
//       status = sub.status;
//       priceId = sub.items?.data?.[0]?.price?.id ?? null;
//       if (!customerId) {
//         customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id || null;
//       }
//       return { subscriptionId, customerId, status, priceId };
//     } catch {
//       // continue
//     }
//   }

//   // 2) Use known customer id
//   if (customerId) {
//     const best = await getBestSubscriptionForCustomer(customerId);
//     if (best) {
//       subscriptionId = best.id;
//       status = best.status;
//       priceId = best.items?.data?.[0]?.price?.id ?? null;
//       return { subscriptionId, customerId, status, priceId };
//     }
//   }

//   // 3) Last resort: find customer by email
//   const email = (user.email || "").toLowerCase().trim();
//   if (email) {
//     const existing = await findStripeCustomerByEmail(email);
//     if (existing) {
//       customerId = existing.id;
//       const best = await getBestSubscriptionForCustomer(existing.id);
//       if (best) {
//         subscriptionId = best.id;
//         status = best.status;
//         priceId = best.items?.data?.[0]?.price?.id ?? null;
//       }
//     }
//   }

//   return { subscriptionId, customerId, status, priceId };
// }

// /** A coarse helper if you only need to know “has any non-canceled subscription”. */
// export async function hasAnySubscription(customerId: string) {
//   const subs = await stripe.subscriptions.list({
//     customer: customerId,
//     status: "all",
//     limit: 20,
//   });
//   return subs.data.some((s) => s.status !== "canceled");
// }


















import Stripe from "stripe";
import User from "../models/User";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

async function findStripeCustomerByEmail(email?: string | null) {
  if (!email) return null;
  const list = await stripe.customers.list({ email, limit: 1 });
  return list.data[0] || null;
}

/** Ensure exactly one Stripe customer per app user. */
export async function ensureCustomer(userId: string) {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  // reuse if present
  if (user.stripeCustomerId) {
    try { await stripe.customers.retrieve(user.stripeCustomerId); return { user, customerId: user.stripeCustomerId }; }
    catch { /* fall through */ }
  }

  // link by email (avoid dupes)
  const existing = await findStripeCustomerByEmail((user.email || "").toLowerCase());
  if (existing) {
    user.stripeCustomerId = existing.id;
    await user.save();
    return { user, customerId: existing.id };
  }

  // create new
  const customer = await stripe.customers.create({
    email: user.email || undefined,
    name: user.fullName || undefined,
    metadata: { appUserId: String(user._id) },
  });
  user.stripeCustomerId = customer.id;
  await user.save();
  return { user, customerId: customer.id };
}

/** Prefer active/trialing; else most recent non-canceled; else null */
function pickBestSub(subs: Stripe.Subscription[]) {
  return subs.find((s) => s.status === "active" || s.status === "trialing")
      || subs.filter(s => s.status !== "canceled")
             .sort((a, b) => (b.created || 0) - (a.created || 0))[0]
      || null;
}

/** Lookup best subscription for a customer */
export async function getBestSubscriptionForCustomer(customerId: string) {
  const subs = await stripe.subscriptions.list({
    customer: customerId,
    status: "all",
    expand: ["data.items.data.price"],
    limit: 20,
  });
  return pickBestSub(subs.data);
}

/** Decide app destination from Stripe status */
export function decideNextFromStatus(status?: string | null): "dashboard" | "checkout" | "choose-plan" {
  if (!status) return "choose-plan";
  const s = status.toLowerCase();
  if (s === "active" || s === "trialing") return "dashboard";
  if (s === "incomplete" || s === "past_due" || s === "unpaid") return "checkout";
  return "choose-plan";
}

/** Reconcile a user against Stripe and return subscription/customer/price/status */
export async function reconcileUserFromStripe(userId: string) {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  let subscriptionId = user.stripeSubscriptionId || null;
  let customerId = user.stripeCustomerId || null;
  let status = user.subscriptionStatus || null;
  let priceId = user.priceId || null;

  // 1) refresh by known subscription id
  if (subscriptionId) {
    try {
      const sub = await stripe.subscriptions.retrieve(subscriptionId, { expand: ["items.data.price"] });
      status = sub.status as "active" | "incomplete" | "past_due" | null;
      priceId = sub.items?.data?.[0]?.price?.id ?? null;
      if (!customerId) customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id || null;
      return { subscriptionId, customerId, status, priceId };
    } catch { /* continue */ }
  }

  // 2) by customer id
  if (customerId) {
    const best = await getBestSubscriptionForCustomer(customerId);
    if (best) {
      subscriptionId = best.id;
      status = best.status as "active" | "incomplete" | "past_due" | null;
      priceId = best.items?.data?.[0]?.price?.id ?? null;
      return { subscriptionId, customerId, status, priceId };
    }
  }

  // 3) by email
  const email = (user.email || "").toLowerCase().trim();
  if (email) {
    const existing = await findStripeCustomerByEmail(email);
    if (existing) {
      customerId = existing.id;
      const best = await getBestSubscriptionForCustomer(existing.id);
      if (best) {
        subscriptionId = best.id;
        status = best.status as "active" | "incomplete" | "past_due" | null;
        priceId = best.items?.data?.[0]?.price?.id ?? null;
      }
    }
  }

  return { subscriptionId, customerId, status, priceId };
}
