




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
//     .slice(0, 24);
//   return `${prefix}:${h}`;
// }

// /* -------------------------- Helpers -------------------------- */
// async function getOrCreateCustomer({
//   userId,
//   email,
//   name,
// }: {
//   userId?: string;
//   email: string;
//   name?: string;
// }): Promise<string> {
//   if (userId) {
//     try {
//       const u = await User.findById(userId).lean();
//       if (u?.stripeCustomerId) return String(u.stripeCustomerId);
//     } catch {}
//   }

//   const e = (email || "").trim();
//   if (!e) throw new Error("Email is required");

//   const existing = await stripe.customers.list({ email: e, limit: 1 });
//   const cust =
//     existing.data[0] ??
//     (await stripe.customers.create({ email: e, name: name || undefined }));

//   if (userId) {
//     try {
//       await User.findByIdAndUpdate(
//         userId,
//         { stripeCustomerId: cust.id },
//         { new: true }
//       );
//     } catch {}
//   }
//   return cust.id;
// }

// async function findExistingSub(customerId: string) {
//   const subs = await stripe.subscriptions.list({
//     customer: customerId,
//     status: "all",
//     limit: 100,
//   });
//   const ordered = subs.data.sort((a, b) => {
//     const rank = (s: string) =>
//       s === "incomplete" ? 0 : s === "past_due" ? 1 : s === "trialing" ? 2 : s === "active" ? 3 : 4;
//     return rank(a.status) - rank(b.status);
//   });
//   return (
//     ordered.find((s) =>
//       ["active", "trialing", "past_due", "incomplete", "unpaid"].includes(
//         s.status
//       )
//     ) || null
//   );
// }

// async function extractClientSecretFromSub(sub: Stripe.Subscription) {
//   // Latest invoice → PaymentIntent
//   const latest = sub.latest_invoice;
//   if (latest && typeof latest !== "string" && isStripeObj(latest, "invoice")) {
//     const inv = latest as Stripe.Invoice;
//     const piAny = (inv as any).payment_intent;
//     if (piAny) {
//       if (typeof piAny === "string") {
//         const pi = await stripe.paymentIntents.retrieve(piAny);
//         if (pi.client_secret) return { mode: "payment" as const, clientSecret: pi.client_secret };
//       } else if (isStripeObj(piAny, "payment_intent")) {
//         const pi = piAny as Stripe.PaymentIntent;
//         if (pi.client_secret) return { mode: "payment" as const, clientSecret: pi.client_secret };
//       }
//     }
//   } else if (typeof latest === "string") {
//     const inv = (await stripe.invoices.retrieve(latest, {
//       expand: ["payment_intent"],
//     })) as any;
//     const pi = inv.payment_intent;
//     if (pi?.client_secret) return { mode: "payment" as const, clientSecret: pi.client_secret };
//   }

//   // Fallback: pending SetupIntent
//   const pending = (sub as any).pending_setup_intent;
//   if (pending) {
//     if (typeof pending === "string") {
//       const si = await stripe.setupIntents.retrieve(pending);
//       if (si.client_secret)
//         return { mode: "setup" as const, clientSecret: si.client_secret };
//     } else if (isStripeObj(pending, "setup_intent")) {
//       const si = pending as Stripe.SetupIntent;
//       if (si.client_secret)
//         return { mode: "setup" as const, clientSecret: si.client_secret };
//     }
//   }

//   return null;
// }

// /* ---------- Start Elements flow: return PI *or* SI client secret (or null) ---------- */
// /**
//  * POST /api/billing/elements/start
//  * body: { priceId: string, email?: string, name?: string, country?, address1?, city?, postalCode? }
//  * returns: { ok: true, mode?: "payment"|"setup", subscriptionId, customerId, status, clientSecret|null }
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

//     const userId = req.user?.userId;

//     // 1) Ensure & persist Customer
//     const customerId = await getOrCreateCustomer({ userId, email, name });

//     // Keep customer fresh (optional, helps with tax/country)
//     await stripe.customers.update(customerId, {
//       email,
//       name,
//       ...(country
//         ? {
//             address: {
//               country: country.toUpperCase(),
//               line1: address1 || undefined,
//               city: city || undefined,
//               postal_code: postalCode || undefined,
//             },
//           }
//         : {}),
//     });

//     // 2) Reuse existing subscription (incomplete/past_due → return PI/SI; active/trialing → no secret)
//     const existingMaybe = await findExistingSub(customerId);
//     if (existingMaybe) {
//       const existing = await stripe.subscriptions.retrieve(existingMaybe.id, {
//         expand: [
//           "latest_invoice",
//           "latest_invoice.payment_intent",
//           "pending_setup_intent",
//           "items.data.price",
//         ],
//       });

