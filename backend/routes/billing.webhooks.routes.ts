// // backend/routes/billing.webhooks.routes.ts
// import { Router } from "express";
// import Stripe from "stripe";
// import User from "../models/User";

// const r = Router();

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });
// const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET; // set this if you verify signatures

// r.post("/billing/webhook", express.raw({ type: "application/json" }), async (req, res) => {
//   let event: Stripe.Event;

//   try {
//     if (endpointSecret) {
//       const sig = req.headers["stripe-signature"] as string;
//       event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
//     } else {
//       event = req.body as Stripe.Event;
//     }
//   } catch (err: any) {
//     console.error("⚠️  Webhook signature verification failed.", err.message);
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   try {
//     switch (event.type) {
//       case "invoice.payment_succeeded": {
//         const inv = event.data.object as Stripe.Invoice;
//         const subId = typeof inv.subscription === "string" ? inv.subscription : inv.subscription?.id;
//         const custId = typeof inv.customer === "string" ? inv.customer : inv.customer?.id;

//         // mark user as active if we can find them by subscription/customer (optional: search DB by fields)
//         if (custId) {
//           try {
//             await User.updateOne(
//               { stripeCustomerId: custId },
//               { $set: { subscriptionStatus: "active" } }
//             );
//           } catch {}
//         }
//         break;
//       }

//       case "checkout.session.completed": {
//         const s = event.data.object as Stripe.Checkout.Session;
//         const custId = typeof s.customer === "string" ? s.customer : s.customer?.id;
//         if (custId && s.customer_details?.email) {
//           await stripe.customers.update(custId, {
//             email: s.customer_details.email,
//             name: s.customer_details.name || undefined,
//           });
//         }
//         break;
//       }
//       // add other events as you need
//       default:
//         break;
//     }

//     res.json({ received: true });
//   } catch (e: any) {
//     console.error("Webhook handler error:", e);
//     res.status(500).json({ error: "handler failed" });
//   }
// });

// export default r;




// backend/routes/billing.webhooks.routes.ts
import express from "express";
import { Router } from "express";
import Stripe from "stripe";
import User from "../models/User";

const r = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// IMPORTANT: raw body for Stripe signature verification
r.post("/billing/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  let event: Stripe.Event;

  try {
    if (endpointSecret) {
      const sig = req.headers["stripe-signature"] as string;
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } else {
      event = req.body as Stripe.Event;
    }
  } catch (err: any) {
    console.error("⚠️  Webhook signature verification failed.", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "invoice.payment_succeeded": {
        const inv = event.data.object as Stripe.Invoice;
        const custId = typeof inv.customer === "string" ? inv.customer : inv.customer?.id;
        if (custId) {
          await User.updateOne(
            { stripeCustomerId: custId },
            { $set: { subscriptionStatus: "active" } }
          ).catch(() => {});
        }
        break;
      }
      case "invoice.payment_failed": {
        const inv = event.data.object as Stripe.Invoice;
        const custId = typeof inv.customer === "string" ? inv.customer : inv.customer?.id;
        if (custId) {
          await User.updateOne(
            { stripeCustomerId: custId },
            { $set: { subscriptionStatus: "past_due" } }
          ).catch(() => {});
        }
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const custId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
        if (custId) {
          await User.updateOne(
            { stripeCustomerId: custId },
            { $set: { subscriptionStatus: null } }
          ).catch(() => {});
        }
        break;
      }
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        const custId = typeof s.customer === "string" ? s.customer : s.customer?.id;
        if (custId && s.customer_details?.email) {
          await stripe.customers.update(custId, {
            email: s.customer_details.email,
            name: s.customer_details.name || undefined,
          });
        }
        break;
      }
      default:
        break;
    }

    res.json({ received: true });
  } catch (e: any) {
    console.error("Webhook handler error:", e);
    res.status(500).json({ error: "handler failed" });
  }
});

export default r;
