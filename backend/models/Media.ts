import { Schema, model, Types } from "mongoose";

export type MediaType = "image" | "video";

const MediaSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    templateId: { type: String, required: true, index: true },

    type: { type: String, enum: ["image", "video"], required: true },
    url: { type: String, required: true },      // public url (s3 or local)
    key: { type: String },                      // s3 key or local path
    name: { type: String },                     // original filename
    size: { type: Number },                     // bytes
    mime: { type: String },                     // image/png etc
  },
  { timestamps: true }
);

export default model("Media", MediaSchema);
