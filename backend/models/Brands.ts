





import mongoose, { Schema, Document } from "mongoose";

export interface BrandItem {
  imageUrl: string;     // S3 key (NOT full url) or assets/...
  imageAlt?: string;
  href?: string;
  order?: number;
}

export interface BrandsDocument extends Document {
  userId: string;
  templateId: string;
  items: BrandItem[];
  createdAt: Date;
  updatedAt: Date;
}

const brandItemSchema = new Schema<BrandItem>(
  {
    imageUrl: { type: String, default: "" },
    imageAlt: { type: String, default: "Brand" },
    href:     { type: String, default: "#0" },
    order:    { type: Number, default: 0 },
  },
  { _id: false }
);

const brandsSchema = new Schema<BrandsDocument>(
  {
    userId:     { type: String, required: true, index: true },
    templateId: { type: String, required: true, index: true },
    items:      { type: [brandItemSchema], default: [] },
  },
  { timestamps: true }
);

// one override per user/template
brandsSchema.index({ userId: 1, templateId: 1 }, { unique: true });

export default (mongoose.models.Brands as mongoose.Model<BrandsDocument>) ||
  mongoose.model<BrandsDocument>("Brands", brandsSchema);
