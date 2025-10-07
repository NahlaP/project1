import mongoose, { Schema, Document } from "mongoose";

export interface MarqueeItem {
  text: string;   // e.g. "UI-UX Experience"
  icon?: string;  // e.g. "*" or an emoji / char / class if you want
}

export interface MarqueeDocument extends Document {
  userId: string;
  templateId: string;
  items: MarqueeItem[];
  createdAt: Date;
  updatedAt: Date;
}

const itemSchema = new Schema<MarqueeItem>(
  {
    text: { type: String, required: true, trim: true },
    icon: { type: String, default: "*" },
  },
  { _id: false }
);

const marqueeSchema = new Schema<MarqueeDocument>(
  {
    userId:     { type: String, required: true, index: true },
    templateId: { type: String, required: true, index: true },
    items:      { type: [itemSchema], default: [] },
  },
  { timestamps: true }
);

// One marquee override per (userId, templateId)
marqueeSchema.index({ userId: 1, templateId: 1 }, { unique: true });

export default (mongoose.models.Marquee as mongoose.Model<MarqueeDocument>) ||
  mongoose.model<MarqueeDocument>("Marquee", marqueeSchema);