//       if (["active", "trialing"].includes(existing.status)) {
//         if (userId) {
//           try {
//             await User.updateOne(
//               { _id: userId },
//               {
//                 $set: {
//                   stripeSubscriptionId: existing.id,
//                   subscriptionStatus: "active",
//                   priceId,
//                 },
//               }
//             );
//           } catch {}
//         }
//         return res.json({
//           ok: true,
//           subscriptionId: existing.id,
//           customerId,
//           status: existing.status,
//           clientSecret: null, // ✅ nothing to confirm now
//         });
//       }

//       const sec = await extractClientSecretFromSub(existing);
//       if (sec?.clientSecret) {
//         if (userId) {
//           try {
//             await User.updateOne(
//               { _id: userId },
//               {
//                 $set: {
//                   stripeSubscriptionId: existing.id,
//                   subscriptionStatus: normStatus(existing.status),
//                   priceId,
//                 },
//               }
//             );
//           } catch {}
//         }
//         return res.json({
//           ok: true,
//           mode: sec.mode,
//           subscriptionId: existing.id,
//           customerId,
//           status: existing.status,
//           clientSecret: sec.clientSecret,
//         });
//       }
//       // else: fall through and create a fresh sub
//     }

//     // 3) Create new subscription (default_incomplete) with idempotency
//     const createParams: Stripe.SubscriptionCreateParams = {
//       customer: customerId,
//       items: [{ price: priceId, quantity: 1 }],
//       payment_behavior: "default_incomplete",
//       collection_method: "charge_automatically",
//       payment_settings: {
//         save_default_payment_method: "on_subscription",
//         payment_method_types: ["card"],
//       },
//       automatic_tax: { enabled: !!country },
//       metadata: { userId: userId || "", priceId },
//       expand: [
//         "latest_invoice",
//         "latest_invoice.payment_intent",
//         "pending_setup_intent",
//         "items.data.price",
//       ],
//     };

//     const idempotencyKey = makeIdempoKey(
//       `elements-start:${customerId}:${priceId}`,
//       createParams
//     );
//     const created = await stripe.subscriptions.create(createParams, {
//       idempotencyKey,
//     });

//     const sub = await stripe.subscriptions.retrieve(created.id, {
//       expand: [
//         "latest_invoice",
//         "latest_invoice.payment_intent",
//         "pending_setup_intent",
//         "items.data.price",
//       ],
//     });

//     if (userId) {
//       try {
//         await User.updateOne(
//           { _id: userId },
//           {
//             $set: {
//               stripeSubscriptionId: sub.id,
//               subscriptionStatus: normStatus(sub.status),
//               priceId,
//             },
//           }
//         );
//       } catch {}
//     }

//     const sec = await extractClientSecretFromSub(sub);

//     // ✅ Do NOT throw when null (free trial / AED 0 today)
//     return res.json({
//       ok: true,
//       ...(sec ? { mode: sec.mode } : {}),
//       subscriptionId: sub.id,
//       customerId,
//       status: sub.status,
//       clientSecret: sec?.clientSecret ?? null,
//     });
//   } catch (e: any) {
//     console.error("[/api/billing/elements/start] error:", e?.message || e);
//     res.status(500).json({ error: e?.message || "Internal error" });
//   }
// });

// /* ---------- Read a subscription (used by /welcome?sid=...) ---------- */
// // GET /api/billing/elements/subscriptions/:id
// r.get("/elements/subscriptions/:id", async (req, res) => {
//   try {
//     const sub = await stripe.subscriptions.retrieve(req.params.id, {
//       expand: [
//         "items.data.price.product",
//         "latest_invoice.payment_intent",
//         "pending_setup_intent",
//       ],
//     });
//     res.json(sub);
//   } catch {
//     res.status(404).json({ error: "Not found" });
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
  if (userId) {
    try {
      const u = await User.findById(userId).lean();
      if (u?.stripeCustomerId) return String(u.stripeCustomerId);
    } catch {}
  }

  const e = (email || "").trim();
  if (!e) throw new Error("Email is required");

  const existing = await stripe.customers.list({ email: e, limit: 1 });
  const cust =
    existing.data[0] ??
    (await stripe.customers.create({ email: e, name: name || undefined }));

  if (userId) {
    try {
      await User.findByIdAndUpdate(
        userId,
        { stripeCustomerId: cust.id },
        { new: true }
      );
    } catch {}
  }
  return cust.id;
}

