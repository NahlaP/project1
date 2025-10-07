
// import mongoose, { Schema, Document } from 'mongoose';

// export interface ITestimonial extends Document {
//   userId: string;
//   templateId: string;
//   name: string;
//   profession?: string;
//   message: string;
//   rating: number;
//   imageUrl?: string;
// }

// const TestimonialSchema = new Schema<ITestimonial>(
//   {
//     userId: { type: String, required: true },
//     templateId: { type: String, required: true },
//     name: { type: String, required: true },
//     profession: { type: String },
//     message: { type: String, required: true },
//     rating: { type: Number, default: 5 },
//     imageUrl: { type: String }
//   },
//   { timestamps: true }
// );

// export default mongoose.model<ITestimonial>('Testimonial', TestimonialSchema);





import mongoose, { Schema, Document } from "mongoose";

export interface ITestimonial extends Document {
  userId: string;
  templateId: string;
  name: string;
  profession?: string;
  message: string;
  rating: number;    // 1..5
  imageUrl?: string; // S3 key
}

const TestimonialSchema = new Schema<ITestimonial>(
  {
    userId: { type: String, required: true, index: true },
    templateId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    profession: { type: String, default: "" },
    message: { type: String, required: true },
    rating: { type: Number, default: 5, min: 1, max: 5 },
    imageUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

TestimonialSchema.index({ userId: 1, templateId: 1, createdAt: -1 });

export default mongoose.model<ITestimonial>("Testimonial", TestimonialSchema);
