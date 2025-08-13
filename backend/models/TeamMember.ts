// models/TeamMember.ts
import { Schema, model, Document } from "mongoose";

export interface ITeamMember extends Document {
  userId: string;
  templateId: string;
  name: string;
  role: string;
  imageUrl: string;
  socials: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
  };
}

const TeamMemberSchema = new Schema<ITeamMember>(
  {
    userId: { type: String, required: true },
    templateId: { type: String, required: true },
    name: String,
    role: String,
    imageUrl: String,
    socials: {
      facebook: String,
      twitter: String,
      linkedin: String,
      youtube: String,
    },
  },
  { timestamps: true }
);

export default model<ITeamMember>("TeamMember", TeamMemberSchema);
