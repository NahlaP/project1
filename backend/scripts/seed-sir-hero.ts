// backend/scripts/seed-sir-hero.ts
import "dotenv/config";
import mongoose from "mongoose";
import { TemplateModel } from "../models/Template";

async function main() {
  const MONGO = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ion7";
  await mongoose.connect(MONGO);

  const base = "https://ion7-templates.s3.ap-south-1.amazonaws.com/sir-template-1/v1/";

  // Only set fields we know the schema has. (templateId, version:number, defaultSections)
  await TemplateModel.updateOne(
    { templateId: "sir-template-1" },
    {
      $set: {
        templateId: "sir-template-1",
        version: 1, // <-- number, not "v1"
        defaultSections: [
          {
            type: "hero",
            order: 1,
            content: {
              content:
                "Branding, websites and digital experiences, crafted with love, intelligence and precision.",
              // controller allows absolute http(s) URLs for defaults
              videoUrl: base + "assets/vid/vid-startup.mp4",
              // posterUrl is optional; add one if you want:
              // posterUrl: base + "assets/imgs/works/full/1.jpg"
            },
          },
        ],
      },
    },
    { upsert: true }
  );

  console.log("✅ Seeded sir-template-1 hero defaults (version=1)");
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
