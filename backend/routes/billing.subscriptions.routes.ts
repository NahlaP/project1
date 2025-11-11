// // backend/routes/billing.subscriptions.routes.ts
// import { Router } from "express";
// import Stripe from "stripe";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: "2025-09-30.clover",
// });

// const r = Router();

// /**
//  * GET /api/billing/elements/subscriptions/:id
//  * Used by welcome.js to verify subscription and show receipt
//  */
// r.get("/elements/subscriptions/:id", async (req, res) => {
//   try {
//     const id = req.params.id;
//     if (!id) return res.status(400).json({ error: "Missing subscription id" });

//     const sub = await stripe.subscriptions.retrieve(id, { expand: ["items.data.price"] });
//     if (!sub) return res.status(404).json({ error: "Subscription not found" });

//     res.json(sub);
//   } catch (e: any) {
//     console.error("[billing.subscriptions.routes] error:", e.message);
//     res.status(500).json({ error: e.message || "Internal server error" });
//   }
// });

// export default r;
