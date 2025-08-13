// import mongoose, { Schema, Document } from "mongoose";

// export interface HeroSectionDocument extends Document {
//   userId: string;
//   templateId: string;
//   content: string;
// }

// const HeroSectionSchema = new Schema<HeroSectionDocument>({
//   userId: { type: String, required: true },
//   templateId: { type: String, required: true },
//   content: { type: String, required: true },
  
// }, { timestamps: true });

// export default mongoose.model<HeroSectionDocument>("HeroSection", HeroSectionSchema);

// models/HeroSection.ts
import mongoose, { Schema, Document } from "mongoose";

export interface HeroSectionDocument extends Document {
  userId: string;
  templateId: string;
  content: string;
  imageUrl?: string; // ✅ optional image (AI or user)
}

const HeroSectionSchema = new Schema<HeroSectionDocument>(
  {
    userId: { type: String, required: true },
    templateId: { type: String, required: true },
    content: { type: String, required: true },
    imageUrl: { type: String }, // ✅ AI or user-uploaded image
  },
  { timestamps: true }
);

export default mongoose.model<HeroSectionDocument>("HeroSection", HeroSectionSchema);
