

// // ogog

// // backend/routes/billing.elements.routes.ts
// import { Router, Request } from "express";
// import Stripe from "stripe";
// import crypto from "crypto";
// import User from "../models/User";

// const SECRET = process.env.STRIPE_SECRET_KEY!;
// if (!SECRET) throw new Error("STRIPE_SECRET_KEY missing");
// const stripe = new Stripe(SECRET, { apiVersion: "2025-09-30.clover" });

// const r = Router();

// /* ----------------------------- Types ----------------------------- */
// type AuthedUser = { userId: string; email?: string; name?: string };
// type ReqWithUser = Request & { user?: AuthedUser };

// const isStripeObj = (x: unknown, type: string): boolean =>
//   !!x && typeof x === "object" && (x as any).object === type;

// const normStatus = (s?: string | null) =>
//   s === "active" || s === "trialing"
//     ? "active"
//     : s === "past_due"
//     ? "past_due"
//     : s === "incomplete" || s === "incomplete_expired"
//     ? "incomplete"
//     : null;

// function makeIdempoKey(prefix: string, params: unknown) {
//   const h = crypto.createHash("sha256").update(JSON.stringify(params)).digest("hex").slice(0, 16);
//   return `${prefix}:${h}`;
// }

// async function ensureCustomerId(email?: string, name?: string): Promise<string> {
//   const e = (email || "").trim();
//   if (e) {
//     const existing = await stripe.customers.list({ email: e, limit: 1 });
//     if (existing.data[0]) return existing.data[0].id;
//     const created = await stripe.customers.create({ email: e, name: name || undefined });
//     return created.id;
//   }
//   const created = await stripe.customers.create({});
//   return created.id;
// }

// /* ---------- Start Elements flow: return PI *or* SI client secret ---------- */
// r.post("/elements/start", async (req: ReqWithUser, res) => {
//   try {
//     const {
//       priceId,
//       email: emailFromBody,
//       country,
//       address1,
//       city,
//       postalCode,
//       name: nameFromBody,
//     } = (req.body || {}) as {
//       priceId?: string;
//       email?: string;
//       country?: string;
//       address1?: string;
//       city?: string;
//       postalCode?: string;
//       name?: string;
//     };

//     if (!priceId) return res.status(400).json({ error: "Missing priceId" });

//     const email = req.user?.email || emailFromBody || "";
//     const name = req.user?.name || nameFromBody || undefined;
//     const userId = req.user?.userId || "anon";

//     // 1) Ensure Stripe customer
//     const customerId = await ensureCustomerId(email, name);

//     // Persist customer id to user (soft-fail if anything)
//     if (userId !== "anon") {
//       try {
//         await User.findByIdAndUpdate(userId, { stripeCustomerId: customerId }, { new: true });
//       } catch {}
//     }

//     // Optional: add address so automatic tax can work
//     const hasAddress = !!country;
//     if (hasAddress) {
//       await stripe.customers.update(customerId, {
//         name,
//         address: {
//           country: country!.toUpperCase(),
//           line1: address1 || undefined,
//           city: city || undefined,
//           postal_code: postalCode || undefined,
//         },
//       });
//     }

//     // 2) Create subscription (default_incomplete so we can confirm on the client)
//     const createParams: Stripe.SubscriptionCreateParams = {
//       customer: customerId,
//       items: [{ price: priceId, quantity: 1 }],
//       payment_behavior: "default_incomplete",
//       collection_method: "charge_automatically",
//       payment_settings: {
//         save_default_payment_method: "on_subscription",
//         payment_method_types: ["card"],
//       },
//       automatic_tax: { enabled: hasAddress },
//       expand: ["latest_invoice", "latest_invoice.payment_intent", "pending_setup_intent"],
//     };

//     const idempotencyKey = makeIdempoKey(`elements-start:${userId}`, createParams);
//     const createdSub = await stripe.subscriptions.create(createParams, { idempotencyKey });

