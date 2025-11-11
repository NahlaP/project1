



import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITemplateSelection extends Document {
  userId: string;      // keep string form so demo-user works
  templateId: string;
  createdAt: Date;
  updatedAt: Date;
}

const TemplateSelectionSchema = new Schema<ITemplateSelection>(
  {
    userId:     { type: String, required: true, index: true },
    templateId: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

// exactly one per user
TemplateSelectionSchema.index({ userId: 1 }, { unique: true });

const TemplateSelection: Model<ITemplateSelection> =
  (mongoose.models.TemplateSelection as Model<ITemplateSelection>) ||
  mongoose.model<ITemplateSelection>("TemplateSelection", TemplateSelectionSchema);

export default TemplateSelection;