async function findExistingSub(customerId: string) {
  const subs = await stripe.subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 100,
  });
  const ordered = subs.data.sort((a, b) => {
    const rank = (s: string) =>
      s === "incomplete"
        ? 0
        : s === "past_due"
        ? 1
        : s === "trialing"
        ? 2
        : s === "active"
        ? 3
        : 4;
    return rank(a.status) - rank(b.status);
  });
  return (
    ordered.find((s) =>
      ["active", "trialing", "past_due", "incomplete", "unpaid"].includes(
        s.status
      )
    ) || null
  );
}

async function extractClientSecretFromSub(sub: Stripe.Subscription) {
  // Latest invoice → PaymentIntent
  const latest = sub.latest_invoice;
  if (latest && typeof latest !== "string" && isStripeObj(latest, "invoice")) {
    const inv = latest as Stripe.Invoice;
    const piAny = (inv as any).payment_intent;
    if (piAny) {
      if (typeof piAny === "string") {
        const pi = await stripe.paymentIntents.retrieve(piAny);
        if (pi.client_secret)
          return { mode: "payment" as const, clientSecret: pi.client_secret };
      } else if (isStripeObj(piAny, "payment_intent")) {
        const pi = piAny as Stripe.PaymentIntent;
        if (pi.client_secret)
          return { mode: "payment" as const, clientSecret: pi.client_secret };
      }
    }
  } else if (typeof latest === "string") {
    const inv = (await stripe.invoices.retrieve(latest, {
      expand: ["payment_intent"],
    })) as any;
    const pi = inv.payment_intent;
    if (pi?.client_secret)
      return { mode: "payment" as const, clientSecret: pi.client_secret };
  }

  // Fallback: pending SetupIntent
  const pending = (sub as any).pending_setup_intent;
  if (pending) {
    if (typeof pending === "string") {
      const si = await stripe.setupIntents.retrieve(pending);
      if (si.client_secret)
        return { mode: "setup" as const, clientSecret: si.client_secret };
    } else if (isStripeObj(pending, "setup_intent")) {
      const si = pending as Stripe.SetupIntent;
      if (si.client_secret)
        return { mode: "setup" as const, clientSecret: si.client_secret };
    }
  }

  return null;
}

