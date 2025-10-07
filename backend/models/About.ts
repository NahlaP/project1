// og
// backend/models/About.ts
// import mongoose from "mongoose";

// const bulletSchema = new mongoose.Schema(
//   {
//     text: { type: String, required: true },
//   },
//   { _id: true }
// );

// const aboutSchema = new mongoose.Schema(
//   {
//     userId: { type: String, required: true },
//     templateId: { type: String, required: true },

//     title: { type: String, default: "Ultimate Welding and Quality Metal Solutions" },
//     description: { type: String, default: "" },
//     highlight: {
//       type: String,
//       default:
//         "We’re Good in All Metal Works Using Quality Welding Tools",
//     },

//     imageUrl: { type: String, default: "/img/about.jpg" },
//     imageAlt: { type: String, default: "About Image" },

//     bullets: { type: [bulletSchema], default: [] },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("About", aboutSchema);









// import mongoose, { Schema, Document } from "mongoose";

// export interface Bullet {
//   _id?: string;
//   text: string;
// }

// export interface AboutDocument extends Document {
//   userId: string;
//   templateId: string;

//   title: string;
//   subtitle?: string;
//   description: string;     // a.k.a. body
//   highlight: string;

//   imageUrl: string;        // S3 key (not full URL)
//   imageAlt: string;

//   bullets: Bullet[];

//   createdAt: Date;
//   updatedAt: Date;
// }

// const bulletSchema = new Schema<Bullet>(
//   {
//     text: { type: String, required: true },
//   },
//   { _id: true }
// );

// const aboutSchema = new Schema<AboutDocument>(
//   {
//     userId:     { type: String, required: true, index: true },
//     templateId: { type: String, required: true, index: true },

//     title:       { type: String, default: "Ultimate Welding and Quality Metal Solutions" },
//     subtitle:    { type: String, default: "" },
//     description: { type: String, default: "" }, // you used "description"; we’ll also accept "body" in controller
//     highlight:   { type: String, default: "We’re Good in All Metal Works Using Quality Welding Tools" },

//     // Store S3 object KEY only here; controller will presign when needed
//     imageUrl: { type: String, default: "" },
//     imageAlt: { type: String, default: "About Image" },

//     bullets: { type: [bulletSchema], default: [] },
//   },
//   { timestamps: true }
// );

// // make (userId, templateId) unique to represent a single override per user/template
// aboutSchema.index({ userId: 1, templateId: 1 }, { unique: true });

// export default (mongoose.models.About as mongoose.Model<AboutDocument>) ||
//   mongoose.model<AboutDocument>("About", aboutSchema);









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
