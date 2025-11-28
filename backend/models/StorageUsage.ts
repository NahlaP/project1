// backend/models/StorageUsage.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IStorageUsage extends Document {
  userId: mongoose.Types.ObjectId;
  usedBytes: number;
  lastMeasuredAt: Date;
}

const StorageUsageSchema = new Schema<IStorageUsage>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    usedBytes: { type: Number, default: 0 },
    lastMeasuredAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.StorageUsage ||
  mongoose.model<IStorageUsage>("StorageUsage", StorageUsageSchema);
