import mongoose, { Schema, Document } from "mongoose";

export type DomainOrderStatus =
  | "pending"
  | "paid"
  | "submitted"
  | "completed"
  | "failed";

export interface DomainOrderDoc extends Document {
  userId: mongoose.Types.ObjectId;
  domain: string;
  domainType: "new" | "transfer";
  authCode?: string | null;

  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  stripeEventId?: string | null;

  status: DomainOrderStatus;
  providerResponse?: any;
  providerError?: string | null;
}

const DomainOrderSchema = new Schema<DomainOrderDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    domain: { type: String, required: true, lowercase: true, trim: true },
    domainType: { type: String, enum: ["new", "transfer"], required: true },
    authCode: { type: String, default: null },

    stripeCustomerId: { type: String, default: null, index: true },
    stripeSubscriptionId: { type: String, default: null, index: true },
    stripeEventId: { type: String, default: null, index: true },

    status: {
      type: String,
      enum: ["pending", "paid", "submitted", "completed", "failed"],
      default: "pending",
      index: true,
    },

    providerResponse: { type: Schema.Types.Mixed },
    providerError: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model<DomainOrderDoc>(
  "DomainOrder",
  DomainOrderSchema
);
