import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITenant extends Document<Types.ObjectId> {
  name: string;

  // which template the tenant uses by default
  templateId: string; // e.g. "gym-template-1"
  templateVersion?: string | null; // e.g. "v1"

  // per-tenant storage isolation on the same S3 bucket
  s3Prefix: string; // e.g. "tenants/<tenantId>/"

  // optional tenant settings (keep minimal for now)
  settings?: {
    emailAccountLimit?: number;
    emailStorageLimitMb?: number;
    storageLimitGb?: number;
  };

  createdAt: Date;
  updatedAt: Date;
}

const TenantSchema = new Schema<ITenant>(
  {
    name: { type: String, required: true, trim: true },

    templateId: { type: String, required: true, trim: true },
    templateVersion: { type: String, default: null, trim: true },

    s3Prefix: { type: String, required: true, trim: true },

    settings: {
      emailAccountLimit: { type: Number, default: null },
      emailStorageLimitMb: { type: Number, default: null },
      storageLimitGb: { type: Number, default: null },
    },
  },
  { timestamps: true }
);

export default mongoose.model<ITenant>("Tenant", TenantSchema);
