// // og

// // backend/routes/stripe.webhook.ts
// import { Router } from "express";
// import bodyParser from "body-parser";
// import Stripe from "stripe";
// import { stripe } from "../services/stripe.service";
// import User from "../models/User";
// import DomainOrder from "../models/DomainOrder";
// import { OpenproviderService } from "../services/openprovider.service";

// const r = Router();
// const openprovider = new OpenproviderService();

// const AUTO = String(process.env.OPENPROVIDER_AUTO_SUBMIT || "false").toLowerCase() === "true";

// // must be raw for signature verification
// r.post("/webhook", bodyParser.raw({ type: "application/json" }), async (req, res) => {
//   const sig = req.headers["stripe-signature"] as string;
//   let event: Stripe.Event;

//   try {
//     event = stripe.webhooks.constructEvent(
//       req.body,
//       sig,
//       process.env.STRIPE_WEBHOOK_SECRET as string
//     );
//   } catch (err: any) {
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   try {
//     switch (event.type) {
//       /**
//        * ✅ Correct event for your Elements subscription flow:
//        * invoice.paid fires when the invoice is successfully paid.
//        */
//       case "invoice.paid": {
//         const inv = event.data.object as Stripe.Invoice;

//         const customerId =
//           typeof inv.customer === "string" ? inv.customer : (inv.customer as any)?.id || null;

//         const rawSub: unknown = (inv as any)["subscription"] ?? null;
//         const subId =
//           typeof rawSub === "string" ? rawSub : (rawSub && (rawSub as any).id) || null;

//         // 1) Update user subscription status
//         if (subId) {
//           await User.findOneAndUpdate(
//             { stripeSubscriptionId: subId },
//             { subscriptionStatus: "active", stripeCustomerId: customerId || undefined }
//           );
//         } else if (customerId) {
//           await User.findOneAndUpdate(
//             { stripeCustomerId: customerId },
//             { subscriptionStatus: "active" }
//           );
//         }

//         // 2) Domain automation (find domainOrderId from subscription metadata)
//         if (!subId) break;

//         const sub = await stripe.subscriptions.retrieve(subId);
//         const domainOrderId = (sub.metadata as any)?.domainOrderId || null;

//         if (!domainOrderId) break;

//         const order = await DomainOrder.findById(domainOrderId);
//         if (!order) break;

//         // Idempotency: ignore duplicates
//         if (order.stripeEventId === event.id) break;
//         if (order.status === "submitted" || order.status === "completed") break;

//         // Mark paid
//         order.status = "paid";
//         order.stripeEventId = event.id;
//         order.stripeCustomerId = customerId ?? order.stripeCustomerId ?? null;
//         order.stripeSubscriptionId = subId ?? order.stripeSubscriptionId ?? null;
//         await order.save();

//         if (!AUTO) break;

//         try {
//           // Mark submitted before calling provider (optional but useful)
//           order.status = "submitted";
//           await order.save();

//           let providerResp: any;

//           if (order.domainType === "new") {
//             providerResp = await openprovider.registerDomain(order.domain);
//           } else {
//             providerResp = await openprovider.submitTransfer(order.domain, order.authCode || "");
//           }

//           order.status = "completed";
//           order.providerResponse = providerResp;
//           order.providerError = null;
//           await order.save();
//         } catch (e: any) {
//           order.status = "failed";
//           order.providerError = e?.message || "Openprovider purchase failed";
//           await order.save();
//         }

//         break;
//       }

//       /**
//        * Keep your existing checkout handler (good as fallback if you later add Checkout sessions),
//        * but it is NOT the primary event for your Elements flow.
//        */
//       case "checkout.session.completed": {
//         const s = event.data.object as Stripe.Checkout.Session;

//         const customerId = typeof s.customer === "string" ? s.customer : s.customer?.id || null;
//         const subId =
//           typeof s.subscription === "string" ? s.subscription : s.subscription?.id || null;

//         let user =
//           s.metadata?.userId
//             ? await User.findById(s.metadata.userId)
//             : customerId
//             ? await User.findOne({ stripeCustomerId: customerId })
//             : null;

//         if (!user) {
//           const email = (s.customer_details?.email || s.customer_email || "").toLowerCase();
//           if (email) user = await User.findOne({ email });
//         }

//         if (user) {
//           await User.findByIdAndUpdate(user._id, {
//             stripeCustomerId: customerId ?? user.stripeCustomerId,
//             stripeSubscriptionId: subId ?? user.stripeSubscriptionId,
//             subscriptionStatus: "active",
//           });
//         }

//         break;
//       }

//       case "invoice.payment_failed": {
//         const inv = event.data.object as Stripe.Invoice;
//         const rawSub: unknown = (inv as any)["subscription"] ?? null;
//         const subId =
//           typeof rawSub === "string" ? rawSub : (rawSub && (rawSub as any).id) || null;
//         const customerId =
//           typeof inv.customer === "string" ? inv.customer : (inv.customer as any)?.id || null;

//         if (subId)
//           await User.findOneAndUpdate({ stripeSubscriptionId: subId }, { subscriptionStatus: "past_due" });
//         else if (customerId)
//           await User.findOneAndUpdate({ stripeCustomerId: customerId }, { subscriptionStatus: "past_due" });

//         break;
//       }

//       case "customer.subscription.deleted": {
//         const sub = event.data.object as Stripe.Subscription;
//         await User.findOneAndUpdate(
//           { stripeSubscriptionId: sub.id },
//           { subscriptionStatus: null, priceId: null, stripeSubscriptionId: null }
//         );
//         break;
//       }
//     }
//   } catch (e) {
//     console.error("Webhook handler error:", e);
//     // still acknowledge so Stripe won’t retry forever
//   }

//   res.json({ received: true });
// });

// export default r;






















































// backend/routes/stripe.webhook.ts
import { Router } from "express";
import bodyParser from "body-parser";
import Stripe from "stripe";
import { stripe } from "../services/stripe.service";
import User from "../models/User";
import DomainOrder from "../models/DomainOrder";
import { OpenproviderService } from "../services/openprovider.service";

const r = Router();
const openprovider = new OpenproviderService();

const AUTO =
  String(process.env.OPENPROVIDER_AUTO_SUBMIT || "false").toLowerCase() === "true";

/**
 * Helper: safe string
 */
const s = (v: any) => (typeof v === "string" ? v : v?.id ? String(v.id) : null);

/**
 * Helper: attempt to find DomainOrder by:
 * 1) subscription.metadata.domainOrderId
 * 2) DomainOrder.stripeSubscriptionId
 * 3) DomainOrder.stripeCustomerId + domain (fallback only if you later add domain to metadata)
 */
async function findDomainOrder(args: {
  subId?: string | null;
  customerId?: string | null;
  domainOrderIdFromMeta?: string | null;
}) {
  const { subId, customerId, domainOrderIdFromMeta } = args;

  if (domainOrderIdFromMeta) {
    const byId = await DomainOrder.findById(domainOrderIdFromMeta);
    if (byId) return byId;
  }

  if (subId) {
    const bySub = await DomainOrder.findOne({ stripeSubscriptionId: subId });
    if (bySub) return bySub;
  }

  // Optional fallback (usually not needed). Keep for safety.
  if (customerId) {
    const byCust = await DomainOrder.findOne({
      stripeCustomerId: customerId,
      status: { $in: ["pending", "paid"] },
    }).sort({ createdAt: -1 });
    if (byCust) return byCust;
  }

  return null;
}

// must be raw for signature verification
r.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"] as string;
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET as string
      );
    } catch (err: any) {
      console.error("🛑 Stripe signature error:", err?.message || err);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log("✅ WEBHOOK HIT:", event.type, event.id);

    try {
      switch (event.type) {
        /**
         * ✅ Elements subscription flow:
         * invoice.paid is the best signal that money was captured successfully.
         */
        case "invoice.paid": {
          const inv = event.data.object as Stripe.Invoice;

          const invoiceId = inv.id;
          const customerId = s(inv.customer);
          const subId = s((inv as any).subscription);

          // ---- Update user subscription status ----
          if (subId) {
            await User.findOneAndUpdate(
              { stripeSubscriptionId: subId },
              {
                subscriptionStatus: "active",
                ...(customerId ? { stripeCustomerId: customerId } : {}),
              }
            );
          } else if (customerId) {
            await User.findOneAndUpdate(
              { stripeCustomerId: customerId },
              { subscriptionStatus: "active" }
            );
          }

          // ---- Domain automation ----
          if (!subId) {
            console.log("ℹ️ invoice.paid has no subscription id; skipping domain automation");
            break;
          }

          // Load subscription metadata (domainOrderId link)
          let domainOrderIdFromMeta: string | null = null;
          try {
            const sub = await stripe.subscriptions.retrieve(subId);
            domainOrderIdFromMeta = (sub?.metadata as any)?.domainOrderId || null;
          } catch (e: any) {
            console.warn("⚠️ Failed to retrieve subscription for metadata:", e?.message || e);
          }

          const order = await findDomainOrder({
            subId,
            customerId,
            domainOrderIdFromMeta,
          });

          if (!order) {
            console.log("ℹ️ No DomainOrder found for subscription:", subId);
            break;
          }

          /**
           * ✅ Strong idempotency:
           * - If we already processed this invoice, stop.
           * - If already submitted/completed, stop.
           */
          // If your DomainOrder model doesn't have stripeInvoiceId yet,
          // keep this as a soft check by comparing providerResponse or stripeEventId.
          const alreadyDone =
            order.status === "submitted" || order.status === "completed";

          if (alreadyDone) {
            console.log("ℹ️ DomainOrder already processed:", String(order._id), order.status);
            break;
          }

          // If we processed this exact Stripe event already
          if (order.stripeEventId && order.stripeEventId === event.id) {
            console.log("ℹ️ Duplicate event ignored:", event.id);
            break;
          }

          // Mark paid + store linkage
          order.status = "paid";
          order.stripeEventId = event.id;
          order.stripeCustomerId = customerId ?? order.stripeCustomerId ?? null;
          order.stripeSubscriptionId = subId ?? order.stripeSubscriptionId ?? null;

          // Optional: store invoice id if you add this field to schema
          // (recommended; see note below)
          (order as any).stripeInvoiceId = invoiceId;

          await order.save();

          if (!AUTO) {
            console.log("ℹ️ OPENPROVIDER_AUTO_SUBMIT=false; order marked paid only");
            break;
          }

          try {
            // Mark submitted before calling provider
            order.status = "submitted";
            await order.save();

            let providerResp: any;

            if (order.domainType === "new") {
              providerResp = await openprovider.registerDomain(order.domain);
            } else {
              providerResp = await openprovider.submitTransfer(
                order.domain,
                order.authCode || ""
              );
            }

            order.status = "completed";
            order.providerResponse = providerResp;
            order.providerError = null;
            await order.save();

            console.log("✅ Domain automation completed:", order.domain, order.domainType);
          } catch (e: any) {
            order.status = "failed";
            order.providerError = e?.message || "Openprovider purchase failed";
            await order.save();

            console.error("🛑 Domain automation failed:", order.domain, e?.message || e);
          }

          break;
        }

        /**
         * Optional fallback: Checkout sessions (if you later use Stripe Checkout)
         */
        case "checkout.session.completed": {
          const sObj = event.data.object as Stripe.Checkout.Session;

          const customerId = s(sObj.customer);
          const subId = s(sObj.subscription);

          let user =
            sObj.metadata?.userId
              ? await User.findById(sObj.metadata.userId)
              : customerId
              ? await User.findOne({ stripeCustomerId: customerId })
              : null;

          if (!user) {
            const email = (sObj.customer_details?.email || sObj.customer_email || "")
              .toLowerCase()
              .trim();
            if (email) user = await User.findOne({ email });
          }

          if (user) {
            await User.findByIdAndUpdate(user._id, {
              stripeCustomerId: customerId ?? user.stripeCustomerId,
              stripeSubscriptionId: subId ?? user.stripeSubscriptionId,
              subscriptionStatus: "active",
            });
          }

          break;
        }

        case "invoice.payment_failed": {
          const inv = event.data.object as Stripe.Invoice;
          const subId = s((inv as any).subscription);
          const customerId = s(inv.customer);

          if (subId) {
            await User.findOneAndUpdate(
              { stripeSubscriptionId: subId },
              { subscriptionStatus: "past_due" }
            );
          } else if (customerId) {
            await User.findOneAndUpdate(
              { stripeCustomerId: customerId },
              { subscriptionStatus: "past_due" }
            );
          }

          break;
        }

        case "customer.subscription.deleted": {
          const sub = event.data.object as Stripe.Subscription;
          await User.findOneAndUpdate(
            { stripeSubscriptionId: sub.id },
            { subscriptionStatus: null, priceId: null, stripeSubscriptionId: null }
          );
          break;
        }

        default:
          // ignore other events
          break;
      }
    } catch (e: any) {
      console.error("Webhook handler error:", e?.message || e);
      // Acknowledge anyway so Stripe doesn't retry forever.
    }

    res.json({ received: true });
  }
);

export default r;
