

// og

// import { Request, Response } from "express";
// import jwt from "jsonwebtoken";
// import { TemplateModel } from "../models/Template";              // or { TemplateModel } from "../models/template.model"
// import TemplateSelection from "../models/TemplateSelection";


// const JWT_SECRET = process.env.JWT_SECRET || "super_secret_change_me_123";

// /** Safely get userId from Authorization header (no DB lookups) */
// function getUserIdFromToken(req: Request): string | undefined {
//   const hdr = req.headers.authorization || "";
//   const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : "";
//   if (!token) return undefined;
//   try {
//     const payload = jwt.verify(token, JWT_SECRET) as any;
//     return payload?.userId as string | undefined;
//   } catch {
//     return undefined;
//   }
// }

// /** GET /api/templates */
// export const listTemplates = async (_req: Request, res: Response) => {
//   const rows = await TemplateModel.find({}, { _id: 0, templateId: 1, name: 1, version: 1 }).lean();
//   return res.json({ ok: true, data: rows });
// };

// /** POST /api/templates (seed/update) */
// export const upsertTemplate = async (req: Request, res: Response) => {
//   const { templateId, name, version, defaultSections } = req.body || {};
//   if (!templateId || !name) return res.status(400).json({ error: "templateId and name are required" });

//   const doc = await TemplateModel.findOneAndUpdate(
//     { templateId },
//     { name, version: version ?? 1, defaultSections: defaultSections ?? [] },
//     { new: true, upsert: true }
//   );
//   return res.json({ ok: true, data: doc });
// };

// /** POST /api/templates/:templateId/select  (reads user from JWT; body userId optional) */
// export const selectTemplate = async (req: Request, res: Response) => {
//   const { templateId } = req.params;

//   // Prefer token userId; only use body if token missing
//   const tokenUserId = getUserIdFromToken(req);
//   const bodyUserId = (req.body || {}).userId;
//   const userId = tokenUserId || bodyUserId;

//   if (!userId) return res.status(400).json({ error: "userId missing (send Bearer token or body.userId)" });

//   const exists = await TemplateModel.exists({ templateId });
//   if (!exists) return res.status(404).json({ error: "Template not found" });

//   const sel = await TemplateSelection.findOneAndUpdate(
//     { userId },
//     { templateId },
//     { new: true, upsert: true }
//   );

//   return res.json({ ok: true, data: { userId: sel.userId, templateId: sel.templateId } });
// };

// /** GET /api/templates/user/:userId/selected  (or omit param and use token) */
// export const getUserSelectedTemplate = async (req: Request, res: Response) => {
//   const tokenUserId = getUserIdFromToken(req);
//   const pathUserId = req.params.userId;
//   const userId = pathUserId || tokenUserId;

//   if (!userId) return res.json({ ok: true, data: null });

//   const sel = await TemplateSelection.findOne({ userId }).lean();
//   return res.json({
//     ok: true,
//     data: sel ? { userId: sel.userId, templateId: sel.templateId } : null
//   });
// };














// import { Request, Response } from "express";
// import jwt from "jsonwebtoken";
// import mongoose, { Types } from "mongoose";
// import { TemplateModel } from "../models/Template";
// import TemplateSelection from "../models/TemplateSelection";
// import Section from "../models/section.model";

// const JWT_SECRET = process.env.JWT_SECRET || "super_secret_change_me_123";

// /** Safely read userId from Authorization: Bearer <jwt> */
// function getUserIdFromToken(req: Request): string | undefined {
//   const hdr = req.headers.authorization || "";
//   const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : "";
//   if (!token) return undefined;
//   try {
//     const payload = jwt.verify(token, JWT_SECRET) as any;
//     return payload?.userId || payload?.sub || undefined;
//   } catch {
//     return undefined;
//   }
// }

// /** GET /api/templates */
// export const listTemplates = async (_req: Request, res: Response) => {
//   const rows = await TemplateModel.find(
//     {},
//     { _id: 0, templateId: 1, name: 1, version: 1 }
//   ).lean();
//   return res.json({ ok: true, data: rows });
// };

