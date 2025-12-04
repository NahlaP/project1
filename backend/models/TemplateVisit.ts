// backend/models/TemplateVisit.ts
import mongoose, { Schema, Document } from "mongoose";

export interface ITemplateVisit extends Document {
  userId: string;        // ION7 user (uid)
  templateId: string;    // sir-template-1, gym-template-1, etc
  date: string;          // YYYY-MM-DD
  page?: string;         // /landing.html?uid=...&tpl=...
  referrer?: string;     // document.referrer
  count: number;
  createdAt: Date;
  updatedAt: Date;
}

const TemplateVisitSchema = new Schema<ITemplateVisit>(
  {
    userId: { type: String, required: true, index: true },
    templateId: { type: String, required: true, index: true },
    date: { type: String, required: true, index: true }, // '2025-12-03'
    page: { type: String },
    referrer: { type: String },
    count: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// One record per (userId, templateId, date)
TemplateVisitSchema.index(
  { userId: 1, templateId: 1, date: 1 },
  { unique: true }
);

export default mongoose.model<ITemplateVisit>(
  "TemplateVisit",
  TemplateVisitSchema
);
