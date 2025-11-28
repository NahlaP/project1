// backend/models/Visitor.ts
import { Schema, model, models, Document } from "mongoose";

export interface IVisitor extends Document {
  appUserId: string;      // your ION7 user id (owner of the site)
  templateId?: string;    // which template (sir-template-1, gym-template-1, ...)
  visitorId: string;      // uuid stored in browser localStorage
  ip: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VisitorSchema = new Schema<IVisitor>(
  {
    appUserId: { type: String, required: true, index: true },
    templateId: { type: String, index: true },
    visitorId: { type: String, required: true },
    ip: { type: String, required: true },
    userAgent: String,
  },
  { timestamps: true }
);

// 🔑 avoid duplicates: same user + same fingerprint + same IP + same day
VisitorSchema.index(
  {
    appUserId: 1,
    templateId: 1,
    visitorId: 1,
    ip: 1,
    createdAt: 1,
  },
  { name: "visitor_dedupe_idx" }
);

const Visitor =
  models.Visitor || model<IVisitor>("Visitor", VisitorSchema);

export default Visitor;
