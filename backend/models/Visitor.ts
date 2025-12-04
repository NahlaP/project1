// backend/models/Visitor.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVisitor extends Document {
  visitorId: string;
  ip: string;
  userAgent?: string;
  userId?: string;       // which ION7 user (tenant)
  templateId?: string;   // which template
  createdAt: Date;
  updatedAt: Date;
}

const VisitorSchema = new Schema<IVisitor>(
  {
    visitorId: { type: String, required: true },
    ip: { type: String, required: true },
    userAgent: { type: String },
    userId: { type: String },      // optional but recommended
    templateId: { type: String },  // optional but recommended
  },
  { timestamps: true }
);

export const Visitor: Model<IVisitor> =
  mongoose.models.Visitor || mongoose.model<IVisitor>("Visitor", VisitorSchema);
