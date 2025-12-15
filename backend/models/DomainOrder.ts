// backend/models/DomainOrder.ts
import mongoose, { Schema } from "mongoose";

type Status = "pending" | "paid" | "submitted" | "completed" | "failed";

const DomainOrderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

    domain: { type: String, required: true, lowercase: true, trim: true, index: true },
    domainType: { type: String, enum: ["new", "transfer"], required: true },

    // transfer only
    authCode: { type: String, default: null },

    // Stripe tracking
    stripeEventId: { type: String, default: null, index: true },
    stripeInvoiceId: { type: String, default: null, index: true },
    stripeSubscriptionId: { type: String, default: null, index: true },
    stripeCustomerId: { type: String, default: null, index: true },

    status: {
      type: String,
      enum: ["pending", "paid", "submitted", "completed", "failed"] as Status[],
      default: "pending",
      index: true,
    },

    provider: { type: String, default: "openprovider" },
    providerOperationId: { type: String, default: null },
    providerRaw: { type: Schema.Types.Mixed, default: null },

    lastError: { type: String, default: null },
  },
  { timestamps: true }
);

export default (mongoose.models.DomainOrder as mongoose.Model<any>) ||
  mongoose.model("DomainOrder", DomainOrderSchema);