// /** POST /api/templates (seed/update) */
// export const upsertTemplate = async (req: Request, res: Response) => {
//   const { templateId, name, version, defaultSections } = req.body || {};
//   if (!templateId || !name) {
//     return res.status(400).json({ ok: false, error: "templateId and name are required" });
//   }

//   const doc = await TemplateModel.findOneAndUpdate(
//     { templateId },
//     {
//       name,
//       version: typeof version === "number" ? version : 1,
//       defaultSections: Array.isArray(defaultSections) ? defaultSections : [],
//     },
//     { new: true, upsert: true }
//   );

//   return res.json({ ok: true, data: doc });
// };

// /** POST /api/templates/:templateId/select  (uses JWT user; falls back to body.userId) */
// export const selectTemplate = async (req: Request, res: Response) => {
//   const { templateId } = req.params;
//   const tokenUserId = getUserIdFromToken(req);
//   const bodyUserId = (req.body || {}).userId;
//   const userId = tokenUserId || bodyUserId;

//   if (!userId) {
//     return res.status(400).json({ ok: false, error: "userId missing (send Bearer token or body.userId)" });
//   }

//   const exists = await TemplateModel.exists({ templateId });
//   if (!exists) return res.status(404).json({ ok: false, error: "Template not found" });

//   const sel = await TemplateSelection.findOneAndUpdate(
//     { userId },
//     { templateId },
//     { new: true, upsert: true }
//   );

//   return res.json({ ok: true, data: { userId: sel.userId, templateId: sel.templateId } });
// };

// /** GET /api/templates/user/:userId/selected (or JWT if path param omitted) */
// export const getUserSelectedTemplate = async (req: Request, res: Response) => {
//   const tokenUserId = getUserIdFromToken(req);
//   const pathUserId = req.params.userId;
//   const userId = pathUserId || tokenUserId;

//   if (!userId) return res.json({ ok: true, data: null });

//   const sel = await TemplateSelection.findOne({ userId }).lean();
//   return res.json({
//     ok: true,
//     data: sel ? { userId: sel.userId, templateId: sel.templateId } : null,
//   });
// };

// /**
//  * POST /api/templates/:templateId/reset
//  * Body (optional): { userId?: string }
//  * Wipes user's Sections for the template and restores Template.defaultSections
//  */
// export const resetTemplateForUser = async (req: Request, res: Response) => {
//   const { templateId } = req.params;

//   const tokenUserId = getUserIdFromToken(req);
//   const bodyUserId = (req.body || {}).userId;
//   const userId = tokenUserId || bodyUserId;

//   if (!userId) {
//     return res
//       .status(400)
//       .json({ ok: false, error: "userId missing (send Bearer token or body.userId)" });
//   }

//   const tmpl = await TemplateModel.findOne({ templateId }).lean();
//   if (!tmpl) return res.status(404).json({ ok: false, error: "Template not found" });

//   const defaults = Array.isArray(tmpl.defaultSections) ? tmpl.defaultSections : [];
//   if (!defaults.length) {
//     return res
//       .status(400)
//       .json({ ok: false, error: "Template has no defaultSections to reset to" });
//   }

//   const session = await mongoose.startSession();
//   session.startTransaction();
//   try {
//     // 1) Delete user's current sections for this template
//     const del = await Section.deleteMany({ userId, templateId }).session(session);

//     // 2) Insert defaults cloned for this user & template
//     const now = new Date();
//     const clones = defaults.map((s) => ({
//       _id: new Types.ObjectId(),
//       userId,
//       templateId,
//       type: s.type,
//       title: s.title,
//       slug: s.slug,
//       order: typeof s.order === "number" ? s.order : 0,
//       parentPageId: s.parentPageId || null,
//       visible: s.visible !== false,
//       content: s.content ?? {},
//       createdAt: now,
//       updatedAt: now,
//     }));

