import mongoose, { Schema, Document } from "mongoose"; 

export type SectionContent = any; // or a stricter type if you want

export interface IDefaultSection {
  type: string;
  order: number;
  content?: SectionContent;
  title?: string;
  slug?: string;
  collapsed?: boolean;
}

export interface ITemplateVersion {
  tag: string;            // e.g. "v1"
  number: number;         // e.g. 1
  baseUrl: string;        // S3 base url for that version
  defaultSections: IDefaultSection[];
}

export interface ITemplate extends Document {
  templateId: string;          // "sir-template-1"
  currentTag?: string;         // which version is current
  versions: ITemplateVersion[];
}

/* ---------- Sub-schemas ---------- */

// A single “default section” row (turn off _id so arrays don’t create ids for each element)
const DefaultSectionSchema = new Schema<IDefaultSection>(
  {
    type: { type: String, required: true },
    order: { type: Number, required: true },
    title: { type: String },
    slug: { type: String },
    collapsed: { type: Boolean, default: false },
    // content is free-form JSON -> Mixed
    content: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

// One version block
const TemplateVersionSchema = new Schema<ITemplateVersion>(
  {
    tag: { type: String, required: true },      // "v1"
    number: { type: Number, required: true },   // 1
    baseUrl: { type: String, required: true },  // S3 base
    defaultSections: { type: [DefaultSectionSchema], default: [] },
  },
  { _id: false }
);

// Root template schema
const TemplateSchema = new Schema<ITemplate>({
  templateId: { type: String, index: true, required: true, unique: true },
  currentTag: { type: String, default: undefined },
  versions: { type: [TemplateVersionSchema], default: [] },
});

// Avoid OverwriteModelError in dev/hot-reload
export const TemplateModel =
  mongoose.models.Template ||
  mongoose.model<ITemplate>("Template", TemplateSchema);
