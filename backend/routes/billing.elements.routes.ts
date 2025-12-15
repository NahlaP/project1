

// // current working one

// // backend/routes/billing.elements.routes.ts
// import { Router, Request } from "express";
// import Stripe from "stripe";
// import crypto from "crypto";
// import User from "../models/User";
// import axios from "axios";

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

// /* -------------------------- Money helpers -------------------------- */
// const round = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

// // Stripe invoice must be 1 currency. Your plan is AED, so convert provider USD -> AED.
// const FX_USD_TO_AED = Number(process.env.FX_USD_TO_AED || "3.6725");

// function usdToAedCents(usdAmount: number) {
//   const aed = usdAmount * FX_USD_TO_AED;
//   return Math.max(0, Math.round(aed * 100));
// }
// function aedToAedCents(aedAmount: number) {
//   return Math.max(0, Math.round(aedAmount * 100));
// }

// /* -------------------------- DOMAIN PRODUCT (AUTO CREATE) -------------------------- */
// /**
//  * Creates a unique Stripe product for this user's domain line.
//  * Stripe invoice items need product id (TS safe).
//  */
// async function createDomainProductId(args: {
//   userId: string | undefined;
//   domain: string;
//   domainType: "new" | "transfer";
//   providerCurrency: string;
//   providerPrice: number;
// }) {
//   const { userId, domain, domainType, providerCurrency, providerPrice } = args;

//   const name = `Domain ${domainType}: ${domain}`;

//   const p = await stripe.products.create({
//     name,
//     metadata: {
//       ion7_domain: domain,
//       ion7_domain_type: domainType,
//       userId: userId || "",
//       provider_currency: providerCurrency,
//       provider_price: String(round(providerPrice)),
//       fx_usd_to_aed: String(FX_USD_TO_AED),
//     },
//   });

//   return p.id;
// }

// /* -------------------------- DOMAIN PRICE (SOURCE OF TRUTH) -------------------------- */
// /**
//  * IMPORTANT:
//  * - transfer MUST use your USD transfer endpoint (same as domain setup page):
//  *     GET /api/openprovider/domains/transfer-price?domain=...
//  * - new can use:
//  *     GET /api/openprovider/domains/quote?domain=...&type=new
//  *
//  * Adjust the "new" endpoint if your backend uses a different one.
//  */
// async function getDomainProviderQuote(domain: string, domainType: "new" | "transfer") {
//   const base = (
//     process.env.BACKEND_PUBLIC_ORIGIN ||
//     process.env.BACKEND_ORIGIN ||
//     "http://127.0.0.1:5000"
//   ).replace(/\/$/, "");

//   let url = "";

//   if (domainType === "transfer") {
//     // ✅ SAME API your setup page uses
//     url = `${base}/api/openprovider/domains/transfer-price?domain=${encodeURIComponent(domain)}`;
//   } else {
//     // ✅ New domain quote endpoint (keep or replace with your actual endpoint)
//     url = `${base}/api/openprovider/domains/quote?domain=${encodeURIComponent(
//       domain
//     )}&type=new`;
//   }

//   const { data } = await axios.get(url, { timeout: 25_000 });

//   // Be tolerant with wrappers
//   const root = data?.data ?? data;

//   const price =
//     root?.data?.price?.reseller?.price ??
//     root?.price?.reseller?.price ??
//     root?.price ??
//     null;

//   const currency =
//     root?.data?.price?.reseller?.currency ??
//     root?.price?.reseller?.currency ??
//     root?.currency ??
//     null;

//   return {
//     price: typeof price === "number" ? price : null,
//     currency: typeof currency === "string" ? currency.toUpperCase() : null,
//   };
// }

// async function getDomainPrice(domain: string, domainType: "new" | "transfer") {
//   const q = await getDomainProviderQuote(domain, domainType);
//   if (q.price == null || !q.currency) {
//     throw new Error(`Domain quote missing price/currency for ${domain} (${domainType})`);
//   }
//   return { providerPrice: q.price, providerCurrency: q.currency };
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
//     existing.data[0] ?? (await stripe.customers.create({ email: e, name: name || undefined }));

