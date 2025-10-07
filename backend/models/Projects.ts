import mongoose, { Schema, Document } from "mongoose";

export interface ProjectItem {
  imageUrl: string;     // S3 key (NOT full url)
  imageAlt?: string;
  tag?: string;         // small label (e.g., “Branding”)
  title?: string;       // project title
  year?: string;        // free text, e.g., "2023"
  href?: string;        // link to details page
  order?: number;       // optional manual order
}

export interface ProjectsDocument extends Document {
  userId: string;
  templateId: string;
  projects: ProjectItem[];
  createdAt: Date;
  updatedAt: Date;
}

const projectItemSchema = new Schema<ProjectItem>(
  {
    imageUrl: { type: String, default: "" },
    imageAlt: { type: String, default: "Project image" },
    tag:      { type: String, default: "" },
    title:    { type: String, default: "" },
    year:     { type: String, default: "" },
    href:     { type: String, default: "" },
    order:    { type: Number, default: 0 },
  },
  { _id: false }
);

const projectsSchema = new Schema<ProjectsDocument>(
  {
    userId:     { type: String, required: true, index: true },
    templateId: { type: String, required: true, index: true },
    projects:   { type: [projectItemSchema], default: [] },
  },
  { timestamps: true }
);

// one override per user/template
projectsSchema.index({ userId: 1, templateId: 1 }, { unique: true });

export default (mongoose.models.Projects as mongoose.Model<ProjectsDocument>) ||
  mongoose.model<ProjectsDocument>("Projects", projectsSchema);
