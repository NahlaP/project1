// import mongoose, { Schema, Document } from "mongoose";

// export interface IBlogItem {
//   _id?: mongoose.Types.ObjectId;
//   title: string;           // h3 text
//   excerpt: string;         // short text for the row
//   tag?: string;            // “Inspiration”
//   date?: string;           // free text date (e.g., “August 7, 2022”)
//   href?: string;           // blog-details link
//   imageUrl: string;        // S3 key only (we presign on GET)
//   delay?: string;          // ".2" / ".4" / ".6"  or "0.2s" etc.
//   order?: number;          // for sorting
// }

// export interface IBlogDoc extends Document {
//   userId: string;
//   templateId: string;
//   items: IBlogItem[];
//   createdAt: Date;
//   updatedAt: Date;
// }

// const blogItemSchema = new Schema<IBlogItem>(
//   {
//     title: { type: String, required: true },
//     excerpt: { type: String, default: "" },
//     tag: { type: String, default: "" },
//     date: { type: String, default: "" },
//     href: { type: String, default: "blog-details.html" },
//     imageUrl: { type: String, default: "" },  // S3 key
//     delay: { type: String, default: "" },
//     order: { type: Number, default: 0 },
//   },
//   { _id: true }
// );

// const blogSchema = new Schema<IBlogDoc>(
//   {
//     userId: { type: String, required: true, index: true },
//     templateId: { type: String, required: true, index: true },
//     items: { type: [blogItemSchema], default: [] },
//   },
//   { timestamps: true }
// );

// blogSchema.index({ userId: 1, templateId: 1 }, { unique: true });

// export default mongoose.model<IBlogDoc>("Blog", blogSchema);






import mongoose, { Schema, Document } from "mongoose";

export interface IBlogItem {
  _id?: mongoose.Types.ObjectId;
  title: string;           // h3 text
  excerpt: string;         // short text for the row
  tag?: string;            // “Inspiration”
  date?: string;           // free text (“August 7, 2022”)
  href?: string;           // blog-details link
  imageUrl: string;        // S3 key only (presigned on GET)
  delay?: string;          // ".2" / ".4" / ".6" or "0.2s"
  order?: number;          // for sorting
}

export interface IBlogDoc extends Document {
  userId: string;
  templateId: string;
  items: IBlogItem[];
  createdAt: Date;
  updatedAt: Date;
}

const blogItemSchema = new Schema<IBlogItem>(
  {
    title:    { type: String, required: true },
    excerpt:  { type: String, default: "" },
    tag:      { type: String, default: "" },
    date:     { type: String, default: "" },
    href:     { type: String, default: "blog-details.html" },
    imageUrl: { type: String, default: "" },   // S3 key, not required
    delay:    { type: String, default: "" },
    order:    { type: Number, default: 0 },
  },
  { _id: true }
);

const blogSchema = new Schema<IBlogDoc>(
  {
    userId:     { type: String, required: true, index: true },
    templateId: { type: String, required: true, index: true },
    items:      { type: [blogItemSchema], default: [] },
  },
  { timestamps: true }
);

blogSchema.index({ userId: 1, templateId: 1 }, { unique: true });

export default mongoose.model<IBlogDoc>("Blog", blogSchema);
