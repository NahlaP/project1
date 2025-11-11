




// // backend/routes/stripe.webhook.ts
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
//       case "checkout.session.completed": {
//         const s = event.data.object as Stripe.Checkout.Session;

//         const customerId =
//           typeof s.customer === "string" ? s.customer : s.customer?.id || null;

//         const subId =
//           typeof s.subscription === "string"
//             ? s.subscription
//             : s.subscription?.id || null;

//         // 1) prefer metadata.userId (best)
//         let user =
//           s.metadata?.userId
//             ? await User.findById(s.metadata.userId)
//             : null;

//         // 2) then by saved stripeCustomerId
//         if (!user && customerId) {
//           user = await User.findOne({ stripeCustomerId: customerId });
//         }

//         // 3) FINAL fallback by email (for older sessions that had no metadata)
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
//         const subId =
//           typeof rawSub === "string" ? rawSub : (rawSub && (rawSub as any).id) || null;

//         const rawCust: unknown = (inv as any)["customer"] ?? null;
//         const customerId =
//           typeof rawCust === "string" ? rawCust : (rawCust && (rawCust as any).id) || null;

//         if (subId) {
//           await User.findOneAndUpdate(
//             { stripeSubscriptionId: subId },
//             { subscriptionStatus: "past_due" }
//           );
//         } else if (customerId) {
//           await User.findOneAndUpdate(
//             { stripeCustomerId: customerId },
//             { subscriptionStatus: "past_due" }
//           );
//         }
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















import { Router } from "express";
import bodyParser from "body-parser";
import Stripe from "stripe";
import { stripe } from "../services/stripe.service";
import User from "../models/User";

const r = Router();

// must be raw for signature verification
r.post("/webhook", bodyParser.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"] as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET as string);
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;

        const customerId = typeof s.customer === "string" ? s.customer : s.customer?.id || null;
        const subId = typeof s.subscription === "string" ? s.subscription : s.subscription?.id || null;

        let user =
          s.metadata?.userId ? await User.findById(s.metadata.userId)
          : customerId ? await User.findOne({ stripeCustomerId: customerId })
          : null;

        if (!user) {
          const email = (s.customer_details?.email || s.customer_email || "").toLowerCase();
          if (email) user = await User.findOne({ email });
        }

        if (user) {
          await User.findByIdAndUpdate(user._id, {
            stripeCustomerId: customerId ?? user.stripeCustomerId,
            stripeSubscriptionId: subId ?? user.stripeSubscriptionId,
            subscriptionStatus: "active", // treat trialing as active
          });
        }
        break;
      }

      case "invoice.payment_failed": {
        const inv = event.data.object as Stripe.Invoice;
        const rawSub: unknown = (inv as any)["subscription"] ?? null;
        const subId = typeof rawSub === "string" ? rawSub : (rawSub && (rawSub as any).id) || null;
        const customerId = typeof inv.customer === "string" ? inv.customer : (inv.customer as any)?.id || null;

        if (subId) await User.findOneAndUpdate({ stripeSubscriptionId: subId }, { subscriptionStatus: "past_due" });
        else if (customerId) await User.findOneAndUpdate({ stripeCustomerId: customerId }, { subscriptionStatus: "past_due" });
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