//     // Re-retrieve to be sure expand is present on some accounts
//     const sub = await stripe.subscriptions.retrieve(createdSub.id, {
//       expand: ["latest_invoice", "latest_invoice.payment_intent", "pending_setup_intent"],
//     });

//     // Persist subscription meta to user (including normalized status + picked price)
//     if (userId !== "anon") {
//       try {
//         await User.findByIdAndUpdate(
//           userId,
//           {
//             stripeSubscriptionId: sub.id,
//             subscriptionStatus: normStatus(sub.status),
//             priceId,
//           },
//           { new: true }
//         );
//       } catch {}
//     }

//     // 3) Try to get a PaymentIntent client_secret (charge now)
//     let pi: Stripe.PaymentIntent | null = null;
//     let piId: string | null = null;

//     const latest = sub.latest_invoice;

//     if (latest && typeof latest !== "string" && isStripeObj(latest, "invoice")) {
//       const inv = latest as Stripe.Invoice;
//       const maybePI = (inv as any).payment_intent;
//       if (maybePI) {
//         if (typeof maybePI === "string") piId = maybePI;
//         else if (isStripeObj(maybePI, "payment_intent")) pi = maybePI as Stripe.PaymentIntent;
//       }
//     } else if (typeof latest === "string") {
//       const inv = (await stripe.invoices.retrieve(latest, { expand: ["payment_intent"] })) as any;
//       const maybePI = inv.payment_intent;
//       if (maybePI) {
//         if (typeof maybePI === "string") piId = maybePI as string;
//         else if (isStripeObj(maybePI, "payment_intent")) pi = maybePI as Stripe.PaymentIntent;
//       }
//     }

//     if (!pi && piId) {
//       pi = await stripe.paymentIntents.retrieve(piId);
//     }

//     if (pi?.client_secret) {
//       return res.json({
//         mode: "payment",
//         subscriptionId: sub.id,
//         customerId,
//         clientSecret: pi.client_secret,
//       });
//     }

//     // 4) Fallback: no PI → give a SetupIntent to collect card now, charge later
//     let si: Stripe.SetupIntent | null = null;
//     let siId: string | null = null;

//     const pendingSI = (sub as any).pending_setup_intent;
//     if (pendingSI) {
//       if (typeof pendingSI === "string") siId = pendingSI;
//       else if (isStripeObj(pendingSI, "setup_intent")) si = pendingSI as Stripe.SetupIntent;
//     }
//     if (!si && siId) si = await stripe.setupIntents.retrieve(siId);
//     if (!si) {
//       si = await stripe.setupIntents.create({
//         customer: customerId,
//         usage: "off_session",
//         payment_method_types: ["card"],
//       });
//     }

//     if (!si?.client_secret) throw new Error("Stripe did not return a clientSecret");

//     return res.json({
//       mode: "setup",
//       subscriptionId: sub.id,
//       customerId,
//       clientSecret: si.client_secret,
//     });
//   } catch (e: any) {
//     console.error("[/api/billing/elements/start] error:", e);
//     res.status(500).json({ error: e?.message || "Internal error" });
//   }
// });

// /* Optional helper: read a subscription */
// r.get("/elements/subscriptions/:id", async (req, res) => {
//   try {
//     const s = await stripe.subscriptions.retrieve(req.params.id);
//     res.json(s);
//   } catch (e: any) {
//     res.status(500).json({ error: e?.message || "Internal error" });
//   }
// });

// export default r;



















// // backend/routes/billing.elements.routes.ts
// import { Router, Request } from "express";
// import Stripe from "stripe";
// import crypto from "crypto";
// import User from "../models/User";

// const SECRET = process.env.STRIPE_SECRET_KEY!;
// if (!SECRET) throw new Error("STRIPE_SECRET_KEY missing");

// const stripe = new Stripe(SECRET, { apiVersion: "2024-06-20" });
// const r = Router();

// /* ----------------------------- Types ----------------------------- */
// type AuthedUser = { userId: string; email?: string; name?: string };
// type ReqWithUser = Request & { user?: AuthedUser };

