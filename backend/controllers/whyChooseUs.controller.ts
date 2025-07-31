
import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import WhyChooseUs from "../models/WhyChooseUs";

export const getWhyChooseUs = async (req: Request, res: Response) => {
  const { userId, templateId } = req.params;
  const data = await WhyChooseUs.findOne({ userId, templateId });
  res.json(data || {});
};

export const updateWhyChooseUs = async (req: Request, res: Response) => {
  const { userId, templateId } = req.params;
  const body = req.body;
  const updated = await WhyChooseUs.findOneAndUpdate(
    { userId, templateId },
    { $set: body },
    { new: true, upsert: true }
  );
  res.json({ message: "✅ Updated successfully", result: updated });
};

// ---------- NEW: upload bg image ----------
export const uploadWhyChooseBg = async (req: Request, res: Response) => {
  const { userId, templateId } = req.params;

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const imageUrl = `/uploads/whychoose/${req.file.filename}`;

  const doc = await WhyChooseUs.findOneAndUpdate(
    { userId, templateId },
    { $set: { bgImageUrl: imageUrl } },
    { upsert: true, new: true }
  );

  return res.json({ message: "✅ Background uploaded", result: doc });
};

// ---------- NEW: delete bg image ----------
export const deleteWhyChooseBg = async (req: Request, res: Response) => {
  const { userId, templateId } = req.params;

  const doc = await WhyChooseUs.findOne({ userId, templateId });
  if (!doc || !doc.bgImageUrl) {
    return res.status(404).json({ error: "No bg image to delete" });
  }

  const absolute = path.join(
    process.cwd(),
    "uploads",
    doc.bgImageUrl.replace("/uploads/", "")
  );
  if (fs.existsSync(absolute)) {
    fs.unlinkSync(absolute);
  }

  doc.bgImageUrl = "";
  await doc.save();

  return res.json({ message: "✅ Background deleted", result: doc });
};
