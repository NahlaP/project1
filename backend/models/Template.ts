

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