// const isStripeObj = (x: unknown, type: string): boolean =>
//   !!x && typeof x === "object" && (x as any).object === type;

// const normStatus = (s?: string | null) =>
//   s === "active" || s === "trialing"
//     ? "active"
//     : s === "past_due"
//     ? "past_due"
//     : s === "incomplete" || s === "incomplete_expired"
//     ? "incomplete"
//     : null;

// function makeIdempoKey(prefix: string, params: unknown) {
//   const h = crypto
//     .createHash("sha256")
//     .update(JSON.stringify(params))
//     .digest("hex")
//     .slice(0, 16);
//   return `${prefix}:${h}`;
// }

// /* -------------------------- Helpers -------------------------- */
// /** Require an email. Never create anonymous customers. */
// async function ensureCustomerId(email: string, name?: string): Promise<string> {
//   const e = (email || "").trim();
//   if (!e) throw new Error("Email is required");
//   const existing = await stripe.customers.list({ email: e, limit: 1 });
//   if (existing.data[0]) return existing.data[0].id;
//   const created = await stripe.customers.create({ email: e, name: name || undefined });
//   return created.id;
// }

// /* ---------- Start Elements flow: return PI *or* SI client secret ---------- */
// /**
//  * POST /api/billing/elements/start
//  * body: { priceId: string, email?: string, name?: string, country?, address1?, city?, postalCode? }
//  * returns: { mode: "payment"|"setup", subscriptionId, customerId, clientSecret }
//  */
// r.post("/elements/start", async (req: ReqWithUser, res) => {
//   try {
//     const {
//       priceId,
//       email: emailFromBody,
//       name: nameFromBody,
//       country,
//       address1,
//       city,
//       postalCode,
//     } = (req.body || {}) as {
//       priceId?: string;
//       email?: string;
//       name?: string;
//       country?: string;
//       address1?: string;
//       city?: string;
//       postalCode?: string;
//     };

//     if (!priceId) return res.status(400).json({ error: "Missing priceId" });

//     const email = (req.user?.email || emailFromBody || "").trim();
//     const name = (req.user?.name || nameFromBody || "").trim() || undefined;
//     if (!email) return res.status(400).json({ error: "Email is required" });

//     const userId = req.user?.userId || "anon";

//     // 1) Ensure Stripe customer (with email) and update basic fields
//     const customerId = await ensureCustomerId(email, name);
//     await stripe.customers.update(customerId, {
//       email,
//       name,
//       ...(country
//         ? {
//             address: {
//               country: country!.toUpperCase(),
//               line1: address1 || undefined,
//               city: city || undefined,
//               postal_code: postalCode || undefined,
//             },
//           }
//         : {}),
//     });

//     // Persist customer id to user (best effort)
//     if (userId !== "anon") {
//       try {
//         await User.findByIdAndUpdate(userId, { stripeCustomerId: customerId });
//       } catch {}
//     }

//     const hasAddress = !!country;

//     // 2) Create subscription (default_incomplete → confirm on client)
//     const createParams: Stripe.SubscriptionCreateParams = {
//       customer: customerId,
//       items: [{ price: priceId, quantity: 1 }],
//       payment_behavior: "default_incomplete",
//       collection_method: "charge_automatically",
//       payment_settings: {
//         save_default_payment_method: "on_subscription",
//         payment_method_types: ["card"],
//       },
//       automatic_tax: { enabled: hasAddress },
//       metadata: { userId, priceId },
//       expand: ["latest_invoice", "latest_invoice.payment_intent", "pending_setup_intent"],
//     };

//     const idempotencyKey = makeIdempoKey(`elements-start:${userId}`, createParams);
//     const createdSub = await stripe.subscriptions.create(createParams, { idempotencyKey });

//     // Re-retrieve with expands for safety
//     const sub = await stripe.subscriptions.retrieve(createdSub.id, {
//       expand: ["latest_invoice", "latest_invoice.payment_intent", "pending_setup_intent"],
//     });