//     await Section.insertMany(clones, { session });

//     await session.commitTransaction();
//     session.endSession();

//     const home = clones.find(
//       (x) =>
//         x.type === "page" &&
//         (((x.slug || "").toLowerCase() === "home") ||
//           ((x.title || "").toLowerCase() === "home"))
//     );

//     return res.json({
//       ok: true,
//       data: {
//         removed: del.deletedCount || 0,
//         inserted: clones.length,
//         homePageId: home?._id?.toString() || null,
//       },
//       message: "Template reset to defaults.",
//     });
//   } catch (err: any) {
//     await session.abortTransaction();
//     session.endSession();
//     return res
//       .status(500)
//       .json({ ok: false, error: err?.message || "Failed to reset template" });
//   }
// };
















// import { Request, Response } from "express";
// import jwt from "jsonwebtoken";
// import mongoose, { Types } from "mongoose";
// import { TemplateModel } from "../models/Template";
// import TemplateSelection from "../models/TemplateSelection";
// import Section from "../models/section.model";

// const JWT_SECRET = process.env.JWT_SECRET || "super_secret_change_me_123";

// /** Safely read userId from Authorization: Bearer <jwt> */
// function getUserIdFromToken(req: Request): string | undefined {
//   const hdr = req.headers.authorization || "";
//   const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : "";
//   if (!token) return undefined;
//   try {
//     const payload = jwt.verify(token, JWT_SECRET) as any;
//     return payload?.userId || payload?.sub || undefined;
//   } catch {
//     return undefined;
//   }
// }

// /** GET /api/templates */
// export const listTemplates = async (_req: Request, res: Response) => {
//   const rows = await TemplateModel.find(
//     {},
//     { _id: 0, templateId: 1, name: 1, version: 1 }
//   ).lean();
//   return res.json({ ok: true, data: rows });
// };

// /** POST /api/templates (seed/update) */
// export const upsertTemplate = async (req: Request, res: Response) => {
//   const { templateId, name, version, defaultSections } = req.body || {};
//   if (!templateId || !name) {
//     return res
//       .status(400)
//       .json({ ok: false, error: "templateId and name are required" });
//   }

//   const doc = await TemplateModel.findOneAndUpdate(
//     { templateId },
//     {
//       name,
//       version: typeof version === "number" ? version : 1,
//       defaultSections: Array.isArray(defaultSections) ? defaultSections : [],
//     },
//     { new: true, upsert: true }
//   );

//   return res.json({ ok: true, data: doc });
// };

// /** POST /api/templates/:templateId/select  (uses JWT user; falls back to body.userId) */
// export const selectTemplate = async (req: Request, res: Response) => {
//   const { templateId } = req.params;
//   const tokenUserId = getUserIdFromToken(req);
//   const bodyUserId = (req.body || {}).userId;
//   const userId = tokenUserId || bodyUserId;

//   if (!userId) {
//     return res.status(400).json({
//       ok: false,
//       error: "userId missing (send Bearer token or body.userId)",
//     });
//   }

//   const exists = await TemplateModel.exists({ templateId });
//   if (!exists)
//     return res.status(404).json({ ok: false, error: "Template not found" });

//   const sel = await TemplateSelection.findOneAndUpdate(
//     { userId },
//     { templateId },
//     { new: true, upsert: true }
//   );

//   return res.json({
//     ok: true,
//     data: { userId: sel.userId, templateId: sel.templateId },
//   });
// };

// /** GET /api/templates/user/:userId/selected (or JWT if path param omitted) */
// export const getUserSelectedTemplate = async (req: Request, res: Response) => {
//   const tokenUserId = getUserIdFromToken(req);
//   const pathUserId = req.params.userId;
//   const userId = pathUserId || tokenUserId;

//   if (!userId) return res.json({ ok: true, data: null });

//   const sel = await TemplateSelection.findOne({ userId }).lean();
//   return res.json({
//     ok: true,
//     data: sel ? { userId: sel.userId, templateId: sel.templateId } : null,
//   });
// };

