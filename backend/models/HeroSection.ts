

  import mongoose, { Schema, Document } from "mongoose";

export interface HeroSectionDocument extends Document {
  userId: string;
  templateId: string;

  content?: string;      // headline
  imageUrl?: string;     // S3 key for image (poster/fallback if you like)

  videoKey?: string;     // S3 key for hero video
  posterKey?: string;    // S3 key for hero poster image (optional)

  createdAt: Date;
  updatedAt: Date;
}

const HeroSectionSchema = new Schema<HeroSectionDocument>(
  {
    userId: { type: String, required: true, index: true },
    templateId: { type: String, required: true, index: true },

    content: { type: String, default: "" },
    imageUrl: { type: String },   // kept for backwards compatibility

    videoKey: { type: String, default: "" },
    posterKey: { type: String, default: "" },
  },
  { timestamps: true }
);

// one hero doc per user+template
HeroSectionSchema.index({ userId: 1, templateId: 1 }, { unique: true });

export default (mongoose.models.HeroSection as mongoose.Model<HeroSectionDocument>) ||
  mongoose.model<HeroSectionDocument>("HeroSection", HeroSectionSchema);
