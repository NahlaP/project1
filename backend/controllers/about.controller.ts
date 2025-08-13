// backend/controllers/about.controller.ts
import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import About from "../models/About";

export const getAbout = async (req: Request, res: Response) => {
  const { userId, templateId } = req.params;
  const doc = await About.findOne({ userId, templateId });
  res.json(doc || {});
};

export const upsertAbout = async (req: Request, res: Response) => {
  const { userId, templateId } = req.params;
  const payload = req.body;

  const doc = await About.findOneAndUpdate(
    { userId, templateId },
    { $set: payload },
    { upsert: true, new: true }
  );

  res.json({ message: "✅ About saved", result: doc });
};

// -------- image upload helpers --------
export const uploadAboutImage = async (req: Request, res: Response) => {
  const { userId, templateId } = req.params;

  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const imageUrl = `/uploads/about/${req.file.filename}`;

  const doc = await About.findOneAndUpdate(
    { userId, templateId },
    {
      $set: {
        imageUrl,
      },
    },
    { upsert: true, new: true }
  );

  res.json({ message: "✅ Image uploaded", result: doc });
};

export const deleteAboutImage = async (req: Request, res: Response) => {
  const { userId, templateId } = req.params;

  const doc = await About.findOne({ userId, templateId });
  if (!doc || !doc.imageUrl) {
    return res.status(404).json({ error: "No image set" });
  }

  const absolute = path.join(process.cwd(), "uploads", doc.imageUrl.replace("/uploads/", ""));
  if (fs.existsSync(absolute)) {
    fs.unlinkSync(absolute);
  }

  doc.imageUrl = "";
  await doc.save();

  res.json({ message: "✅ Image removed", result: doc });
};
