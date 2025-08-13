// import mongoose from "mongoose";

// const topbarSchema = new mongoose.Schema({
//   userId: { type: String, required: true },
//   templateId: { type: String, required: true },
//   logoText: { type: String, default: "WELDORK" },
//   logoSize: { type: Number, default: 20 }, // 👈 Add this
//   address: { type: String },
//   email: { type: String },
//   phone: { type: String },
//   socialLinks: {
//     facebook: { type: String },
//     twitter: { type: String },
//     linkedin: { type: String },
//   },
// });

// export default mongoose.model("Topbar", topbarSchema);
import mongoose from "mongoose";

const topbarSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  templateId: { type: String, required: true },

  // Logo: can be text or image
  logoType: {
    type: String,
    enum: ["text", "image"],
    default: "text",
  },

  // For text logo
  logoText: { type: String, default: "WELDORK" },
  logoSize: { type: Number, default: 20 },

  // For image logo
  logoUrl: { type: String, default: "" },
  logoWidth: { type: Number, default: 150 },
  logoHeight: { type: Number, default: 50 },

  // Contact info
  address: { type: String },
  email: { type: String },
  phone: { type: String },

  // Social links
  socialLinks: {
    facebook: { type: String },
    twitter: { type: String },
    linkedin: { type: String },
  },
});

export default mongoose.model("Topbar", topbarSchema);