//   if (userId) {
//     try {
//       await User.findByIdAndUpdate(userId, { stripeCustomerId: cust.id }, { new: true });
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
//       s === "incomplete"
//         ? 0
//         : s === "past_due"
//         ? 1
//         : s === "trialing"
//         ? 2
//         : s === "active"
//         ? 3
//         : 4;
//     return rank(a.status) - rank(b.status);
//   });

//   return (
//     ordered.find((s) =>
//       ["active", "trialing", "past_due", "incomplete", "unpaid"].includes(s.status)
//     ) || null
//   );
// }

// async function extractClientSecretFromSub(sub: Stripe.Subscription) {
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
//     const inv = (await stripe.invoices.retrieve(latest, { expand: ["payment_intent"] })) as any;
//     const pi = inv.payment_intent;
//     if (pi?.client_secret) return { mode: "payment" as const, clientSecret: pi.client_secret };
//   }

//   const pending = (sub as any).pending_setup_intent;
//   if (pending) {
//     if (typeof pending === "string") {
//       const si = await stripe.setupIntents.retrieve(pending);
//       if (si.client_secret) return { mode: "setup" as const, clientSecret: si.client_secret };
//     } else if (isStripeObj(pending, "setup_intent")) {
//       const si = pending as Stripe.SetupIntent;
//       if (si.client_secret) return { mode: "setup" as const, clientSecret: si.client_secret };
//     }
//   }

//   return null;
// }

// function pickInvoiceSummary(sub: Stripe.Subscription) {
//   const latest = sub.latest_invoice;
//   if (!latest || typeof latest === "string") return null;

//   const inv = latest as Stripe.Invoice;
//   const currency = (inv.currency || "aed").toUpperCase();

//   return {
//     id: inv.id,
//     currency,
//     amount_due: inv.amount_due ?? null,
//     amount_paid: inv.amount_paid ?? null,
//     hosted_invoice_url: inv.hosted_invoice_url ?? null,
//     invoice_pdf: inv.invoice_pdf ?? null,
//   };
// }

// /* ---------- Start Elements flow ---------- */
// /**
//  * POST /api/billing/elements/start
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
//       domain,
//       domainType,
//     } = (req.body || {}) as {
//       priceId?: string;
//       email?: string;
//       name?: string;
//       country?: string;
//       address1?: string;
//       city?: string;
//       postalCode?: string;
//       domain?: string;
//       domainType?: "new" | "transfer" | "dns";
//     };

//     if (!priceId) return res.status(400).json({ error: "Missing priceId" });

//     const email = (req.user?.email || emailFromBody || "").trim();
//     const name = (req.user?.name || nameFromBody || "").trim() || undefined;
//     if (!email) return res.status(400).json({ error: "Email is required" });

//     const userId = req.user?.userId;

//     const dt: "new" | "transfer" | "dns" = domainType || "new";
//     const shouldChargeDomain = !!domain && dt !== "dns";

//     // 1) Customer
//     const customerId = await getOrCreateCustomer({ userId, email, name });

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

//     // 2) Existing subscription reuse ONLY when no domain charge
//     const shouldForceNewSub = shouldChargeDomain;

//     let existingMaybe: Stripe.Subscription | null = null;
//     if (!shouldForceNewSub) {
//       existingMaybe = await findExistingSub(customerId);
//     }

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
//           clientSecret: null,
//           invoice: pickInvoiceSummary(existing),
//           domain: null,
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
//           invoice: pickInvoiceSummary(existing),
//           domain: null,
//         });
//       }
//     }

//     // 3) Subscription create base
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
//       metadata: {
//         userId: userId || "",
//         priceId,
//         ...(domain ? { ion7_domain: domain, ion7_domain_type: dt } : {}),
//       },
//       expand: [
//         "latest_invoice",
//         "latest_invoice.payment_intent",
//         "pending_setup_intent",
//         "items.data.price",
//       ],
//     };

//     // 4) Domain add-on line (convert USD → AED here)
//     let domainMeta: any = null;

//     if (shouldChargeDomain) {
//       const dtt: "new" | "transfer" = dt === "transfer" ? "transfer" : "new";

//       const { providerPrice, providerCurrency } = await getDomainPrice(domain!, dtt);

//       let chargeAedCents = 0;

