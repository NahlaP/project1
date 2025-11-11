
// og
// backend/routes/billing.embedded.routes.ts
import { Router, Request } from "express";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const r = Router();

/* ----------------------------- Local request type ----------------------------- */
/** Keep this compatible with your auth middleware which sets req.user = { userId: string, ... } */
type AuthedUser = {
  userId: string;
  email?: string;
  name?: string;
};

/** Use an intersection instead of redefining Request.user with an incompatible shape */
type ReqWithUser = Request & { user?: AuthedUser };

const pickEmail = (req: ReqWithUser, emailFromBody?: string) =>
  (req.user?.email || emailFromBody || "").trim();

/* ------------------------------- Stripe helpers ------------------------------- */
async function ensureCustomerByEmail(email: string, name?: string) {
  const existing = await stripe.customers.list({ email, limit: 1 });
  if (existing.data[0]) return existing.data[0].id;
  const created = await stripe.customers.create({
    email,
    name: name || undefined,
  });
  return created.id;
}

/* -------------------------- Create embedded session --------------------------- */
r.post("/embedded/session", async (req: ReqWithUser, res) => {
  try {
    const { priceId, email: emailFromBody } = (req.body || {}) as {
      priceId?: string;
      email?: string;
    };
    if (!priceId) return res.status(400).json({ error: "Missing priceId" });

    const origin =
      (req.headers["x-forwarded-origin"] as string) ||
      (req.headers.origin as string) ||
      `${req.protocol}://${req.get("host")}`;

    const email = pickEmail(req, emailFromBody);

    // Base params for Embedded Checkout (subscription)
    const base: Stripe.Checkout.SessionCreateParams = {
      ui_mode: "embedded",
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],

      // Collect billing in the Stripe iframe
      billing_address_collection: "required",
      phone_number_collection: { enabled: true },

      // ✅ Disable Tax IDs for now (avoids the 400 you saw)
      tax_id_collection: { enabled: false },

      allow_promotion_codes: true,
      automatic_tax: { enabled: true },

      // Where Stripe will send the user back (the iframe will navigate to this)
      return_url: `${origin.replace(/\/$/, "")}/welcome?session_id={CHECKOUT_SESSION_ID}`,
    };

    let session: Stripe.Checkout.Session;

    if (email) {
      // Reuse or create a Customer so email is prefilled
      const customerId = await ensureCustomerByEmail(email, req.user?.name);
      session = await stripe.checkout.sessions.create({
        ...base,
        customer: customerId,
        // If later you re-enable tax_id_collection, also include:
        // customer_update: { name: "auto", address: "auto" },
      });
    } else {
      // No email available – let Stripe collect it inside the iframe
      session = await stripe.checkout.sessions.create(base);
    }

    return res.json({ client_secret: session.client_secret, id: session.id });
  } catch (e: any) {
    console.error("[embedded/session] error:", e);
    res.status(500).json({ error: e?.message || "Internal error" });
  }
});

/* ---------------------------- Inspect a session ---------------------------- */
r.get("/embedded/session/:id", async (req, res) => {
  try {
    const s = await stripe.checkout.sessions.retrieve(req.params.id);
    res.json(s);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Internal error" });
  }
});
// GET /api/billing/session/:id  (alias to retrieve a Checkout Session)
r.get("/session/:id", async (req, res) => {
  try {
    const s = await stripe.checkout.sessions.retrieve(req.params.id, {
      expand: ["subscription", "subscription.items.data.price.product"],
    });
    res.json(s);
  } catch (e: any) {
    res.status(404).json({ error: "Not found" });
  }
});


export default r;














