// og

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

const AUTO = String(process.env.OPENPROVIDER_AUTO_SUBMIT || "false").toLowerCase() === "true";

// must be raw for signature verification
r.post("/webhook", bodyParser.raw({ type: "application/json" }), async (req, res) => {
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
      /**
       * ✅ Correct event for your Elements subscription flow:
       * invoice.paid fires when the invoice is successfully paid.
       */
      case "invoice.paid": {
        const inv = event.data.object as Stripe.Invoice;

        const customerId =
          typeof inv.customer === "string" ? inv.customer : (inv.customer as any)?.id || null;

        const rawSub: unknown = (inv as any)["subscription"] ?? null;
        const subId =
          typeof rawSub === "string" ? rawSub : (rawSub && (rawSub as any).id) || null;

        // 1) Update user subscription status
        if (subId) {
          await User.findOneAndUpdate(
            { stripeSubscriptionId: subId },
            { subscriptionStatus: "active", stripeCustomerId: customerId || undefined }
          );
        } else if (customerId) {
          await User.findOneAndUpdate(
            { stripeCustomerId: customerId },
            { subscriptionStatus: "active" }
          );
        }

        // 2) Domain automation (find domainOrderId from subscription metadata)
        if (!subId) break;

        const sub = await stripe.subscriptions.retrieve(subId);
        const domainOrderId = (sub.metadata as any)?.domainOrderId || null;

        if (!domainOrderId) break;

        const order = await DomainOrder.findById(domainOrderId);
        if (!order) break;

        // Idempotency: ignore duplicates
        if (order.stripeEventId === event.id) break;
        if (order.status === "submitted" || order.status === "completed") break;

        // Mark paid
        order.status = "paid";
        order.stripeEventId = event.id;
        order.stripeCustomerId = customerId ?? order.stripeCustomerId ?? null;
        order.stripeSubscriptionId = subId ?? order.stripeSubscriptionId ?? null;
        await order.save();

        if (!AUTO) break;

        try {
          // Mark submitted before calling provider (optional but useful)
          order.status = "submitted";
          await order.save();

          let providerResp: any;

          if (order.domainType === "new") {
            providerResp = await openprovider.registerDomain(order.domain);
          } else {
            providerResp = await openprovider.submitTransfer(order.domain, order.authCode || "");
          }

          order.status = "completed";
          order.providerResponse = providerResp;
          order.providerError = null;
          await order.save();
        } catch (e: any) {
          order.status = "failed";
          order.providerError = e?.message || "Openprovider purchase failed";
          await order.save();
        }

        break;
      }

      /**
       * Keep your existing checkout handler (good as fallback if you later add Checkout sessions),
       * but it is NOT the primary event for your Elements flow.
       */
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;

        const customerId = typeof s.customer === "string" ? s.customer : s.customer?.id || null;
        const subId =
          typeof s.subscription === "string" ? s.subscription : s.subscription?.id || null;

        let user =
          s.metadata?.userId
            ? await User.findById(s.metadata.userId)
            : customerId
            ? await User.findOne({ stripeCustomerId: customerId })
            : null;

        if (!user) {
          const email = (s.customer_details?.email || s.customer_email || "").toLowerCase();
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
        const rawSub: unknown = (inv as any)["subscription"] ?? null;
        const subId =
          typeof rawSub === "string" ? rawSub : (rawSub && (rawSub as any).id) || null;
        const customerId =
          typeof inv.customer === "string" ? inv.customer : (inv.customer as any)?.id || null;

        if (subId)
          await User.findOneAndUpdate({ stripeSubscriptionId: subId }, { subscriptionStatus: "past_due" });
        else if (customerId)
          await User.findOneAndUpdate({ stripeCustomerId: customerId }, { subscriptionStatus: "past_due" });

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
    // still acknowledge so Stripe won’t retry forever
  }

  res.json({ received: true });
});

export default r;















