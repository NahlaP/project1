// backend/models/About.ts
import mongoose from "mongoose";

const bulletSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
  },
  { _id: true }
);

const aboutSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    templateId: { type: String, required: true },

    title: { type: String, default: "Ultimate Welding and Quality Metal Solutions" },
    description: { type: String, default: "" },
    highlight: {
      type: String,
      default:
        "We’re Good in All Metal Works Using Quality Welding Tools",
    },

    imageUrl: { type: String, default: "/img/about.jpg" },
    imageAlt: { type: String, default: "About Image" },

    bullets: { type: [bulletSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("About", aboutSchema);
