// import mongoose, { Schema, Document } from "mongoose";

// export interface ITemplateSection {
//   type: string;           // 'hero', ...
//   order: number;
//   visible: boolean;
//   pageSlug?: string;      // e.g., 'home'
//   content: any;           // flexible JSON (text, imageKey/imageUrl, etc.)
// }

// export interface ITemplate extends Document {
//   templateId: string;     // e.g., 'gym-template-1'
//   name: string;
//   version: number;
//   defaultSections: ITemplateSection[];
//   createdAt: Date;
//   updatedAt: Date;
// }

// const TemplateSectionSchema = new Schema<ITemplateSection>(
//   {
//     type: { type: String, required: true },
//     order: { type: Number, default: 0 },
//     visible: { type: Boolean, default: true },
//     pageSlug: { type: String },
//     content: { type: Schema.Types.Mixed, required: true },
//   },
//   { _id: false }
// );

// const TemplateSchema = new Schema<ITemplate>(
//   {
//     templateId: { type: String, required: true, unique: true, index: true },
//     name: { type: String, required: true },
//     version: { type: Number, default: 1 },
//     defaultSections: { type: [TemplateSectionSchema], default: [] },
//   },
//   { timestamps: true }
// );

// export const TemplateModel =
//   (mongoose.models.Template as mongoose.Model<ITemplate>) ||
//   mongoose.model<ITemplate>("Template", TemplateSchema);







import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDefaultSection {
  type: string;
  title?: string;
  slug?: string;
  order?: number;
  parentPageId?: string | null;
   parentSlug?: string | null;  
  visible?: boolean;
  content?: any;
}

export interface ITemplate extends Document {
  templateId: string;
  name: string;
  version: number;
  defaultSections: IDefaultSection[];
  createdAt: Date;
  updatedAt: Date;
}

// models/Template.ts
const DefaultSectionSchema = new Schema<IDefaultSection>(
  {
    type:         { type: String, required: true },
    title:        { type: String },
    slug:         { type: String },
    order:        { type: Number, default: 0 },
    parentPageId: { type: String, default: null },
    parentSlug:   { type: String, default: null },   // 👈 add this
    visible:      { type: Boolean, default: true },
    content:      { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);


const TemplateSchema = new Schema<ITemplate>(
  {
    templateId:      { type: String, required: true, unique: true, index: true },
    name:            { type: String, required: true },
    version:         { type: Number, default: 1 },
    defaultSections: { type: [DefaultSectionSchema], default: [] },
  },
  { timestamps: true }
);

export const TemplateModel: Model<ITemplate> =
  (mongoose.models.Template as Model<ITemplate>) ||
  mongoose.model<ITemplate>("Template", TemplateSchema);
