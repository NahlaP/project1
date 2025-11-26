import { Request, Response } from "express";
import Stripe from "stripe";
import User from "../models/User";
import Subscription from "../models/Subscription";
import { getSubscriptionState } from "../services/subscription.state";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// small helper
function asMoney(amount?: number | null, currency?: string | null) {
  return {
    amount: amount ?? 0,
    currency: (currency ?? "aed").toLowerCase(),
  };
}

/**
 * CURRENT SUBSCRIPTION WIDGET
 * GET /api/dashboard/current-subscription
 */
export async function getCurrentSubscriptionWidget(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;

    // make sure user + Stripe data is reconciled
    const { user } = await getSubscriptionState(userId);
    if (!user || !user.stripeSubscriptionId) {
      return res.json({
        hasSubscription: false,
        planName: "No Active Subscription",
        status: "none",
      });
    }

    // fetch live data from Stripe
    const stripeSub = await stripe.subscriptions.retrieve(
      user.stripeSubscriptionId,
      { expand: ["items.data.price.product"] }
    );

    const item = stripeSub.items.data[0];
    const price = item.price;
    const product = price.product as any;

    return res.json({
      hasSubscription: true,
      planName: product?.name || "Subscription",
      // Starter = Basic; you can optionally map here if you want:
      // planKey: product?.name === "Starter" ? "Basic" : product?.name,
      status: stripeSub.status, // active, past_due, etc.
      renewsOn: new Date(stripeSub.current_period_end * 1000),
      price: {
        ...asMoney(price.unit_amount ?? undefined, price.currency),
        interval: price.recurring?.interval || "month",
      },
    });
  } catch (err) {
    console.error("getCurrentSubscriptionWidget error", err);
    res.status(500).json({ message: "Failed to load subscription" });
  }
}

/**
 * MY PRODUCTS WIDGET
 * GET /api/dashboard/my-products
 * – lists all subscriptions for this customer (base plan + add-ons)
 */
export async function getMyProductsWidget(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;

    const user = await User.findById(userId).lean();
    if (!user?.stripeCustomerId) {
      return res.json({ items: [] });
    }

    // list all Stripe subscriptions for this customer
    const stripeSubs = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: "all",
      expand: ["data.items.data.price.product"],
      limit: 20,
    });

    const items: any[] = [];

    for (const sub of stripeSubs.data) {
      sub.items.data.forEach((item) => {
        const price = item.price;
        const product = price.product as any;

        items.push({
          id: item.id,
          label: product?.name || "Product",
          // you can later set metadata.type = 'addon-storage', 'addon-email' etc.
          type: (item.metadata as any)?.type || "Base / Add-on",
          status: sub.status,
          ...asMoney(price.unit_amount ?? undefined, price.currency),
          interval: price.recurring?.interval || "month",
        });
      });
    }

    return res.json({ items });
  } catch (err) {
    console.error("getMyProductsWidget error", err);
    res.status(500).json({ message: "Failed to load products" });
  }
}