//     // Persist subscription meta on user
//     if (userId !== "anon") {
//       try {
//         await User.findByIdAndUpdate(
//           userId,
//           { stripeSubscriptionId: sub.id, subscriptionStatus: normStatus(sub.status), priceId },
//           { new: true }
//         );
//       } catch {}
//     }

//     // 3) Prefer PaymentIntent client_secret (first invoice payment)
//     let pi: Stripe.PaymentIntent | null = null;
//     let piId: string | null = null;

//     const latest = sub.latest_invoice;
//     if (latest && typeof latest !== "string" && isStripeObj(latest, "invoice")) {
//       const inv = latest as Stripe.Invoice;
//       const maybePI = (inv as any).payment_intent;
//       if (maybePI) {
//         if (typeof maybePI === "string") piId = maybePI;
//         else if (isStripeObj(maybePI, "payment_intent")) pi = maybePI as Stripe.PaymentIntent;
//       }
//     } else if (typeof latest === "string") {
//       const inv = (await stripe.invoices.retrieve(latest, {
//         expand: ["payment_intent"],
//       })) as any;
//       const maybePI = inv.payment_intent;
//       if (maybePI) {
//         if (typeof maybePI === "string") piId = maybePI as string;
//         else if (isStripeObj(maybePI, "payment_intent")) pi = maybePI as Stripe.PaymentIntent;
//       }
//     }

//     if (!pi && piId) pi = await stripe.paymentIntents.retrieve(piId);
//     if (pi?.client_secret) {
//       return res.json({
//         mode: "payment",
//         subscriptionId: sub.id,
//         customerId,
//         clientSecret: pi.client_secret,
//       });
//     }

//     // 4) Fallback: SetupIntent for payment method collection
//     let si: Stripe.SetupIntent | null = null;
//     let siId: string | null = null;

//     const pendingSI = (sub as any).pending_setup_intent;
//     if (pendingSI) {
//       if (typeof pendingSI === "string") siId = pendingSI;
//       else if (isStripeObj(pendingSI, "setup_intent")) si = pendingSI as Stripe.SetupIntent;
//     }
//     if (!si && siId) si = await stripe.setupIntents.retrieve(siId);
//     if (!si)
//       si = await stripe.setupIntents.create({
//         customer: customerId,
//         usage: "off_session",
//         payment_method_types: ["card"],
//       });

//     if (!si?.client_secret) throw new Error("Stripe did not return a clientSecret");

//     return res.json({
//       mode: "setup",
//       subscriptionId: sub.id,
//       customerId,
//       clientSecret: si.client_secret,
//     });
//   } catch (e: any) {
//     console.error("[/api/billing/elements/start] error:", e);
//     res.status(500).json({ error: e?.message || "Internal error" });
//   }
// });

// export default r;





// backend/routes/billing.elements.routes.ts
import { Router, Request } from "express";
import Stripe from "stripe";
import crypto from "crypto";
import User from "../models/User";

const SECRET = process.env.STRIPE_SECRET_KEY!;
if (!SECRET) throw new Error("STRIPE_SECRET_KEY missing");

const stripe = new Stripe(SECRET, { apiVersion: "2024-06-20" });
const r = Router();

/* ----------------------------- Types ----------------------------- */
type AuthedUser = { userId: string; email?: string; name?: string };
type ReqWithUser = Request & { user?: AuthedUser };

const isStripeObj = (x: unknown, type: string): boolean =>
  !!x && typeof x === "object" && (x as any).object === type;

const normStatus = (s?: string | null) =>
  s === "active" || s === "trialing"
    ? "active"
    : s === "past_due"
    ? "past_due"
    : s === "incomplete" || s === "incomplete_expired"
    ? "incomplete"
    : null;

function makeIdempoKey(prefix: string, params: unknown) {
  const h = crypto
    .createHash("sha256")
    .update(JSON.stringify(params))
    .digest("hex")
    .slice(0, 24);
  return `${prefix}:${h}`;
}

