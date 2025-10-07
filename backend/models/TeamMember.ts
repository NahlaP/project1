// // models/TeamMember.ts
// import { Schema, model, Document } from "mongoose";

// export interface ITeamMember extends Document {
//   userId: string;
//   templateId: string;
//   name: string;
//   role: string;
//   imageUrl: string;
//   socials: {
//     facebook?: string;
//     twitter?: string;
//     linkedin?: string;
//     youtube?: string;
//   };
// }

// const TeamMemberSchema = new Schema<ITeamMember>(
//   {
//     userId: { type: String, required: true },
//     templateId: { type: String, required: true },
//     name: String,
//     role: String,
//     imageUrl: String,
//     socials: {
//       facebook: String,
//       twitter: String,
//       linkedin: String,
//       youtube: String,
//     },
//   },
//   { timestamps: true }
// );

// export default model<ITeamMember>("TeamMember", TeamMemberSchema);





// import { Schema, model, Document } from "mongoose";

// export interface ITeamMember extends Document {
//   userId: string;
//   templateId: string;
//   name: string;
//   role: string;
//   imageUrl: string; // S3 key
//   socials: {
//     facebook?: string;
//     twitter?: string;
//     linkedin?: string;
//     youtube?: string;
//   };
// }

// const TeamMemberSchema = new Schema<ITeamMember>(
//   {
//     userId: { type: String, required: true, index: true },
//     templateId: { type: String, required: true, index: true },
//     name: { type: String, default: "" },
//     role: { type: String, default: "" },
//     imageUrl: { type: String, default: "" }, // stores S3 key
//     socials: {
//       facebook: String,
//       twitter: String,
//       linkedin: String,
//       youtube: String,
//     },
//   },
//   { timestamps: true }
// );

// // fast lookups per user/template
// TeamMemberSchema.index({ userId: 1, templateId: 1 });

// export default model<ITeamMember>("TeamMember", TeamMemberSchema);











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