//       if (providerCurrency === "USD") chargeAedCents = usdToAedCents(providerPrice);
//       else if (providerCurrency === "AED") chargeAedCents = aedToAedCents(providerPrice);
//       else throw new Error(`Unsupported provider currency: ${providerCurrency} (domain ${domain})`);

//       if (chargeAedCents > 0) {
//         const productId = await createDomainProductId({
//           userId,
//           domain: domain!,
//           domainType: dtt,
//           providerCurrency,
//           providerPrice,
//         });

//         createParams.add_invoice_items = [
//           {
//             price_data: {
//               currency: "aed",
//               unit_amount: chargeAedCents,
//               product: productId,
//             },
//             quantity: 1,
//           },
//         ];
//       }

//       // ✅ IMPORTANT: return fields matching your checkout.js
//       domainMeta = {
//         name: domain!,
//         type: dtt,
//         priceUsd: providerCurrency === "USD" ? round(providerPrice) : null,
//         fx: FX_USD_TO_AED,
//         chargeAedCents: chargeAedCents || null,
//       };
//     }

//     const idempotencyKey = makeIdempoKey(`elements-start:${customerId}:${priceId}`, {
//       customerId,
//       priceId,
//       domain: domain || "",
//       domainType: dt,
//     });

//     const created = await stripe.subscriptions.create(createParams, { idempotencyKey });

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

//     return res.json({
//       ok: true,
//       ...(sec ? { mode: sec.mode } : {}),
//       subscriptionId: sub.id,
//       customerId,
//       status: sub.status,
//       clientSecret: sec?.clientSecret ?? null,
//       invoice: pickInvoiceSummary(sub),
//       domain: domainMeta,
//     });
//   } catch (e: any) {
//     console.error("[/api/billing/elements/start] error:", e?.message || e);
//     res.status(500).json({ error: e?.message || "Internal error" });
//   }
// });

// /* ---------- Read a subscription (used by /welcome?sid=...) ---------- */
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

// /* ---------- Invoices for My Subscription page ---------- */
// r.get("/invoices", async (req: ReqWithUser, res) => {
//   try {
//     const userId =
//       (req.user?.userId as string | undefined) ||
//       (req.query.userId as string | undefined) ||
//       null;

//     if (!userId) return res.status(401).json({ error: "Unauthorized" });

//     const user = await User.findById(userId).lean();
//     if (!user?.stripeCustomerId) return res.json({ items: [], upcoming: null });

//     const invoices = await stripe.invoices.list({
//       customer: user.stripeCustomerId,
//       limit: 10,
//     });

//     let upcoming: Stripe.Invoice | null = null;
//     try {
//       const up = (await (stripe.invoices as any).retrieveUpcoming({
//         customer: user.stripeCustomerId,
//       })) as Stripe.Invoice;
//       upcoming = up;
//     } catch {
//       upcoming = null;
//     }

//     return res.json({
//       items: invoices.data.map((inv) => ({
//         id: inv.id,
//         number: inv.number,
//         status: inv.status,
//         amount: inv.amount_paid ?? inv.amount_due ?? null,
//         currency: inv.currency?.toUpperCase() || "AED",
//         created: inv.created,
//         hosted_invoice_url: inv.hosted_invoice_url,
//         invoice_pdf: inv.invoice_pdf,
//       })),
//       upcoming: upcoming
//         ? {
//             id: upcoming.id ?? null,
//             number: upcoming.number ?? null,
//             status: "upcoming",
//             amount: upcoming.amount_due ?? null,
//             currency: upcoming.currency?.toUpperCase() ?? "AED",
//             created: upcoming.next_payment_attempt ?? upcoming.created ?? null,
//             hosted_invoice_url: upcoming.hosted_invoice_url ?? null,
//             invoice_pdf: upcoming.invoice_pdf ?? null,
//           }
//         : null,
//     });
//   } catch (e) {
//     console.error("[/api/billing/invoices] error", e);
//     return res.status(500).json({ error: "Failed to load invoices" });
//   }
// });

// export default r;


























































































// backend/routes/billing.elements.routes.ts
import { Router, Request } from "express";
import Stripe from "stripe";
import crypto from "crypto";
import axios from "axios";
import mongoose from "mongoose";
import User from "../models/User";
import DomainOrder from "../models/DomainOrder";

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