// /**
//  * POST /api/templates/:templateId/reset
//  * Body (optional): { userId?: string }
//  * Wipes user's Sections for the template and restores Template.defaultSections
//  * - Uses a transaction when available (replica set)
//  * - Falls back to non-transactional delete+insert on standalone mongod
//  */
// export const resetTemplateForUser = async (req: Request, res: Response) => {
//   const { templateId } = req.params;

//   const tokenUserId = getUserIdFromToken(req);
//   const bodyUserId = (req.body || {}).userId;
//   const userId = tokenUserId || bodyUserId;

//   if (!userId) {
//     return res.status(400).json({
//       ok: false,
//       error: "userId missing (send Bearer token or body.userId)",
//     });
//   }

//   const tmpl = await TemplateModel.findOne({ templateId }).lean();
//   if (!tmpl) return res.status(404).json({ ok: false, error: "Template not found" });

//   const defaults = Array.isArray(tmpl.defaultSections) ? tmpl.defaultSections : [];
//   if (!defaults.length) {
//     return res
//       .status(400)
//       .json({ ok: false, error: "Template has no defaultSections to reset to" });
//   }

//   // Prepare clones (same docs/ids for both txn and non-txn paths)
//   const now = new Date();
//   const clones = defaults.map((s) => ({
//     _id: new Types.ObjectId(),
//     userId,
//     templateId,
//     type: s.type,
//     title: s.title,
//     slug: s.slug,
//     order: typeof s.order === "number" ? s.order : 0,
//     parentPageId: s.parentPageId || null,
//     visible: s.visible !== false,
//     content: s.content ?? {},
//     createdAt: now,
//     updatedAt: now,
//   }));

//   const buildOk = (removedCount: number) => {
//     const home = clones.find(
//       (x) =>
//         x.type === "page" &&
//         (((x.slug || "").toLowerCase() === "home") ||
//           ((x.title || "").toLowerCase() === "home"))
//     );
//     return {
//       ok: true,
//       data: {
//         removed: removedCount || 0,
//         inserted: clones.length,
//         homePageId: home?._id?.toString() || null,
//       },
//       message: "Template reset to defaults.",
//     };
//   };

//   // Try transactional path first
//   let removedCount = 0;
//   const session = await mongoose.startSession();
//   try {
//     await session.withTransaction(async () => {
//       const del = await Section.deleteMany({ userId, templateId }).session(session);
//       removedCount = del.deletedCount || 0;
//       await Section.insertMany(clones, { session });
//     });
//     session.endSession();
//     return res.json(buildOk(removedCount));
//   } catch (err: any) {
//     session.endSession();
//     const msg = String(err?.message || "");
//     const isStandaloneTxnError =
//       msg.includes("Transaction numbers are only allowed on a replica set member") ||
//       (msg.includes("Transaction") && msg.toLowerCase().includes("replica set"));

//     // Fallback for standalone mongod (no transactions)
//     if (isStandaloneTxnError) {
//       try {
//         const del = await Section.deleteMany({ userId, templateId });
//         removedCount = del.deletedCount || 0;
//         await Section.insertMany(clones);
//         return res.json(buildOk(removedCount));
//       } catch (e: any) {
//         return res
//           .status(500)
//           .json({ ok: false, error: e?.message || "Failed to reset template" });
//       }
//     }

//     // Other errors: bubble up
//     return res
//       .status(500)
//       .json({ ok: false, error: msg || "Failed to reset template" });
//   }
// };



















// // reset
// // og2
// // backend/controllers/template.controller.ts
// import { Request, Response } from "express";
// import jwt from "jsonwebtoken";
// import mongoose, { Types } from "mongoose";
// import { TemplateModel } from "../models/Template";
// import TemplateSelection from "../models/TemplateSelection";
// import Section from "../models/section.model";

// const JWT_SECRET = process.env.JWT_SECRET || "super_secret_change_me_123";

