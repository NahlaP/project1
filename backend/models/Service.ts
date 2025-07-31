// backend/models/Service.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IServiceItem {
  _id?: mongoose.Types.ObjectId;
  title: string;
  description: string;
  imageUrl: string;
  delay?: string;          // e.g. "0.1s"
  order?: number;          // for sorting in UI
  buttonText?: string;
  buttonHref?: string;
}

export interface IServiceDoc extends Document {
  userId: string;
  templateId: string;
  services: IServiceItem[];
  createdAt: Date;
  updatedAt: Date;
}

const serviceItemSchema = new Schema<IServiceItem>(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    delay: { type: String, default: "" },
    order: { type: Number, default: 0 },
    buttonText: { type: String, default: "Read More" },
    buttonHref: { type: String, default: "#" },
  },
  { _id: true }
);

const serviceSchema = new Schema<IServiceDoc>(
  {
    userId: { type: String, required: true, index: true },
    templateId: { type: String, required: true, index: true },
    services: { type: [serviceItemSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model<IServiceDoc>("Service", serviceSchema);
