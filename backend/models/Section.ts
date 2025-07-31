// import { Schema, model, Document } from 'mongoose';

// export type SectionType =
//   | 'hero'
//   | 'about'
//   | 'services'
//   | 'testimonial'
//   | 'team'
//   | 'contact'
//   | 'why-choose'
//   | 'appointment';

// export interface ISection extends Document {
//   userId: string;
//   templateId: string;
//   type: SectionType;
//   title: string;
//   slug?: string; // ✅ Add this optional field
//   order: number;
//   visible: boolean;
//   content: any;
// }


// const SectionSchema = new Schema<ISection>({
//   userId: { type: String, required: true },
//   templateId: { type: String, required: true },
//   type: { type: String, required: true },
//   title: { type: String, required: true },
//   slug: { type: String }, // ✅ Add this line
//   order: { type: Number, required: true },
//   visible: { type: Boolean, default: true },
//   content: { type: Schema.Types.Mixed, default: {} },
// });

// export const Section = model<ISection>('Section', SectionSchema);