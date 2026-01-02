import mongoose, { Schema, Document } from "mongoose";

export type DomainStatus = "pending" | "active" | "disabled";

export interface IDomainMapping extends Document {
  domain: string;
  userId: string;
  templateId: string;
  templateVersion: string;
  status: DomainStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export function normalizeDomain(value: string) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "") // remove protocol if pasted
    .replace(/\/.*$/, "")        // remove path
    .replace(/\?.*$/, "")        // remove query
    .replace(/#.*$/, "")         // remove hash
    .replace(/\.$/, "");         // remove trailing dot
}

const DomainMappingSchema = new Schema<IDomainMapping>(
  {
    domain: { type: String, required: true, unique: true, index: true, trim: true },
    userId: { type: String, required: true, index: true, trim: true },
    templateId: { type: String, required: true, index: true, trim: true },
    templateVersion: { type: String, default: "v1", trim: true },
    status: {
      type: String,
      enum: ["pending", "active", "disabled"],
      default: "active",
      index: true,
    },
    notes: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

DomainMappingSchema.pre("validate", function (next) {
  // @ts-ignore
  if (this.domain) this.domain = normalizeDomain(this.domain);
  next();
});

const DomainMapping =
  mongoose.models.DomainMapping ||
  mongoose.model<IDomainMapping>("DomainMapping", DomainMappingSchema);

export default DomainMapping;
export { DomainMapping };
