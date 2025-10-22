




import mongoose, { Schema, Document } from "mongoose";

export interface Bullet { _id?: string; text: string; }

export interface ServiceItem {
  tag?: string;        // small label
  title?: string;      // service heading (preferred name)
  heading?: string;    // alt key accepted
  href?: string;
}

export interface AboutDocument extends Document {
  userId: string;
  templateId: string;

  title: string;
  subtitle?: string;
  description: string;
  highlight: string;

  imageUrl: string;    // S3 key (or empty); PRESIGNED in controller for GET
  imageAlt: string;

  // NEW:
  lines: string[];                 // animated lines (0..3)
  services: ServiceItem[];         // 3 inline rows
  bullets: Bullet[];

  createdAt: Date;
  updatedAt: Date;
}

const bulletSchema = new Schema<Bullet>({ text: { type: String, required: true } }, { _id: true });

const serviceSchema = new Schema<ServiceItem>(
  {
    tag:     { type: String, default: "" },
    title:   { type: String, default: "" },
    heading: { type: String, default: "" },
    href:    { type: String, default: "" },
  },
  { _id: false }
);

const aboutSchema = new Schema<AboutDocument>(
  {
    userId:     { type: String, required: true, index: true },
    templateId: { type: String, required: true, index: true },

    title:       { type: String, default: "Ultimate Welding and Quality Metal Solutions" },
    subtitle:    { type: String, default: "" },
    description: { type: String, default: "" },
    highlight:   { type: String, default: "We’re Good in All Metal Works Using Quality Welding Tools" },

    imageUrl: { type: String, default: "" },
    imageAlt: { type: String, default: "About Image" },

    // NEW:
    lines:    { type: [String], default: [] },
    services: { type: [serviceSchema], default: [] },

    bullets:  { type: [bulletSchema], default: [] },
  },
  { timestamps: true }
);

aboutSchema.index({ userId: 1, templateId: 1 }, { unique: true });

export default (mongoose.models.About as mongoose.Model<AboutDocument>) ||
  mongoose.model<AboutDocument>("About", aboutSchema);
