


// backend/controllers/template.controller.ts
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { TemplateModel } from "../models/Template";
import TemplateSelection from "../models/TemplateSelection";

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_change_me_123";

/** Safely read userId from Authorization: Bearer <jwt> */
function getUserIdFromToken(req: Request): string | undefined {
  const hdr = req.headers.authorization || "";
  const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : "";
  if (!token) return undefined;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    return payload?.userId || payload?.sub || undefined;
  } catch {
    return undefined;
  }
}

/** GET /api/templates */
export const listTemplates = async (_req: Request, res: Response) => {
  const rows = await TemplateModel.find(
    {},
    { _id: 0, templateId: 1, name: 1, version: 1 }
  ).lean();
  return res.json({ ok: true, data: rows });
};

/** POST /api/templates (seed/update) */
export const upsertTemplate = async (req: Request, res: Response) => {
  const { templateId, name, version, defaultSections } = req.body || {};
  if (!templateId || !name) {
    return res
      .status(400)
      .json({ ok: false, error: "templateId and name are required" });
  }

  const doc = await TemplateModel.findOneAndUpdate(
    { templateId },
    {
      name,
      version: typeof version === "number" ? version : 1,
      defaultSections: Array.isArray(defaultSections) ? defaultSections : [],
    },
    { new: true, upsert: true }
  );

  return res.json({ ok: true, data: doc });
};

/** POST /api/templates/:templateId/select  (uses JWT user; falls back to body.userId) */
export const selectTemplate = async (req: Request, res: Response) => {
  const { templateId } = req.params;
  const tokenUserId = getUserIdFromToken(req);
  const bodyUserId = (req.body || {}).userId;
  const userId = tokenUserId || bodyUserId;

  if (!userId) {
    return res.status(400).json({
      ok: false,
      error: "userId missing (send Bearer token or body.userId)",
    });
  }

  const exists = await TemplateModel.exists({ templateId });
  if (!exists)
    return res.status(404).json({ ok: false, error: "Template not found" });

  const sel = await TemplateSelection.findOneAndUpdate(
    { userId },
    { templateId },
    { new: true, upsert: true }
  );

  return res.json({
    ok: true,
    data: { userId: sel.userId, templateId: sel.templateId },
  });
};

/** GET /api/templates/user/:userId/selected (or JWT if path param omitted) */
export const getUserSelectedTemplate = async (req: Request, res: Response) => {
  const tokenUserId = getUserIdFromToken(req);
  const pathUserId = req.params.userId;
  const userId = pathUserId || tokenUserId;

  if (!userId) return res.json({ ok: true, data: null });

  const sel = await TemplateSelection.findOne({ userId }).lean();
  return res.json({
    ok: true,
    data: sel ? { userId: sel.userId, templateId: sel.templateId } : null,
  });
};
