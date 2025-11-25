

import { Schema, model, Document } from "mongoose";

export interface ITeamMember extends Document {
  userId: string;
  templateId: string;
  name: string;
  role: string;
  imageUrl: string; // S3 key
  socials: Record<string, string>; // flexible
}

const TeamMemberSchema = new Schema<ITeamMember>(
  {
    userId: { type: String, required: true, index: true },
    templateId: { type: String, required: true, index: true },
    name: { type: String, default: "" },
    role: { type: String, default: "" },
    imageUrl: { type: String, default: "" }, // stores S3 key
    // more flexible than fixed fields; supports facebook/instagram/twitter/linkedin/youtube/etc
    socials: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// fast lookups per user/template
TeamMemberSchema.index({ userId: 1, templateId: 1 });

export default model<ITeamMember>("TeamMember", TeamMemberSchema);
