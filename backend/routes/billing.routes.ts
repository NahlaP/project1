





// // backend/routes/billing.routes.ts
// import { Router } from "express";
// import { requireAuth } from "../middleware/auth.middleware";
// import { optionalAuth } from "../middleware/optionalAuth";
// import { createCheckout, stripe } from "../services/stripe.service";
// import { getSubscriptionState } from "../services/subscription.state";
// import User from "../models/User";

// const r = Router();

// /**
//  * Create a Stripe Checkout session for a subscription.
//  * - Blocks duplicate purchases if the user already has an ACTIVE sub (409/SUB_ACTIVE)
//  * - Marks user.subscriptionStatus = "incomplete" while the session is open
//  * - Relies on webhook to flip to "active" on checkout.session.completed
//  */
// r.post("/checkout", requireAuth, async (req: any, res) => {
//   try {
//     const { priceId } = req.body || {};
//     if (!priceId || typeof priceId !== "string") {
//       return res.status(400).json({ error: "Missing priceId" });
//     }

//     // Strong duplicate guard:
//     // 1) Trust DB if active
//     // 2) Reconcile with Stripe (getSubscriptionState does this)
//     const { status } = await getSubscriptionState(req.user.userId);

//     if (status === "active") {
//       return res.status(409).json({
//         error: "You already have an active subscription.",
//         code: "SUB_ACTIVE",
//       });
//     }

//     // OK to retry if incomplete / past_due / none
//     const session = await createCheckout(req.user.userId, priceId);

//     // Keep a breadcrumb of what they attempted; webhook will finalize status
//     await User.findByIdAndUpdate(req.user.userId, {
//       priceId,
//       subscriptionStatus: "incomplete",
//     }).lean();

//     return res.json({ url: session.url });
//   } catch (e: any) {
//     // Surface useful error messages (e.g., invalid priceId, bad config, etc.)
//     const msg = e?.message || "Checkout failed";
//     console.error("🛑 /billing/checkout error:", msg);
//     return res.status(500).json({ error: msg });
//   }
// });

// /**
//  * Retrieve a Checkout Session (used by /welcome?session_id=...).
//  * Allows unauthenticated access (customer may land here from Stripe),
//  * but expands subscription/customer so the UI can show details.
//  */
// r.get("/session/:id", optionalAuth, async (req: any, res) => {
//   try {
//     const s = await stripe.checkout.sessions.retrieve(req.params.id, {
//       expand: ["subscription", "customer"],
//     });
//     return res.json(s);
//   } catch (e: any) {
//     const msg = e?.message || "Invalid session id";
//     return res.status(400).json({ error: msg });
//   }
// });

// export default r;





// // backend/routes/billing.routes.ts
// import { Router } from "express";
// import Stripe from "stripe";
// import { requireAuth } from "../middleware/auth.middleware";
// import { optionalAuth } from "../middleware/optionalAuth";
// import { stripe, createCheckout } from "../services/stripe.service";
// import { getSubscriptionState } from "../services/subscription.state";
// import User from "../models/User";

// const r = Router();

// /* ----------------------- helper: ensure single customer ---------------------- */
// async function ensureCustomer(userId: string): Promise<{ customerId: string }> {
//   const u = await User.findById(userId).lean();
//   if (!u) throw new Error("User not found");

//   if (u.stripeCustomerId) {
//     // Verify it still exists (avoid stale ids)
//     try {
//       await stripe.customers.retrieve(u.stripeCustomerId);
//       return { customerId: u.stripeCustomerId };
//     } catch {
//       /* fall through and recreate */
//     }
//   }

//   const customer = await stripe.customers.create({
//     email: (u as any)?.email || undefined,
//     metadata: { userId: String(userId) },
//   });

//   await User.findByIdAndUpdate(userId, { stripeCustomerId: customer.id });
//   return { customerId: customer.id };
// }

// /* ------------------------- 1) Checkout (hosted page) ------------------------ */
// /**
//  * Create a Stripe Checkout session for a subscription.
//  * - Blocks duplicate purchases if ACTIVE (409/SUB_ACTIVE)
//  * - Marks status "incomplete"; webhook will flip to "active" on success
//  * Response: { url }
//  */
// r.post("/checkout", requireAuth, async (req: any, res) => {
//   try {
//     const { priceId } = req.body || {};
//     if (!priceId || typeof priceId !== "string") {
//       return res.status(400).json({ error: "Missing priceId" });
//     }

//     // Duplicate-guard
//     const { status } = await getSubscriptionState(req.user.userId);
//     if (status === "active") {
//       return res.status(409).json({
//         error: "You already have an active subscription.",
//         code: "SUB_ACTIVE",
//       });
//     }