/* -------------------------- Money helpers -------------------------- */
const FX_USD_TO_AED = Number(process.env.FX_USD_TO_AED || "3.6725");
const round = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

function usdToAedCents(usdAmount: number) {
  const aed = usdAmount * FX_USD_TO_AED;
  return Math.max(0, Math.round(aed * 100));
}
function aedToAedCents(aedAmount: number) {
  return Math.max(0, Math.round(aedAmount * 100));
}

/* -------------------------- DOMAIN PRICE -------------------------- */
async function getDomainProviderQuote(domain: string, domainType: "new" | "transfer") {
  const base = (
    process.env.BACKEND_PUBLIC_ORIGIN ||
    process.env.BACKEND_ORIGIN ||
    "http://127.0.0.1:5000"
  ).replace(/\/$/, "");

  const url =
    domainType === "transfer"
      ? `${base}/api/openprovider/domains/transfer-price?domain=${encodeURIComponent(domain)}`
      : `${base}/api/openprovider/domains/quote?domain=${encodeURIComponent(domain)}&type=new`;

  const { data } = await axios.get(url, { timeout: 25_000 });
  const root = data?.data ?? data;

  const price =
    root?.data?.price?.reseller?.price ??
    root?.price?.reseller?.price ??
    root?.price ??
    null;

  const currency =
    root?.data?.price?.reseller?.currency ??
    root?.price?.reseller?.currency ??
    root?.currency ??
    null;

  return {
    price: typeof price === "number" ? price : null,
    currency: typeof currency === "string" ? currency.toUpperCase() : null,
  };
}

async function getDomainPrice(domain: string, domainType: "new" | "transfer") {
  const q = await getDomainProviderQuote(domain, domainType);
  if (q.price == null || !q.currency) {
    throw new Error(`Domain quote missing price/currency for ${domain} (${domainType})`);
  }
  return { providerPrice: q.price, providerCurrency: q.currency };
}

/* -------------------------- Customer helpers -------------------------- */
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
    existing.data[0] ?? (await stripe.customers.create({ email: e, name: name || undefined }));

  if (userId) {
    try {
      await User.findByIdAndUpdate(userId, { stripeCustomerId: cust.id }, { new: true });
    } catch {}
  }

  return cust.id;
}

