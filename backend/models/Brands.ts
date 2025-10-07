// import mongoose, { Schema, Document } from "mongoose";

// export interface BrandItem {
//   imageUrl: string;   // "assets/imgs/brands/01.png" or absolute URL
//   href?: string;      // "#0" or external link
//   alt?: string;       // "Brand 1"
// }

// export interface BrandsDocument extends Document {
//   userId: string;
//   templateId: string;
//   items: BrandItem[];
//   createdAt: Date;
//   updatedAt: Date;
// }

// const brandItemSchema = new Schema<BrandItem>(
//   {
//     imageUrl: { type: String, required: true, trim: true },
//     href:     { type: String, default: "#", trim: true },
//     alt:      { type: String, default: "", trim: true },
//   },
//   { _id: false }
// );

// const brandsSchema = new Schema<BrandsDocument>(
//   {
//     userId:     { type: String, required: true, index: true },
//     templateId: { type: String, required: true, index: true },
//     items:      { type: [brandItemSchema], default: [] },
//   },
//   { timestamps: true }
// );

// // one override per (userId, templateId)
// brandsSchema.index({ userId: 1, templateId: 1 }, { unique: true });

// export default (mongoose.models.Brands as mongoose.Model<BrandsDocument>) ||
//   mongoose.model<BrandsDocument>("Brands", brandsSchema);


// // og
// import mongoose, { Schema, Document } from "mongoose";

// export interface BrandItem {
//   /** Absolute URL (CDN/website). Leave empty if you use imageKey. */
//   imageUrl?: string;
//   /** S3 key (e.g. "sections/brands/123.png"). Leave empty if you use imageUrl. */
//   imageKey?: string;
//   href?: string;
//   alt?: string;
//   order?: number;
// }

// export interface BrandsDocument extends Document {
//   userId: string;
//   templateId: string;
//   items: BrandItem[];
//   createdAt: Date;
//   updatedAt: Date;
// }

// const brandItemSchema = new Schema<BrandItem>(
//   {
//     imageUrl: { type: String, trim: true, default: "" },
//     imageKey: { type: String, trim: true, default: "" },
//     href:     { type: String, trim: true, default: "#" },
//     alt:      { type: String, trim: true, default: "" },
//     order:    { type: Number, default: 0 },
//   },
//   { _id: false }
// );

// // Require at least one of (imageUrl, imageKey)
// brandItemSchema.path("imageUrl").validate(function (this: BrandItem) {
//   return !!(this.imageUrl || this.imageKey);
// }, "Either imageUrl or imageKey is required");

// const brandsSchema = new Schema<BrandsDocument>(
//   {
//     userId:     { type: String, required: true, index: true },
//     templateId: { type: String, required: true, index: true },
//     items:      { type: [brandItemSchema], default: [] },
//   },
//   { timestamps: true }
// );

// // one override per (userId, templateId)
// brandsSchema.index({ userId: 1, templateId: 1 }, { unique: true });

// export default (mongoose.models.Brands as mongoose.Model<BrandsDocument>) ||
//   mongoose.model<BrandsDocument>("Brands", brandsSchema);















import mongoose, { Schema, Document } from "mongoose";

export interface BrandItem {
  /** Absolute URL (CDN/website) or theme asset path (assets/...). Leave empty if you use imageKey. */
  imageUrl?: string;
  /** S3 key (e.g. "sections/brands/123.png"). Leave empty if you use imageUrl. */
  imageKey?: string;
  href?: string;
  alt?: string;
  order?: number;
}

export interface BrandsDocument extends Document {
  userId: string;
  templateId: string;
  items: BrandItem[];
  createdAt: Date;
  updatedAt: Date;
}

const brandItemSchema = new Schema<BrandItem>(
  {
    imageUrl: { type: String, trim: true, default: "" },
    imageKey: { type: String, trim: true, default: "" },
    href:     { type: String, trim: true, default: "#" },
    alt:      { type: String, trim: true, default: "" },
    order:    { type: Number, default: 0 },
  },
  { _id: false }
);

// Require at least one of (imageUrl, imageKey)
brandItemSchema.path("imageUrl").validate(function (this: BrandItem) {
  return !!(this.imageUrl || this.imageKey);
}, "Either imageUrl or imageKey is required");

const brandsSchema = new Schema<BrandsDocument>(
  {
    userId:     { type: String, required: true, index: true },
    templateId: { type: String, required: true, index: true },
    items:      { type: [brandItemSchema], default: [] },
  },
  { timestamps: true }
);

// one override per (userId, templateId)
brandsSchema.index({ userId: 1, templateId: 1 }, { unique: true });

export default (mongoose.models.Brands as mongoose.Model<BrandsDocument>) ||
  mongoose.model<BrandsDocument>("Brands", brandsSchema);