//     const session = await createCheckout(req.user.userId, priceId);

//     await User.findByIdAndUpdate(req.user.userId, {
//       priceId,
//       subscriptionStatus: "incomplete",
//     }).lean();

//     return res.json({ url: session.url });
//   } catch (e: any) {
//     console.error("🛑 /billing/checkout error:", e?.message || e);
//     return res.status(500).json({ error: e?.message || "Checkout failed" });
//   }
// });

// /* -------------------- 2) Elements (custom UI) – start ----------------------- */
// /**
//  * Start a subscription in "incomplete" state and return a client secret
//  * for your Payment Element to confirm. Prefers PaymentIntent (immediate
//  * charge) and falls back to SetupIntent (trials/no upfront charge).
//  *
//  * Request:  { priceId: string }
//  * Response: {
//  *   clientSecret: string,
//  *   secretType: "payment" | "setup",
//  *   subscriptionId: string
//  * }
//  */
// r.post("/elements/start", requireAuth, async (req: any, res) => {
//   try {
//     const { priceId } = req.body || {};
//     if (!priceId || typeof priceId !== "string") {
//       return res.status(400).json({ error: "Missing priceId" });
//     }

//     // Duplicate-guard
//     const { status } = await getSubscriptionState(req.user.userId);
//     if (status === "active") {
//       return res.status(409).json({
//         error: "You already have an active subscription.",
//         code: "SUB_ACTIVE",
//       });
//     }

//     // Single customer per user
//     const { customerId } = await ensureCustomer(req.user.userId);

//     // Create "incomplete" subscription so we can collect payment with PE
//     const sub = await stripe.subscriptions.create({
//       customer: customerId,
//       items: [{ price: priceId }],
//       payment_behavior: "default_incomplete",
//       payment_settings: { save_default_payment_method: "on_subscription" },
//       metadata: { userId: String(req.user.userId), priceId },
//       expand: ["latest_invoice.payment_intent", "pending_setup_intent"],
//     });

//     // We want a clientSecret for your Payment Element
//     let clientSecret: string | null = null;
//     let secretType: "payment" | "setup" | null = null;

//     // Prefer PI (immediate charge)
//     type InvoiceWithPI = Stripe.Invoice & {
//       payment_intent?: string | Stripe.PaymentIntent | null;
//     };

//     if (sub.latest_invoice) {
//       const invoiceId =
//         typeof sub.latest_invoice === "string"
//           ? sub.latest_invoice
//           : sub.latest_invoice.id;

//       // Force-explicit retrieve to make TS happy and to be robust
//       const inv = (await stripe.invoices.retrieve(invoiceId, {
//         expand: ["payment_intent"],
//       })) as unknown as InvoiceWithPI;

//       const rawPi = inv.payment_intent;
//       if (rawPi && typeof rawPi !== "string") {
//         clientSecret = rawPi.client_secret ?? null;
//         secretType = "payment";
//       }
//     }

//     // Fallback: SetupIntent (trials / no immediate charge)
//     if (!clientSecret) {
//       const si = sub.pending_setup_intent;
//       if (si && typeof si !== "string") {
//         clientSecret = si.client_secret ?? null;
//         secretType = "setup";
//       }
//     }

//     if (!clientSecret) {
//       return res
//         .status(500)
//         .json({ error: "Stripe did not return a clientSecret" });
//     }

//     // Breadcrumb: UI will confirm; webhook will finalize to "active"
//     await User.findByIdAndUpdate(req.user.userId, {
//       priceId,
//       stripeSubscriptionId: sub.id,
//       subscriptionStatus: "incomplete",
//     }).lean();

//     return res.json({
//       clientSecret,
//       secretType, // "payment" | "setup"
//       subscriptionId: sub.id,
//     });
//   } catch (e: any) {
//     console.error("🛑 /billing/elements/start error:", e?.message || e);
//     return res.status(500).json({ error: e?.message || "Failed to start" });
//   }
// });

// /* --------------------- 3) Inspect a Checkout Session ------------------------ */
// /**
//  * Used by /welcome?session_id=... to show a success/failure state.
//  * Allows unauthenticated access (user arrives from Stripe).
//  */
// r.get("/session/:id", optionalAuth, async (req: any, res) => {
//   try {
//     const s = await stripe.checkout.sessions.retrieve(req.params.id, {
//       expand: ["subscription", "customer"],
//     });
//     return res.json(s);
//   } catch (e: any) {
//     return res.status(400).json({ error: e?.message || "Invalid session id" });
//   }
// });

// export default r;
