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

import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISection extends Document {
  userId: string;
  templateId: string;
  type: string; // 'page' or section type like 'hero', 'about', etc.
  title?: string;
  slug?: string; // for pages only
  order: number;
  content?: any;
  parentPageId?: Types.ObjectId; // 👈 Add this line
}

const SectionSchema: Schema = new Schema<ISection>(
  {
    userId: { type: String, required: true },
    templateId: { type: String, required: true },
    type: { type: String, required: true },
    title: { type: String },
    slug: { type: String, index: true, sparse: true },
    order: { type: Number, default: 0 },
    content: Schema.Types.Mixed,
    parentPageId: { type: Schema.Types.ObjectId, ref: 'Section', default: null }, // 👈 Add this line
  },
  { timestamps: true }
);

export default mongoose.model<ISection>('Section', SectionSchema);
