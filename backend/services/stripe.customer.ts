// backend/services/stripe.customer.ts
import Stripe from "stripe";
import User from "../models/User";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
});

/**
 * Ensure there is a Stripe Customer for this app user.
 * - Reuses existing user.stripeCustomerId
 * - Otherwise looks up by email to avoid dupes
 * - Otherwise creates a new customer
 * - Persists stripeCustomerId on the user
 */
export async function ensureStripeCustomer(userId: string): Promise<string> {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  if (user.stripeCustomerId) return user.stripeCustomerId;

  let customerId: string | null = null;

  // Try to find by email to prevent duplicates
  if (user.email) {
    const search = await stripe.customers.search({
      query: `email:"${user.email}"`,
    });
    if (search.data[0]) {
      customerId = search.data[0].id;
    }
  }

  // Otherwise create
  if (!customerId) {
    const created = await stripe.customers.create({
      email: user.email || undefined,
      name: user.fullName || undefined,
      metadata: { appUserId: String(user._id) },
    });
    customerId = created.id;
  }

  user.stripeCustomerId = customerId;
  await user.save();

  return customerId;
}
