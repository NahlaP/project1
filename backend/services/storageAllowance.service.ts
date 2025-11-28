// backend/services/storageAllowance.service.ts
import Stripe from "stripe";
import User from "../models/User";

const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET) {
  throw new Error("STRIPE_SECRET_KEY is missing in environment");
}

const stripe = new Stripe(STRIPE_SECRET, { apiVersion: "2024-06-20" });

export type StorageAllowance = {
  baseGb: number;
  addonGb: number;
  totalGb: number;
};

// Fallback base from env, default 5 GB
const FALLBACK_BASE_GB = Number(process.env.STORAGE_BASE_GB || 5);

/**
 * Safely read numeric metadata from Stripe objects.
 */
function readNumberMeta(
  obj: Stripe.Price | Stripe.Product | null | undefined,
  key: string
): number {
  const anyObj: any = obj;
  const meta = anyObj?.metadata || {};
  if (!meta[key]) return 0;
  const n = Number(meta[key]);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Fetch product for a given price (without using deep expand).
 */
async function fetchProductForPrice(
  price: Stripe.Price
): Promise<Stripe.Product | null> {
  try {
    if (typeof price.product === "string") {
      const product = await stripe.products.retrieve(price.product);
      return product;
    }
    // already expanded somehow
    return price.product as Stripe.Product | null;
  } catch (err) {
    console.error("[storageAllowance] error fetching product", err);
    return null;
  }
}

/**
 * Reads storage allowance from Stripe subscriptions for a user.
 *
 * Expected metadata on Stripe prices/products:
 *  - storage_base_gb: base storage included in the plan (e.g. "5")
 *  - storage_addon_gb: addon storage (e.g. "2" for +2GB)
 */
export async function getStorageAllowanceForUser(
  userId: string
): Promise<StorageAllowance> {
  const user = await User.findById(userId).lean();
  if (!user) {
    return { baseGb: FALLBACK_BASE_GB, addonGb: 0, totalGb: FALLBACK_BASE_GB };
  }

  const stripeCustomerId = (user as any).stripeCustomerId as
    | string
    | undefined;

  // If user has no Stripe customer – just give base plan from env
  if (!stripeCustomerId) {
    return {
      baseGb: FALLBACK_BASE_GB,
      addonGb: 0,
      totalGb: FALLBACK_BASE_GB,
    };
  }

  // NOTE: no "expand" here – avoids the depth errors
  const subs = await stripe.subscriptions.list({
    customer: stripeCustomerId,
    status: "active",
    limit: 100,
  });

  let baseGb = 0;
  let addonGb = 0;

  for (const sub of subs.data) {
    for (const item of sub.items.data) {
      const price = item.price as Stripe.Price;

      // First read from price metadata
      const baseFromPrice = readNumberMeta(price, "storage_base_gb");
      const addonFromPrice = readNumberMeta(price, "storage_addon_gb");

      // Then, if needed, read from product metadata
      let baseFromProduct = 0;
      let addonFromProduct = 0;

      if (!baseFromPrice || !addonFromPrice) {
        const product = await fetchProductForPrice(price);
        baseFromProduct = readNumberMeta(product, "storage_base_gb");
        addonFromProduct = readNumberMeta(product, "storage_addon_gb");
      }

      baseGb += baseFromPrice || baseFromProduct;
      addonGb += addonFromPrice || addonFromProduct;
    }
  }

  // Fallback if Stripe metadata has nothing
  if (baseGb === 0) {
    baseGb = FALLBACK_BASE_GB;
  }

  const totalGb = baseGb + addonGb;
  return { baseGb, addonGb, totalGb };
}
