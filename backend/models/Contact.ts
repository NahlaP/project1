


// backend/models/Contact.ts
import mongoose, { Schema } from 'mongoose';

const contactInfoSchema = new Schema(
  {
    userId:     { type: String, required: true, index: true },
    templateId: { type: String, required: true, index: true },

    // --- SIR (form-style) fields (optional) ---
    subtitle:    { type: String, default: '' },
    titleStrong: { type: String, default: '' },
    titleLight:  { type: String, default: '' },
    buttonText:  { type: String, default: '' },
    formAction:  { type: String, default: '' },

    // --- GYM (info-style) fields (existing) ---
    address: { type: String, default: '' },
    phone:   { type: String, default: '' },
    email:   { type: String, default: '' },

    socialLinks: {
      facebook: { type: String, default: '' },
      twitter:  { type: String, default: '' },
      youtube:  { type: String, default: '' },
      linkedin: { type: String, default: '' },
    },

    businessHours: {
      mondayToFriday: { type: String, default: '' },
      saturday:       { type: String, default: '' },
      sunday:         { type: String, default: '' },
    },
  },
  { timestamps: true, minimize: false } // keep empty objects if needed
);

// One doc per (userId, templateId) → SIR and GYM are separate docs.
contactInfoSchema.index({ userId: 1, templateId: 1 }, { unique: true });

export default mongoose.models.ContactInfo
  || mongoose.model('ContactInfo', contactInfoSchema);