/* -------------------------- Helpers -------------------------- */
async function getOrCreateCustomer({
  userId,
  email,
  name,
}: {
  userId?: string;
  email: string;
  name?: string;
}): Promise<string> {
  // 1) If we already stored a customer on the user, reuse it
  if (userId) {
    try {
      const u = await User.findById(userId).lean();
      if (u?.stripeCustomerId) {
        return String(u.stripeCustomerId);
      }
    } catch {}
  }

  // 2) Try to find by email
  const e = (email || "").trim();
  if (!e) throw new Error("Email is required");
  const existing = await stripe.customers.list({ email: e, limit: 1 });
  const cust = existing.data[0] ?? (await stripe.customers.create({ email: e, name: name || undefined }));
  // Best-effort persist
  if (userId) {
    try {
      await User.findByIdAndUpdate(userId, { stripeCustomerId: cust.id }, { new: true });
    } catch {}
  }
  return cust.id;
}

async function findExistingSub(customerId: string) {
  const subs = await stripe.subscriptions.list({ customer: customerId, status: "all", limit: 100 });
  // Prefer “needs action” / “incomplete” first so we can return its PI/SI
  const ordered = subs.data.sort((a, b) => {
    const rank = (s: string) =>
      s === "incomplete" ? 0 :
      s === "past_due" ? 1 :
      s === "trialing" ? 2 :
      s === "active" ? 3 :
      4;
    return rank(a.status) - rank(b.status);
  });
  return ordered.find(
    (s) => ["active", "trialing", "past_due", "incomplete", "unpaid"].includes(s.status)
  ) || null;
}

async function extractClientSecretFromSub(sub: Stripe.Subscription) {
  // Try PaymentIntent on latest invoice
  const latest = sub.latest_invoice;
  if (latest && typeof latest !== "string" && isStripeObj(latest, "invoice")) {
    const inv = latest as Stripe.Invoice;
    const piAny = (inv as any).payment_intent;
    if (piAny) {
      if (typeof piAny === "string") {
        const pi = await stripe.paymentIntents.retrieve(piAny);
        if (pi.client_secret) return { mode: "payment" as const, clientSecret: pi.client_secret };
      } else if (isStripeObj(piAny, "payment_intent")) {
        const pi = piAny as Stripe.PaymentIntent;
        if (pi.client_secret) return { mode: "payment" as const, clientSecret: pi.client_secret };
      }
    }
  } else if (typeof latest === "string") {
    const inv = (await stripe.invoices.retrieve(latest, { expand: ["payment_intent"] })) as any;
    const pi = inv.payment_intent;
    if (pi?.client_secret) return { mode: "payment" as const, clientSecret: pi.client_secret };
  }

  // Fallback: SetupIntent (for “incomplete” without a PI)
  const pending = (sub as any).pending_setup_intent;
  if (pending) {
    if (typeof pending === "string") {
      const si = await stripe.setupIntents.retrieve(pending);
      if (si.client_secret) return { mode: "setup" as const, clientSecret: si.client_secret };
    } else if (isStripeObj(pending, "setup_intent")) {
      const si = pending as Stripe.SetupIntent;
      if (si.client_secret) return { mode: "setup" as const, clientSecret: si.client_secret };
    }
  }

  return null;
}

/* ---------- Start Elements flow: return PI *or* SI client secret ---------- */
/**
 * POST /api/billing/elements/start
 * body: { priceId: string, email?: string, name?: string, country?, address1?, city?, postalCode? }
 * returns: { mode: "payment"|"setup", subscriptionId, customerId, clientSecret? }
 */
