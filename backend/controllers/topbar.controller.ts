
import { Request, Response } from "express";
import Topbar from "../models/Topbar";

export const getTopbar = async (req: Request, res: Response) => {
  const { userId, templateId } = req.params;
  try {
    const data = await Topbar.findOne({ userId, templateId });
    return res.json(data || {});
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to fetch topbar" });
  }
};

/**
 * PUT /api/topbar/:userId/:templateId
 * Upserts everything that comes from the CMS form (text logo, image props, contact, socials, etc.)
 */
export const updateTopbar = async (req: Request, res: Response) => {
  const { userId, templateId } = req.params;
  const update = req.body;

  try {
    const result = await Topbar.findOneAndUpdate(
      { userId, templateId },
      { $set: update },
      { upsert: true, new: true }
    );
    return res.json({ message: "✅ Topbar updated", result });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to update topbar" });
  }
};

/**
 * POST /api/topbar/:userId/:templateId/logo
 * Expects multipart/form-data with field name "logo"
 * Will set logoType to "image" and store the (public) path in logoUrl
 */
export const uploadLogo = async (req: Request, res: Response) => {
  const { userId, templateId } = req.params;

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const publicPath = `/uploads/topbar/${req.file.filename}`; // what the front-end will use
    const { logoWidth, logoHeight } = req.body;

    const result = await Topbar.findOneAndUpdate(
      { userId, templateId },
      {
        $set: {
          logoType: "image",
          logoUrl: publicPath,
          ...(logoWidth ? { logoWidth: Number(logoWidth) } : {}),
          ...(logoHeight ? { logoHeight: Number(logoHeight) } : {}),
        },
      },
      { upsert: true, new: true }
    );

    return res.json({ message: "✅ Logo uploaded", result });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to upload logo" });
  }
};

/**
 * DELETE /api/topbar/:userId/:templateId/logo
 * Clears the image logo (does not delete the file from disk by default)
 */
export const deleteLogo = async (req: Request, res: Response) => {
  const { userId, templateId } = req.params;

  try {
    const result = await Topbar.findOneAndUpdate(
      { userId, templateId },
      { $set: { logoUrl: "", logoType: "text" } },
      { new: true }
    );
    return res.json({ message: "✅ Logo removed", result });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to delete logo" });
  }
};
