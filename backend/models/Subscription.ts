// backend/models/Subscription.ts
import mongoose, { Schema, Types } from "mongoose";

const SubscriptionSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", index: true },
    stripeCustomerId: { type: String, index: true },
    stripeSubscriptionId: { type: String, unique: true, index: true },
    status: { type: String, index: true }, // active | trialing | past_due | incomplete | canceled | unpaid
    currentPeriodEnd: { type: Date },
    priceId: { type: String },
    planKey: { type: String },
    currency: { type: String },
    latestInvoiceId: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export default mongoose.models.Subscription ||
  mongoose.model("Subscription", SubscriptionSchema);
