import { Router, Request } from "express";
import Stripe from "stripe";
import User from "../models/User";

const r = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

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
    : s === "canceled"
    ? "canceled"
    : "unknown";

/** Decide whether user can go to dashboard or needs to finalize payment */
function decideNext(sub: Stripe.Subscription | null) {
  if (!sub) return { status: "unknown" as const, next: "stay" as const, priceId: null };

  const status = normStatus(sub.status);
  const item = sub.items?.data?.[0];
  const priceId = item?.price?.id || null;

  // If active/trialing → we're good
  if (status === "active") return { status, next: "dashboard" as const, priceId };

  // If first invoice PI needs action, or payment method missing → send back to checkout
  const latest = sub.latest_invoice;
  let pi: Stripe.PaymentIntent | null = null;
  if (latest && typeof latest !== "string" && isStripeObj(latest, "invoice")) {
    const maybePI = (latest as any).payment_intent;
    if (maybePI && isStripeObj(maybePI, "payment_intent")) pi = maybePI as Stripe.PaymentIntent;
  }

  const needsAction =
    !!pi &&
    (pi.status === "requires_action" ||
      pi.status === "requires_payment_method" ||
      !!(pi.next_action as any));

  if (needsAction || status === "incomplete" || status === "past_due") {
    return { status, next: "checkout" as const, priceId };
  }

  return { status, next: "stay" as const, priceId };
}

/**
 * POST /api/billing/verify
 * body: { sessionId?: string, subId?: string }
 * returns: { ok, status, next: "dashboard"|"checkout"|"stay", priceId?, subId? }
 */
r.post("/verify", async (req: ReqWithUser, res) => {
  try {
    const sessionId: string | undefined =
      (req.body?.sessionId as string) || (req.query.sessionId as string) || undefined;
    const subIdFromBody: string | undefined =
      (req.body?.subId as string) || (req.query.subId as string) || undefined;

    let sub: Stripe.Subscription | null = null;
    let subId = subIdFromBody || null;

    if (sessionId) {
      // From Checkout/Embedded: look up session → subscription
      const s = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["subscription", "subscription.latest_invoice.payment_intent"],
      });

      if (s.subscription) {
        if (typeof s.subscription === "string") {
          subId = s.subscription;
          sub = await stripe.subscriptions.retrieve(subId, {
            expand: ["latest_invoice.payment_intent"],
          });
        } else if (isStripeObj(s.subscription, "subscription")) {
          sub = s.subscription as Stripe.Subscription;
          subId = sub.id;
        }
      }
    } else if (subIdFromBody) {
      // From Elements: the URL carried ?sid=sub_...
      sub = await stripe.subscriptions.retrieve(subIdFromBody, {
        expand: ["latest_invoice.payment_intent"],
      });
      subId = sub?.id || subIdFromBody;
    } else {
      return res.status(400).json({ ok: false, error: "Missing sessionId or subId" });
    }

    const { status, next, priceId } = decideNext(sub);

    // Best-effort: mirror state to your User
    const userId = req.user?.userId;
    if (userId && sub?.customer) {
      const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
      try {
        await User.findByIdAndUpdate(userId, {
          stripeCustomerId: customerId,
          stripeSubscriptionId: subId,
          subscriptionStatus: status,
          priceId: priceId || undefined,
        });
      } catch {}
    }

    return res.json({ ok: true, status, next, priceId, subId });
  } catch (e: any) {
    console.error("[/api/billing/verify] error:", e);
    return res.status(500).json({ ok: false, error: e?.message || "Internal error" });
  }
});

export default r;