async function extractClientSecretFromSub(sub: Stripe.Subscription) {
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

function pickInvoiceSummary(sub: Stripe.Subscription) {
  const latest = sub.latest_invoice;
  if (!latest || typeof latest === "string") return null;

  const inv = latest as Stripe.Invoice;
  const currency = (inv.currency || "aed").toUpperCase();

  return {
    id: inv.id,
    currency,
    amount_due: inv.amount_due ?? null,
    amount_paid: inv.amount_paid ?? null,
    hosted_invoice_url: inv.hosted_invoice_url ?? null,
    invoice_pdf: inv.invoice_pdf ?? null,
  };
}

/* ---------- Start Elements flow ---------- */
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
      domain,
      domainType,
      authCode,
    } = (req.body || {}) as {
      priceId?: string;
      email?: string;
      name?: string;
      country?: string;
      address1?: string;
      city?: string;
      postalCode?: string;
      domain?: string;
      domainType?: "new" | "transfer" | "dns";
      authCode?: string;
    };

    if (!priceId) return res.status(400).json({ error: "Missing priceId" });

    const email = (req.user?.email || emailFromBody || "").trim();
    const name = (req.user?.name || nameFromBody || "").trim() || undefined;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const userIdStr = req.user?.userId;
    if (!userIdStr) return res.status(401).json({ error: "Unauthorized" });

    // ✅ Convert string -> ObjectId (your model requires ObjectId)
    const userObjectId = new mongoose.Types.ObjectId(userIdStr);

    const dt: "new" | "transfer" | "dns" = domainType || "new";
    const shouldChargeDomain = !!domain && dt !== "dns";

    if (dt === "transfer" && shouldChargeDomain && !(authCode || "").trim()) {
      return res.status(400).json({ error: "authCode is required for transfer domains" });
    }

    // 1) Customer
    const customerId = await getOrCreateCustomer({ userId: userIdStr, email, name });

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

    // 2) Create subscription base
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
      metadata: {
        userId: userIdStr,
        priceId,
      },
      expand: [
        "latest_invoice",
        "latest_invoice.payment_intent",
        "pending_setup_intent",
        "items.data.price",
      ],
    };

    // 3) Domain add-on + DomainOrder (FIXED)
    let domainMeta: any = null;

    if (shouldChargeDomain) {
      const dtt: "new" | "transfer" = dt === "transfer" ? "transfer" : "new";

      const { providerPrice, providerCurrency } = await getDomainPrice(domain!, dtt);

      let chargeAedCents = 0;
      if (providerCurrency === "USD") chargeAedCents = usdToAedCents(providerPrice);
      else if (providerCurrency === "AED") chargeAedCents = aedToAedCents(providerPrice);
      else throw new Error(`Unsupported provider currency: ${providerCurrency} (domain ${domain})`);

      // ✅ IMPORTANT: use domainType + status "pending" to match your model
      const order = await DomainOrder.create({
        userId: userObjectId, // ✅ ObjectId
        domain: domain!,
        domainType: dtt, // ✅ required
        authCode: dtt === "transfer" ? String(authCode || "").trim() : null,

        stripeCustomerId: customerId,
        status: "pending", // ✅ enum match
        provider: "openprovider",
        providerRaw: { providerCurrency, providerPrice: round(providerPrice), fx: FX_USD_TO_AED },
      });

      createParams.metadata = {
        ...(createParams.metadata || {}),
        ion7_domain: domain!,
        ion7_domain_type: dtt,
        ion7_domain_order_id: String(order._id),
      };

      // Add invoice line item (AED)
      createParams.add_invoice_items = [
        {
          price_data: {
            currency: "aed",
            unit_amount: chargeAedCents,
            product_data: {
              name: `Domain ${dtt}: ${domain!}`,
              metadata: {
                ion7_domain: domain!,
                ion7_domain_type: dtt,
                ion7_domain_order_id: String(order._id),
                userId: userIdStr,
              },
            },
          },
          quantity: 1,
        },
      ];

      domainMeta = {
        name: domain!,
        type: dtt,
        authCode: dtt === "transfer" ? String(authCode || "").trim() : null,
        domainOrderId: String(order._id),
        providerCurrency,
        providerPrice: round(providerPrice),
        fx: FX_USD_TO_AED,
        chargeAedCents,
      };
    }

    const idempotencyKey = makeIdempoKey(`elements-start:${customerId}:${priceId}`, {
      customerId,
      priceId,
      domain: domain || "",
      domainType: dt,
      authCode: dt === "transfer" ? String(authCode || "").trim() : "",
    });

    const created = await stripe.subscriptions.create(createParams, { idempotencyKey });

    const sub = await stripe.subscriptions.retrieve(created.id, {
      expand: [
        "latest_invoice",
        "latest_invoice.payment_intent",
        "pending_setup_intent",
        "items.data.price",
      ],
    });

    // Link invoice/subscription to DomainOrder (optional but recommended)
    if (domainMeta?.domainOrderId) {
      const invAny = sub.latest_invoice as any;
      const invoiceId =
        typeof invAny === "string" ? invAny : invAny?.id ? String(invAny.id) : null;

      await DomainOrder.updateOne(
        { _id: domainMeta.domainOrderId },
        {
          $set: {
            stripeSubscriptionId: sub.id,
            stripeInvoiceId: invoiceId,
          },
        }
      );
    }

    // Update user subscription fields
    await User.updateOne(
      { _id: userIdStr },
      { $set: { stripeSubscriptionId: sub.id, subscriptionStatus: normStatus(sub.status), priceId } }
    );

    const sec = await extractClientSecretFromSub(sub);

    return res.json({
      ok: true,
      ...(sec ? { mode: sec.mode } : {}),
      subscriptionId: sub.id,
      customerId,
      status: sub.status,
      clientSecret: sec?.clientSecret ?? null,
      invoice: pickInvoiceSummary(sub),
      domain: domainMeta,
    });
  } catch (e: any) {
    console.error("[/api/billing/elements/start] error:", e?.message || e);
    return res.status(500).json({ error: e?.message || "Internal error" });
  }
});

export default r;
