
// import mongoose from "mongoose";

// const testimonialSchema = new mongoose.Schema({
//   userId: { type: String, required: true },
//   templateId: { type: String, required: true },
//   name: String,
//   profession: String,
//   message: String,
//   rating: { type: Number, default: 5 },
//   imageUrl: String,
// }, { timestamps: true });

// export default mongoose.model("Testimonial", testimonialSchema);
import mongoose, { Schema, Document } from 'mongoose';

export interface ITestimonial extends Document {
  userId: string;
  templateId: string;
  name: string;
  profession?: string;
  message: string;
  rating: number;
  imageUrl?: string;
}

const TestimonialSchema = new Schema<ITestimonial>(
  {
    userId: { type: String, required: true },
    templateId: { type: String, required: true },
    name: { type: String, required: true },
    profession: { type: String },
    message: { type: String, required: true },
    rating: { type: Number, default: 5 },
    imageUrl: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model<ITestimonial>('Testimonial', TestimonialSchema);
