


import { Request, Response } from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import HeroSection from "../models/HeroSection";

dotenv.config();

const userId = "demo-user";
const templateId = "gym-template-1";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

/** ✅ Generate Hero Text Only */
/** ✅ Generate Hero Text Only */
export const generateHero = async (_req: Request, res: Response) => {
  try {
    const textPrompt = `Write gym coach website hero section in 1-2 lines. Include name, role, and motivation. Return plain text only.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: textPrompt }],
    });

    const content = completion.choices[0].message?.content?.trim() || "";

    // ❌ Do not call generateImage or set imageUrl here
    const updated = await HeroSection.findOneAndUpdate(
      { userId, templateId },
      { content }, // ✅ Save only content
      { upsert: true, new: true }
    );

    res.status(200).json({ content: updated.content, imageUrl: updated.imageUrl || "" });
  } catch (err) {
    console.error("Hero text generation failed:", err);
    res.status(500).json({ error: "Failed to generate hero text" });
  }
};

/** ✅ Save Hero Content (CMS form) */
// export const saveHero = async (req: Request, res: Response) => {
//   const { content, imageUrl } = req.body;

//   if (!content) return res.status(400).json({ error: "Missing content" });

//   try {
//     const updated = await HeroSection.findOneAndUpdate(
//       { userId, templateId },
//       { content, imageUrl },
//       { upsert: true, new: true }
//     );

//     res.status(200).json({ content: updated.content, imageUrl: updated.imageUrl || "" });
//   } catch (err) {
//     console.error("Save Hero error:", err);
//     res.status(500).json({ error: "Failed to save Hero section" });
//   }
// };



export const saveHero = async (req: Request, res: Response) => {
  const { content, imageUrl } = req.body;

  if (!content) return res.status(400).json({ error: "Missing content" });

  const update: any = { content };
  if (imageUrl) update.imageUrl = imageUrl; // ✅ Only update imageUrl if provided

  try {
    const updated = await HeroSection.findOneAndUpdate(
      { userId, templateId },
      update,
      { upsert: true, new: true }
    );

    res.status(200).json({ content: updated.content, imageUrl: updated.imageUrl || "" });
  } catch (err) {
    console.error("Save Hero error:", err);
    res.status(500).json({ error: "Failed to save Hero section" });
  }
};

/** ✅ Get Hero Content */
export const getHero = async (_req: Request, res: Response) => {
  try {
    const hero = await HeroSection.findOne({ userId, templateId });

    if (!hero) return res.status(404).json({ content: "", imageUrl: "" });

    res.status(200).json({
      content: hero.content,
      imageUrl: hero.imageUrl || "",
    });
  } catch (err) {
    console.error("Get Hero error:", err);
    res.status(500).json({ error: "Failed to fetch Hero section" });
  }
};

/** ✅ Upload Hero Image */
export const uploadHeroImage = async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image uploaded" });
  }

  const imageUrl = `/uploads/${req.file.filename}`;

  try {
    const hero = await HeroSection.findOneAndUpdate(
      { userId, templateId },
      { imageUrl },
      { new: true, upsert: true }
    );

    res.status(200).json({ imageUrl: hero.imageUrl });
  } catch (err) {
    console.error("Upload Hero Image error:", err);
    res.status(500).json({ error: "Failed to upload hero image" });
  }
};
// Add temporarily in hero.controller.ts
export const clearHeroImage = async (req: Request, res: Response) => {
  try {
    const result = await HeroSection.findOneAndUpdate(
      { userId: "demo-user", templateId: "gym-template-1" },
      { imageUrl: "" },
      { new: true }
    );
    res.status(200).json({ message: "Image cleared", result });
  } catch (err) {
    console.error("Clear image failed:", err);
    res.status(500).json({ error: "Failed to clear image" });
  }
};
