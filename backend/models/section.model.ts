// import mongoose, { Schema, Document } from 'mongoose';

// export interface ISection extends Document {
//   userId: string;
//   templateId: string;
//   type: string;            // 'page' or 'hero' | 'about' | ...
//   title?: string;
//   slug?: string;           // only for pages
//   order: number;           // used for reordering inside group
//   content?: any;           // optional – JSON or whatever you store
// }

// const SectionSchema: Schema = new Schema<ISection>(
//   {
//     userId: { type: String, required: true },
//     templateId: { type: String, required: true },
//     type: { type: String, required: true },
//     title: { type: String },
//     slug: { type: String, index: true, sparse: true },
//     order: { type: Number, default: 0 },
//     content: Schema.Types.Mixed,
//   },
//   { timestamps: true }
// );

// export default mongoose.model<ISection>('Section', SectionSchema);
// og2
// import mongoose, { Schema, Document, Types } from 'mongoose';

// export interface ISection extends Document {
//   userId: string;
//   templateId: string;
//   type: string; // 'page' or section type like 'hero', 'about', etc.
//   title?: string;
//   slug?: string; // for pages only
//   order: number;
//   content?: any;
//   parentPageId?: Types.ObjectId; // 👈 Add this line
// }

// const SectionSchema: Schema = new Schema<ISection>(
//   {
//     userId: { type: String, required: true },
//     templateId: { type: String, required: true },
//     type: { type: String, required: true },
//     title: { type: String },
//     slug: { type: String, index: true, sparse: true },
//     order: { type: Number, default: 0 },
//     content: Schema.Types.Mixed,
//     parentPageId: { type: Schema.Types.ObjectId, ref: 'Section', default: null }, // 👈 Add this line
//   },
//   { timestamps: true }
// );

// export default mongoose.model<ISection>('Section', SectionSchema);











// backend/models/section.model.ts
import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISection extends Document {
  userId: string;
  templateId: string;
  type: string;           // 'page' or section type like 'hero', 'about', etc.
  title?: string;
  slug?: string;          // for pages only
  order: number;
  content?: any;
  parentPageId?: Types.ObjectId | null;
  visible?: boolean;      // ✅ add this
  createdAt: Date;
  updatedAt: Date;
}

const SectionSchema: Schema<ISection> = new Schema(
  {
    userId:       { type: String, required: true, index: true },
    templateId:   { type: String, required: true, index: true },
    type:         { type: String, required: true, index: true },
    title:        { type: String },
    slug:         { type: String, index: true, sparse: true },
    order:        { type: Number, default: 0 },
    content:      { type: Schema.Types.Mixed, default: {} },
    parentPageId: { type: Schema.Types.ObjectId, ref: "Section", default: null },
    visible:      { type: Boolean, default: true },     // ✅ add this
  },
  { timestamps: true }
);

// (avoid duplicate indexes; don't call schema.index({userId:1}) again elsewhere)

export default (mongoose.models.Section as mongoose.Model<ISection>) ||
  mongoose.model<ISection>("Section", SectionSchema);
