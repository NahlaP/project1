import mongoose from 'mongoose';

const contactInfoSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  templateId: { type: String, required: true },
  address: String,
  phone: String,
  email: String,
  socialLinks: {
    facebook: String,
    twitter: String,
    youtube: String,
    linkedin: String,
  },
  businessHours: {
    mondayToFriday: String,
    saturday: String,
    sunday: String,
  },
});

export default mongoose.model('ContactInfo', contactInfoSchema);
