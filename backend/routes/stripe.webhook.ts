
// // current one

// import { Router } from "express";
// import bodyParser from "body-parser";
// import Stripe from "stripe";
// import { stripe } from "../services/stripe.service";
// import User from "../models/User";

// const r = Router();

// // must be raw for signature verification
// r.post("/webhook", bodyParser.raw({ type: "application/json" }), async (req, res) => {
//   const sig = req.headers["stripe-signature"] as string;
//   let event: Stripe.Event;

//   try {
//     event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET as string);
//   } catch (err: any) {
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   try {
//     switch (event.type) {
//       case "checkout.session.completed": {
//         const s = event.data.object as Stripe.Checkout.Session;

//         const customerId = typeof s.customer === "string" ? s.customer : s.customer?.id || null;
//         const subId = typeof s.subscription === "string" ? s.subscription : s.subscription?.id || null;

//         let user =
//           s.metadata?.userId ? await User.findById(s.metadata.userId)
//           : customerId ? await User.findOne({ stripeCustomerId: customerId })
//           : null;

//         if (!user) {
//           const email = (s.customer_details?.email || s.customer_email || "").toLowerCase();
//           if (email) user = await User.findOne({ email });
//         }

//         if (user) {
//           await User.findByIdAndUpdate(user._id, {
//             stripeCustomerId: customerId ?? user.stripeCustomerId,
//             stripeSubscriptionId: subId ?? user.stripeSubscriptionId,
//             subscriptionStatus: "active", // treat trialing as active
//           });
//         }
//         break;
//       }

//       case "invoice.payment_failed": {
//         const inv = event.data.object as Stripe.Invoice;
//         const rawSub: unknown = (inv as any)["subscription"] ?? null;
//         const subId = typeof rawSub === "string" ? rawSub : (rawSub && (rawSub as any).id) || null;
//         const customerId = typeof inv.customer === "string" ? inv.customer : (inv.customer as any)?.id || null;

//         if (subId) await User.findOneAndUpdate({ stripeSubscriptionId: subId }, { subscriptionStatus: "past_due" });
//         else if (customerId) await User.findOneAndUpdate({ stripeCustomerId: customerId }, { subscriptionStatus: "past_due" });
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
const op = new OpenproviderService();

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
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      switch (event.type) {
        /* optional: keep your subscription status update */
        case "checkout.session.completed": {
          const s = event.data.object as Stripe.Checkout.Session;

          const customerId =
            typeof s.customer === "string" ? s.customer : s.customer?.id || null;

          const subId =
            typeof s.subscription === "string"
              ? s.subscription
              : s.subscription?.id || null;

          let user =
            s.metadata?.userId
              ? await User.findById(s.metadata.userId)
              : customerId
              ? await User.findOne({ stripeCustomerId: customerId })
              : null;

          if (!user) {
            const email = (
              s.customer_details?.email ||
              s.customer_email ||
              ""
            ).toLowerCase();
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

        /* ✅ MAIN AUTOMATION: after payment, buy domain automatically */
        case "invoice.paid": {
          const inv = event.data.object as Stripe.Invoice;

          // ✅ FIX: Stripe TS types don't always expose Invoice.subscription
          const subAny = (inv as any).subscription;
          const subId =
            typeof subAny === "string" ? subAny : subAny?.id || null;

          if (!subId) break;

          const sub = await stripe.subscriptions.retrieve(subId);
          const meta = sub.metadata || {};

          const domainOrderId = (meta as any).ion7_domain_order_id || "";
          if (!domainOrderId) break; // not a domain purchase

          const order = await DomainOrder.findById(domainOrderId);
          if (!order) break;

          // idempotent
          if (order.status === "submitted" || order.status === "completed") break;

          // update order -> paid
          order.status = "paid";
          (order as any).stripeEventId = event.id; // if your schema has it, keep; otherwise safe
          (order as any).stripeInvoiceId = inv.id;
          (order as any).stripeSubscriptionId = subId;
          (order as any).stripeCustomerId =
            typeof inv.customer === "string"
              ? inv.customer
              : (inv.customer as any)?.id || null;

          await order.save();

          const contact = process.env.OPENPROVIDER_DEFAULT_CONTACT_HANDLE;
          if (!contact)
            throw new Error("Missing OPENPROVIDER_DEFAULT_CONTACT_HANDLE in env");

          try {
            let providerResp: any;

            if (order.domainType === "new") {
              providerResp = await op.registerDomain({
                domain: order.domain,
                ownerHandle: contact,
              });
            } else {
              if (!order.authCode) throw new Error("Missing authCode for transfer");
              providerResp = await op.submitTransfer({
                domain: order.domain,
                authCode: order.authCode,
                ownerHandle: contact,
              });
            }

            await DomainOrder.findByIdAndUpdate(order._id, {
              status: "submitted",
              providerRaw: providerResp,
              providerOperationId:
                providerResp?.raw?.data?.id ||
                providerResp?.raw?.data?.transfer_id ||
                providerResp?.raw?.id ||
                null,
              lastError: null,
            });
          } catch (e: any) {
            await DomainOrder.findByIdAndUpdate(order._id, {
              status: "failed",
              lastError: e?.message || String(e),
            });
          }

          break;
        }

        case "invoice.payment_failed": {
          const inv = event.data.object as Stripe.Invoice;

          const subAny = (inv as any).subscription;
          const subId =
            typeof subAny === "string" ? subAny : subAny?.id || null;

          if (subId) {
            await User.findOneAndUpdate(
              { stripeSubscriptionId: subId },
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
      }
    } catch (e) {
      console.error("Webhook handler error:", e);
    }

    res.json({ received: true });
  }
);

export default r;
