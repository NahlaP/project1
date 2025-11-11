// og

import mongoose, { Schema, Document, Types } from "mongoose";

export interface IUser extends Document<Types.ObjectId> {
  fullName: string;
  company?: string | null;
  country?: string | null;
  email: string;
  password: string;
  subscriptionStatus?: "active" | "incomplete" | "past_due" | null;
  priceId?: string | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  loginCount: number;
  lastLoginAt: Date | null;
}

const userSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true },
    company: { type: String, default: null },
    country: { type: String, default: null },
    email: { type: String, required: true, index: { unique: true } },
    password: { type: String, required: true },
    subscriptionStatus: { type: String, default: null },
    priceId: { type: String, default: null },
    stripeCustomerId: { type: String, default: null },
    stripeSubscriptionId: { type: String, default: null },
    loginCount: { type: Number, default: 0 },
    lastLoginAt: { type: Date, default: null }
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", userSchema);












