
// import { Schema, model, Document } from 'mongoose';

// export type SectionType =
//   | 'hero'
//   | 'about'
//   | 'services'
//   | 'testimonial'
//   | 'team'
//   | 'contact'
//   | 'why-choose'
//   | 'appointment';

// export interface ISection extends Document {
//   userId: string;
//   templateId: string;
//   type: SectionType;
//   title: string;
//   slug?: string; // ✅ Add this optional field
//   order: number;
//   visible: boolean;
//   content: any;
// }


// const SectionSchema = new Schema<ISection>({
//   userId: { type: String, required: true },
//   templateId: { type: String, required: true },
//   type: { type: String, required: true },
//   title: { type: String, required: true },
//   slug: { type: String }, // ✅ Add this line
//   order: { type: Number, required: true },
//   visible: { type: Boolean, default: true },
//   content: { type: Schema.Types.Mixed, default: {} },
// });

// export const Section = model<ISection>('Section', SectionSchema);


















// // og
// import mongoose, { Schema, Document, Model } from "mongoose";

// export interface ISection extends Document {
//   userId: string;            // "demo-user" etc.
//   templateId: string;        // e.g. "sir-template-1"
//   type: string;              // "page" | "hero" | "about" | ...
//   title?: string;
//   slug?: string;
//   order?: number;
//   parentPageId?: string | null;
//   visible?: boolean;
//   content?: any;             // section-specific payload
//   createdAt: Date;
//   updatedAt: Date;
// }

// const SectionSchema = new Schema<ISection>(
//   {
//     userId:        { type: String, required: true, index: true },
//     templateId:    { type: String, required: true, index: true },
//     type:          { type: String, required: true, index: true },
//     title:         { type: String },
//     slug:          { type: String },
//     order:         { type: Number, default: 0, index: true },
//     parentPageId:  { type: String, default: null },
//     visible:       { type: Boolean, default: true },
//     content:       { type: Schema.Types.Mixed, default: {} },
//   },
//   { timestamps: true }
// );

// SectionSchema.index({ userId: 1, templateId: 1, type: 1 });

// const Section: Model<ISection> =
//   (mongoose.models.Section as Model<ISection>) ||
//   mongoose.model<ISection>("Section", SectionSchema);

// export default Section;











// rest
// import mongoose, { Schema, Document, Model } from "mongoose";

// export interface ISection extends Document {
//   userId: string;
//   templateId: string;
//   type: string;              // "page" | "hero" | ...
//   title?: string;
//   slug?: string;
//   order?: number;
//   parentPageId?: string | null;
//   visible?: boolean;
//   content?: any;
//   createdAt: Date;
//   updatedAt: Date;
// }

// const SectionSchema = new Schema<ISection>(
//   {
//     userId:       { type: String, required: true, index: true },
//     templateId:   { type: String, required: true, index: true },
//     type:         { type: String, required: true, index: true },
//     title:        { type: String },
//     slug:         { type: String },
//     order:        { type: Number, default: 0, index: true },
//     parentPageId: { type: String, default: null },
//     visible:      { type: Boolean, default: true },
//     content:      { type: Schema.Types.Mixed, default: {} },
//   },
//   { timestamps: true }
// );

// SectionSchema.index({ userId: 1, templateId: 1, type: 1 });

// const Section: Model<ISection> =
//   (mongoose.models.Section as Model<ISection>) ||
//   mongoose.model<ISection>("Section", SectionSchema);

// export default Section;






// backend/models/Section.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISection extends Document {
  userId: string;
  templateId: string;
  type: string;              // "page" | "hero" | ...
  title?: string;
  slug?: string;
  order?: number;
  parentPageId?: string | null;
  visible?: boolean;
  content?: any;
  createdAt: Date;
  updatedAt: Date;
}

const SectionSchema = new Schema<ISection>(
  {
    userId:       { type: String, required: true, index: true },
    templateId:   { type: String, required: true, index: true },
    type:         { type: String, required: true, index: true },
    title:        { type: String },
    slug:         { type: String },                   // lowercase in pre-save
    order:        { type: Number, default: 0, index: true },
    parentPageId: { type: String, default: null, index: true },
    visible:      { type: Boolean, default: true },
    content:      { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

/* ---------------- Normalization (safe) ---------------- */
SectionSchema.pre("save", function (next) {
  if (this.isModified("type") && typeof this.type === "string") {
    this.type = this.type.toLowerCase();
  }
  if (this.isModified("slug") && typeof this.slug === "string") {
    this.slug = this.slug.trim().toLowerCase();
  }
  next();
});

/* ---------------- Indexes ---------------- */
// Basic compound (queries by user/template/type)
SectionSchema.index({ userId: 1, templateId: 1, type: 1 });

// ⚠️ Prevent duplicate pages with the same slug per user+template.
// Only applies to docs where type==="page" and slug is a string.
SectionSchema.index(
  { userId: 1, templateId: 1, type: 1, slug: 1 },
  {
    unique: true,
    partialFilterExpression: { type: "page", slug: { $type: "string" } },
    name: "uniq_page_slug_per_user_template",
  }
);

// Helpful for listing a page's children ordered
SectionSchema.index(
  { userId: 1, templateId: 1, parentPageId: 1, order: 1 },
  { name: "by_parent_then_order" }
);

const Section: Model<ISection> =
  (mongoose.models.Section as Model<ISection>) ||
  mongoose.model<ISection>("Section", SectionSchema);

export default Section;