r.post("/elements/start", async (req: ReqWithUser, res) => {
  try {
    const {
      priceId,
      email: emailFromBody,
      name: nameFromBody,
      country,
      address1,
      city,
      postalCode,
    } = (req.body || {}) as {
      priceId?: string;
      email?: string;
      name?: string;
      country?: string;
      address1?: string;
      city?: string;
      postalCode?: string;
    };

    if (!priceId) return res.status(400).json({ error: "Missing priceId" });

    const email = (req.user?.email || emailFromBody || "").trim();
    const name = (req.user?.name || nameFromBody || "").trim() || undefined;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const userId = req.user?.userId;

    // 1) Ensure & persist Customer
    const customerId = await getOrCreateCustomer({ userId, email, name });

    // Keep customer fields fresh (address enables automatic tax if you want it)
    await stripe.customers.update(customerId, {
      email,
      name,
      ...(country
        ? {
            address: {
              country: country!.toUpperCase(),
              line1: address1 || undefined,
              city: city || undefined,
              postal_code: postalCode || undefined,
            },
          }
        : {}),
    });

    // 2) Reuse existing subscription if any
    const existing = await findExistingSub(customerId);
    if (existing) {
      // If already active/trialing → nothing to pay; return without client secret
      if (["active", "trialing"].includes(existing.status)) {
        if (userId) {
          try {
            await User.updateOne(
              { _id: userId },
              { $set: { stripeSubscriptionId: existing.id, subscriptionStatus: "active", priceId } }
            );
          } catch {}
        }
        return res.json({
          mode: "payment",
          subscriptionId: existing.id,
          customerId,
          clientSecret: null,
        });
      }

      // If incomplete/past_due/unpaid → send back the PI/SI to finish
      const sec = await extractClientSecretFromSub(
        await stripe.subscriptions.retrieve(existing.id, {
          expand: ["latest_invoice", "latest_invoice.payment_intent", "pending_setup_intent"],
        })
      );
      if (sec?.clientSecret) {
        if (userId) {
          try {
            await User.updateOne(
              { _id: userId },
              { $set: { stripeSubscriptionId: existing.id, subscriptionStatus: normStatus(existing.status), priceId } }
            );
          } catch {}
        }
        return res.json({
          mode: sec.mode,
          subscriptionId: existing.id,
          customerId,
          clientSecret: sec.clientSecret,
        });
      }
      // If no secrets found, we’ll try creating a fresh sub below.
    }

    // 3) Create new subscription (default_incomplete) with idempotency
    const hasAddress = !!country;
    const createParams: Stripe.SubscriptionCreateParams = {
      customer: customerId,
      items: [{ price: priceId, quantity: 1 }],
      payment_behavior: "default_incomplete",
      collection_method: "charge_automatically",
      payment_settings: {
        save_default_payment_method: "on_subscription",
        payment_method_types: ["card"],
      },
      automatic_tax: { enabled: hasAddress },
      metadata: { userId: userId || "", priceId },
      expand: ["latest_invoice", "latest_invoice.payment_intent", "pending_setup_intent"],
    };

    const idempotencyKey = makeIdempoKey(`elements-start:${customerId}:${priceId}`, createParams);
    const created = await stripe.subscriptions.create(createParams, { idempotencyKey });

    const sub = await stripe.subscriptions.retrieve(created.id, {
      expand: ["latest_invoice", "latest_invoice.payment_intent", "pending_setup_intent"],
    });

    if (userId) {
      try {
        await User.updateOne(
          { _id: userId },
          { $set: { stripeSubscriptionId: sub.id, subscriptionStatus: normStatus(sub.status), priceId } }
        );
      } catch {}
    }

    const sec = await extractClientSecretFromSub(sub);
    if (!sec?.clientSecret) throw new Error("Stripe did not return a clientSecret");

    return res.json({
      mode: sec.mode,
      subscriptionId: sub.id,
      customerId,
      clientSecret: sec.clientSecret,
    });
  } catch (e: any) {
    console.error("[/api/billing/elements/start] error:", e);
    res.status(500).json({ error: e?.message || "Internal error" });
  }
});



// GET /api/billing/elements/subscriptions/:id
r.get("/elements/subscriptions/:id", async (req, res) => {
  try {
    const sub = await stripe.subscriptions.retrieve(req.params.id, {
      expand: ["items.data.price.product", "latest_invoice.payment_intent", "pending_setup_intent"],
    });
    res.json(sub);
  } catch (e: any) {
    res.status(404).json({ error: "Not found" });
  }
});

export default r;