// /** Safely read userId from Authorization: Bearer <jwt> */
// function getUserIdFromToken(req: Request): string | undefined {
//   const hdr = req.headers.authorization || "";
//   const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : "";
//   if (!token) return undefined;
//   try {
//     const payload = jwt.verify(token, JWT_SECRET) as any;
//     return payload?.userId || payload?.sub || undefined;
//   } catch {
//     return undefined;
//   }
// }

// /** GET /api/templates */
// export const listTemplates = async (_req: Request, res: Response) => {
//   const rows = await TemplateModel.find(
//     {},
//     { _id: 0, templateId: 1, name: 1, version: 1 }
//   ).lean();
//   return res.json({ ok: true, data: rows });
// };

// /** POST /api/templates (seed/update) */
// export const upsertTemplate = async (req: Request, res: Response) => {
//   const { templateId, name, version, defaultSections } = req.body || {};
//   if (!templateId || !name) {
//     return res
//       .status(400)
//       .json({ ok: false, error: "templateId and name are required" });
//   }

//   const doc = await TemplateModel.findOneAndUpdate(
//     { templateId },
//     {
//       name,
//       version: typeof version === "number" ? version : 1,
//       defaultSections: Array.isArray(defaultSections) ? defaultSections : [],
//     },
//     { new: true, upsert: true }
//   );

//   return res.json({ ok: true, data: doc });
// };

// /** POST /api/templates/:templateId/select  (uses JWT user; falls back to body.userId) */
// export const selectTemplate = async (req: Request, res: Response) => {
//   const { templateId } = req.params;
//   const tokenUserId = getUserIdFromToken(req);
//   const bodyUserId = (req.body || {}).userId;
//   const userId = tokenUserId || bodyUserId;

//   if (!userId) {
//     return res.status(400).json({
//       ok: false,
//       error: "userId missing (send Bearer token or body.userId)",
//     });
//   }

//   const exists = await TemplateModel.exists({ templateId });
//   if (!exists)
//     return res.status(404).json({ ok: false, error: "Template not found" });

//   const sel = await TemplateSelection.findOneAndUpdate(
//     { userId },
//     { templateId },
//     { new: true, upsert: true }
//   );

//   return res.json({
//     ok: true,
//     data: { userId: sel.userId, templateId: sel.templateId },
//   });
// };

// /** GET /api/templates/user/:userId/selected (or JWT if path param omitted) */
// export const getUserSelectedTemplate = async (req: Request, res: Response) => {
//   const tokenUserId = getUserIdFromToken(req);
//   const pathUserId = req.params.userId;
//   const userId = pathUserId || tokenUserId;

//   if (!userId) return res.json({ ok: true, data: null });

//   const sel = await TemplateSelection.findOne({ userId }).lean();
//   return res.json({
//     ok: true,
//     data: sel ? { userId: sel.userId, templateId: sel.templateId } : null,
//   });
// };

// /**
//  * POST /api/templates/:templateId/reset
//  * Body (optional): { userId?: string }
//  * Wipes user's Sections for the template and restores Template.defaultSections.
//  * - Honors `parentSlug` to attach children to the "Home" (or other) page.
//  * - Uses a transaction when available; falls back on standalone mongod.
//  */
// export const resetTemplateForUser = async (req: Request, res: Response) => {
//   const { templateId } = req.params;

//   const tokenUserId = getUserIdFromToken(req);
//   const bodyUserId = (req.body || {}).userId;
//   const userId = tokenUserId || bodyUserId;

//   if (!userId) {
//     return res.status(400).json({
//       ok: false,
//       error: "userId missing (send Bearer token or body.userId)",
//     });
//   }

//   const tmpl = await TemplateModel.findOne({ templateId }).lean();
//   if (!tmpl) return res.status(404).json({ ok: false, error: "Template not found" });

//   const defaults = Array.isArray(tmpl.defaultSections) ? tmpl.defaultSections : [];
//   if (!defaults.length) {
//     return res
//       .status(400)
//       .json({ ok: false, error: "Template has no defaultSections to reset to" });
//   }