/* ---------- Start Elements flow: return PI *or* SI client secret (or null) ---------- */
/**
 * POST /api/billing/elements/start
 * body: { priceId: string, email?: string, name?: string, country?, address1?, city?, postalCode? }
 * returns: { ok: true, mode?: "payment"|"setup", subscriptionId, customerId, status, clientSecret|null }
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

    // Keep customer fresh (optional, helps with tax/country)
    await stripe.customers.update(customerId, {
      email,
      name,
      ...(country
        ? {
            address: {
              country: country.toUpperCase(),
              line1: address1 || undefined,
              city: city || undefined,
              postal_code: postalCode || undefined,
            },
          }
        : {}),
    });

    // 2) Reuse existing subscription (incomplete/past_due → return PI/SI; active/trialing → no secret)
    const existingMaybe = await findExistingSub(customerId);
    if (existingMaybe) {
      const existing = await stripe.subscriptions.retrieve(existingMaybe.id, {
        expand: [
          "latest_invoice",
          "latest_invoice.payment_intent",
          "pending_setup_intent",
          "items.data.price",
        ],
      });

      if (["active", "trialing"].includes(existing.status)) {
        if (userId) {
          try {
            await User.updateOne(
              { _id: userId },
              {
                $set: {
                  stripeSubscriptionId: existing.id,
                  subscriptionStatus: "active",
                  priceId,
                },
              }
            );
          } catch {}
        }
        return res.json({
          ok: true,
          subscriptionId: existing.id,
          customerId,
          status: existing.status,
          clientSecret: null, // ✅ nothing to confirm now
        });
      }

      const sec = await extractClientSecretFromSub(existing);
      if (sec?.clientSecret) {
        if (userId) {
          try {
            await User.updateOne(
              { _id: userId },
              {
                $set: {
                  stripeSubscriptionId: existing.id,
                  subscriptionStatus: normStatus(existing.status),
                  priceId,
                },
              }
            );
          } catch {}
        }
        return res.json({
          ok: true,
          mode: sec.mode,
          subscriptionId: existing.id,
          customerId,
          status: existing.status,
          clientSecret: sec.clientSecret,
        });
      }
      // else: fall through and create a fresh sub
    }

    // 3) Create new subscription (default_incomplete) with idempotency
    const createParams: Stripe.SubscriptionCreateParams = {
      customer: customerId,
      items: [{ price: priceId, quantity: 1 }],
      payment_behavior: "default_incomplete",
      collection_method: "charge_automatically",
      payment_settings: {
        save_default_payment_method: "on_subscription",
        payment_method_types: ["card"],
      },
      automatic_tax: { enabled: !!country },
      metadata: { userId: userId || "", priceId },
      expand: [
        "latest_invoice",
        "latest_invoice.payment_intent",
        "pending_setup_intent",
        "items.data.price",
      ],
    };

    const idempotencyKey = makeIdempoKey(
      `elements-start:${customerId}:${priceId}`,
      createParams
    );
    const created = await stripe.subscriptions.create(createParams, {
      idempotencyKey,
    });

    const sub = await stripe.subscriptions.retrieve(created.id, {
      expand: [
        "latest_invoice",
        "latest_invoice.payment_intent",
        "pending_setup_intent",
        "items.data.price",
      ],
    });

    if (userId) {
      try {
        await User.updateOne(
          { _id: userId },
          {
            $set: {
              stripeSubscriptionId: sub.id,
              subscriptionStatus: normStatus(sub.status),
              priceId,
            },
          }
        );
      } catch {}
    }

    const sec = await extractClientSecretFromSub(sub);

    // ✅ Do NOT throw when null (free trial / AED 0 today)
    return res.json({
      ok: true,
      ...(sec ? { mode: sec.mode } : {}),
      subscriptionId: sub.id,
      customerId,
      status: sub.status,
      clientSecret: sec?.clientSecret ?? null,
    });
  } catch (e: any) {
    console.error("[/api/billing/elements/start] error:", e?.message || e);
    res.status(500).json({ error: e?.message || "Internal error" });
  }
});

/* ---------- Read a subscription (used by /welcome?sid=...) ---------- */
// GET /api/billing/elements/subscriptions/:id
r.get("/elements/subscriptions/:id", async (req, res) => {
  try {
    const sub = await stripe.subscriptions.retrieve(req.params.id, {
      expand: [
        "items.data.price.product",
        "latest_invoice.payment_intent",
        "pending_setup_intent",
      ],
    });
    res.json(sub);
  } catch {
    res.status(404).json({ error: "Not found" });
  }
});

// KEEP all the code above as-is ... only replace the /invoices route

// ---------- Invoices for My Subscription page ----------
// GET /api/billing/invoices
r.get("/invoices", async (req: ReqWithUser, res) => {
  try {
    // ✅ Try auth middleware first, then fall back to ?userId=...
    const userId =
      (req.user?.userId as string | undefined) ||
      (req.query.userId as string | undefined) ||
      null;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await User.findById(userId).lean();
    if (!user?.stripeCustomerId) {
      return res.json({ items: [], upcoming: null });
    }

    // Last 10 invoices from Stripe
    const invoices = await stripe.invoices.list({
      customer: user.stripeCustomerId,
      limit: 10,
    });

    // Upcoming (next) invoice preview – may throw if none
    let upcoming: Stripe.Invoice | null = null;
    try {
      const up = (await (stripe.invoices as any).retrieveUpcoming({
        customer: user.stripeCustomerId,
      })) as Stripe.Invoice;
      upcoming = up;
    } catch {
      upcoming = null;
    }

    return res.json({
      items: invoices.data.map((inv) => ({
        id: inv.id,
        number: inv.number,
        status: inv.status,
        amount: inv.amount_paid ?? inv.amount_due ?? null,
        currency: inv.currency?.toUpperCase() || "AED",
        created: inv.created, // unix seconds
        hosted_invoice_url: inv.hosted_invoice_url,
        invoice_pdf: inv.invoice_pdf,
      })),
      upcoming: upcoming
        ? {
            id: upcoming.id ?? null,
            number: upcoming.number ?? null,
            status: "upcoming",
            amount: upcoming.amount_due ?? null,
            currency: upcoming.currency?.toUpperCase() ?? "AED",
            // ✅ use next_payment_attempt as the real billing date
            created:
              upcoming.next_payment_attempt ??
              upcoming.created ??
              null,
            hosted_invoice_url: upcoming.hosted_invoice_url ?? null,
            invoice_pdf: upcoming.invoice_pdf ?? null,
          }
        : null,
    });
  } catch (e) {
    console.error("[/api/billing/invoices] error", e);
    return res.status(500).json({ error: "Failed to load invoices" });
  }
});

export default r;
