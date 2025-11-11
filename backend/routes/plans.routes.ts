



import { Router } from "express";
import Stripe from "stripe";

const r = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const REQUIRED_ENV_KEYS = ["PRICE_STARTER_M", "PRICE_PRO_M", "PRICE_STARTER_Y", "PRICE_PRO_Y"];
const CURRENCY = process.env.BILLING_CURRENCY || "AED";
const missingEnvKeys = () => REQUIRED_ENV_KEYS.filter((k) => !process.env[k]);

// List plans for Choose Plan
r.get("/", (_req, res) => {
  const missing = missingEnvKeys();
  if (missing.length) {
    return res.status(500).json({
      error: "Missing required Stripe Price IDs in environment",
      missing,
      hint: "Add price_ IDs to your backend .env and restart the server.",
    });
  }
  res.json({
    currency: CURRENCY,
    monthly: [
      { key: "starter", name: "Starter", price: 109, priceId: process.env.PRICE_STARTER_M },
      { key: "pro", name: "PRO", price: 199, priceId: process.env.PRICE_PRO_M },
    ],
    yearly: [
      { key: "starter", name: "Starter", price: 109 * 12, priceId: process.env.PRICE_STARTER_Y },
      { key: "pro", name: "PRO", price: 199 * 12, priceId: process.env.PRICE_PRO_Y },
    ],
  });
});

// Price details for Order Summary (live from Stripe)
r.get("/price/:id", async (req, res) => {
  try {
    const price = await stripe.prices.retrieve(req.params.id, { expand: ["product"] });
    res.json({
      id: price.id,
      nickname:
        price.nickname ||
        (typeof price.product !== "string" ? (price.product as any).name : "Selected Plan"),
      unit_amount: price.unit_amount ?? null,
      currency: (price.currency || CURRENCY).toUpperCase(),
    });
  } catch (e: any) {
    res.status(404).json({ error: e?.message || "Price not found" });
  }
});

export default r;
