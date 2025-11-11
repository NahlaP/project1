


// // backend/routes/me.routes.ts
// import { Router, Request } from "express";
// import { requireAuth } from "../middleware/auth.middleware";
// import User from "../models/User";
// import Stripe from "stripe";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-09-30.clover" });

// type SubState = "none" | "incomplete" | "active" | "trialing" | "past_due" | "unpaid" | "canceled";
// type DbSubState = "incomplete" | "active" | "past_due" | null;
// type Authed = Request & { user?: { userId: string } };

// const LIVE: SubState[] = ["active", "trialing", "past_due", "unpaid"];

// const normalizeStripe = (s?: string | null): SubState => {
//   switch (s) {
//     case "active":
//     case "trialing":
//     case "past_due":
//     case "unpaid":
//     case "incomplete":
//     case "canceled":
//       return s;
//     default:
//       return "none";
//   }
// };
// const dbStatusFromStripe = (s?: string | null): DbSubState => {
//   switch (s) {
//     case "active":
//     case "trialing":
//       return "active";
//     case "past_due":
//     case "unpaid":
//       return "past_due";
//     case "incomplete":
//       return "incomplete";
//     default:
//       return null; // canceled/none → null
//   }
// };

// const r = Router();

// /**
//  * GET /api/me
//  * Decides next: "dashboard" | "checkout" | "choose-plan"
//  * and self-heals user’s subscription fields from Stripe.
//  */
// r.get("/", requireAuth, async (req: Authed, res) => {
//   try {
//     const userId = req.user!.userId;
//     const user = await User.findById(userId).lean();
//     if (!user) return res.status(401).json({ error: "No user" });

//     // -------- 1) FAST PATH (no Stripe call) for any LIVE status ----------
//     if (user.stripeSubscriptionId && user.subscriptionStatus && ["active", "past_due"].includes(user.subscriptionStatus)) {
//       return res.json({
//         next: "dashboard",
//         user: {
//           id: user._id,
//           email: user.email,
//           subscriptionStatus: user.subscriptionStatus,
//           stripeCustomerId: user.stripeCustomerId || null,
//           stripeSubscriptionId: user.stripeSubscriptionId || null,
//         },
//       });
//     }

//     // -------- 2) Reconcile by subscription id (best source of truth) -----
//     if (user.stripeSubscriptionId) {
//       try {
//         const sub = await stripe.subscriptions.retrieve(String(user.stripeSubscriptionId), {
//           expand: ["items.data.price", "customer"],
//         });

//         const broad = normalizeStripe(sub.status);
//         const db = dbStatusFromStripe(sub.status);

//         const priceId = sub.items?.data?.[0]?.price?.id;
//         const cusId =
//           typeof sub.customer === "string" ? sub.customer : (sub.customer?.id as string | undefined);

//         await User.findByIdAndUpdate(userId, {
//           ...(cusId ? { stripeCustomerId: cusId } : {}),
//           ...(priceId ? { priceId } : {}),
//           subscriptionStatus: db,
//         });

//         if (LIVE.includes(broad)) return res.json({ next: "dashboard" });
//         if (broad === "incomplete") return res.json({ next: "checkout" });

//         // canceled/none → clear fields and fall through to choose-plan
//         await User.findByIdAndUpdate(userId, {
//           $unset: { stripeSubscriptionId: 1, subscriptionStatus: 1 },
//         });
//       } catch (e) {
//         // subscription id invalid/deleted → clear and continue
//         await User.findByIdAndUpdate(userId, { $unset: { stripeSubscriptionId: 1, subscriptionStatus: 1 } });
//       }
//     }

//     // -------- 3) Reconcile by customer id (if present) ------------------
//     if (user.stripeCustomerId) {
//       const subs = await stripe.subscriptions.list({
//         customer: user.stripeCustomerId,
//         status: "all",
//         limit: 10,
//         expand: ["data.items.data.price"],
//       });

//       const latest = subs.data
//         .slice()
//         .sort((a, b) => (b.created || 0) - (a.created || 0))
//         .find((s) => s.status !== "canceled");

//       if (latest) {
//         const broad = normalizeStripe(latest.status);
//         const db = dbStatusFromStripe(latest.status);
//         const priceId = latest.items?.data?.[0]?.price?.id;

//         await User.findByIdAndUpdate(userId, {
//           stripeSubscriptionId: latest.id,
//           ...(priceId ? { priceId } : {}),
//           subscriptionStatus: db,
//         });

//         if (LIVE.includes(broad)) return res.json({ next: "dashboard" });
//         if (broad === "incomplete") return res.json({ next: "checkout" });
//       }
//     }

//     // -------- 4) Final fallback -----------------------------------------
//     return res.json({ next: "choose-plan" });
//   } catch (e) {
//     console.error("[/api/me] error:", e);
//     // Be conservative: force plan selection on unexpected errors
//     return res.json({ next: "choose-plan" });
//   }
// });

// export default r;