//   // ---- Build pages first so we can compute new page ids
//   const now = new Date();
//   const pages = defaults.filter(s => (s.type || "").toLowerCase() === "page");
//   const children = defaults.filter(s => (s.type || "").toLowerCase() !== "page");

//   const pageClones = pages.map(p => ({
//     _id: new Types.ObjectId(),
//     userId,
//     templateId,
//     type: p.type,
//     title: p.title,
//     slug: p.slug,
//     order: typeof p.order === "number" ? p.order : 0,
//     parentPageId: null,
//     visible: p.visible !== false,
//     content: p.content ?? {},
//     createdAt: now,
//     updatedAt: now,
//   }));

//   // slug/title -> new _id map
//   const pageIdByKey = new Map<string, string>();
//   for (const pc of pageClones) {
//     const keySlug = (pc.slug || "").toLowerCase();
//     const keyTitle = (pc.title || "").toLowerCase();
//     if (keySlug)  pageIdByKey.set(`slug:${keySlug}`, pc._id.toString());
//     if (keyTitle) pageIdByKey.set(`title:${keyTitle}`, pc._id.toString());
//   }

//   // Children: resolve parentPageId via parentSlug, explicit parentPageId, or fallback to "home"
//   const childClones = children.map(s => {
//     const parentSlug = (s as any).parentSlug ? String((s as any).parentSlug).toLowerCase() : "";
//     const want =
//       (parentSlug && pageIdByKey.get(`slug:${parentSlug}`)) ||
//       (s.parentPageId || null) ||
//       pageIdByKey.get("slug:home") ||
//       pageIdByKey.get("title:home") ||
//       null;

//     return {
//       _id: new Types.ObjectId(),
//       userId,
//       templateId,
//       type: s.type,
//       title: s.title,
//       slug: s.slug,
//       order: typeof s.order === "number" ? s.order : 0,
//       parentPageId: want,
//       visible: s.visible !== false,
//       content: s.content ?? {},
//       createdAt: now,
//       updatedAt: now,
//     };
//   });

//   const buildOk = (removedCount: number) => {
//     const home =
//       pageClones.find(
//         x =>
//           ((x.slug || "").toLowerCase() === "home") ||
//           ((x.title || "").toLowerCase() === "home")
//       ) || null;

//     return {
//       ok: true,
//       data: {
//         removed: removedCount || 0,
//         inserted: pageClones.length + childClones.length,
//         homePageId: home?._id?.toString() || null,
//       },
//       message: "Template reset to defaults.",
//     };
//   };

//   // ---- Transaction first; fallback if standalone mongod
//   let removedCount = 0;
//   const session = await mongoose.startSession();
//   try {
//     await session.withTransaction(async () => {
//       const del = await Section.deleteMany({ userId, templateId }).session(session);
//       removedCount = del.deletedCount || 0;
//       await Section.insertMany(pageClones, { session });
//       await Section.insertMany(childClones, { session });
//     });
//     session.endSession();
//     return res.json(buildOk(removedCount));
//   } catch (err: any) {
//     session.endSession();
//     const msg = String(err?.message || "");
//     const isStandaloneTxnError =
//       msg.includes("Transaction numbers are only allowed on a replica set member") ||
//       (msg.includes("Transaction") && msg.toLowerCase().includes("replica set"));

//     if (isStandaloneTxnError) {
//       try {
//         const del = await Section.deleteMany({ userId, templateId });
//         removedCount = del.deletedCount || 0;
//         await Section.insertMany(pageClones);
//         await Section.insertMany(childClones);
//         return res.json(buildOk(removedCount));
//       } catch (e: any) {
//         return res
//           .status(500)
//           .json({ ok: false, error: e?.message || "Failed to reset template" });
//       }
//     }

//     return res
//       .status(500)
//       .json({ ok: false, error: msg || "Failed to reset template" });
//   }
// };














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
