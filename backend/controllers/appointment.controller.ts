// // og
// import { Request, Response } from "express";
// import dotenv from "dotenv";
// import Appointment, { IAppointment } from "../models/Appointment";
// import { s3 } from "../lib/s3";
// import {
//   GetObjectCommand,
//   PutObjectCommand,
// } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// dotenv.config();

// /* ------------ helpers ------------ */
// const ids = (req: Request) => ({
//   userId: (req.params as any).userId,
//   templateId: (req.params as any).templateId,
// });

// async function presignOrEmpty(key?: string) {
//   if (!key) return "";
//   try {
//     return await getSignedUrl(
//       s3,
//       new GetObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key }),
//       { expiresIn: 300 }
//     );
//   } catch (e) {
//     console.warn("Presign failed for key:", key, e);
//     return "";
//   }
// }

// function cleanKeyCandidate(candidate?: string) {
//   let key = String(candidate ?? "");
//   if (!key) return "";
//   key = key.replace(/^\/home\/[^/]+\/apps\/backend\/uploads\//, "");
//   if (/^https?:\/\//i.test(key)) return ""; // ignore full URLs here
//   return key;
// }

// function normalizeServices(svcs: any): string[] | undefined {
//   if (!svcs) return undefined;
//   if (Array.isArray(svcs)) return svcs.map(String).filter(Boolean);
//   if (typeof svcs === "string") {
//     try {
//       const parsed = JSON.parse(svcs);
//       if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
//     } catch {}
//     return [svcs].filter(Boolean);
//   }
//   return undefined;
// }

// /* ------------ handlers ------------ */

// /** GET /api/appointment/:userId/:templateId */
// export const getAppointmentSection = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const doc: IAppointment | null = await Appointment.findOne({ userId, templateId });

//     if (!doc) {
//       return res.status(200).json({
//         userId, templateId,
//         title: "", subtitle: "",
//         officeAddress: "", officeTime: "",
//         services: [],
//         backgroundImage: "",
//         backgroundImageUrl: "",
//       });
//     }

//     const backgroundImageUrl = await presignOrEmpty(doc.backgroundImage);

//     return res.status(200).json({
//       ...doc.toObject(),
//       backgroundImageUrl, // presigned URL for <img src=...>
//     });
//   } catch (error) {
//     console.error("Error fetching appointment section:", error);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

// /** PUT /api/appointment/:userId/:templateId */
// export const updateAppointmentSection = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const payload = { ...(req.body || {}) };

//     // accept imageKey OR imageUrl (both treated as S3 key)
//     const incomingKey = cleanKeyCandidate(payload.imageKey ?? payload.imageUrl);
//     if (incomingKey) payload.backgroundImage = incomingKey;
//     delete (payload as any).imageKey;
//     delete (payload as any).imageUrl;

//     // normalize services to string[]
//     const services = normalizeServices(payload.services);
//     if (services !== undefined) payload.services = services;

//     const updated = await Appointment.findOneAndUpdate(
//       { userId, templateId },
//       { $set: payload },
//       { upsert: true, new: true }
//     );

//     return res.status(200).json({ message: "✅ Updated", data: updated });
//   } catch (error) {
//     console.error("Error updating appointment section:", error);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

// /** POST /api/appointment/:userId/:templateId/image  (multipart form-data, key=image) */
// export const uploadAppointmentBg = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const file = (req as any).file;
//     if (!file) return res.status(400).json({ error: "No image uploaded" });

//     const key: string = file.key;     // e.g. sections/appointment/<timestamp>-name.jpg
//     const bucket: string = file.bucket;

//     const doc = await Appointment.findOneAndUpdate(
//       { userId, templateId },
//       { $set: { backgroundImage: key } },
//       { upsert: true, new: true }
//     );

//     return res.status(200).json({
//       message: "✅ Appointment background uploaded",
//       key, bucket,
//       imageKey: doc.backgroundImage || "",
//     });
//   } catch (error) {
//     console.error("Upload Appointment BG error:", error);
//     return res.status(500).json({ error: "Failed to upload Appointment background" });
//   }
// };

// /** POST /api/appointment/:userId/:templateId/image-base64  (JSON) */
// export const uploadAppointmentBgBase64 = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const { dataUrl, base64, filename } = (req.body || {}) as any;

//     const safeName = String(filename || "upload").replace(/[^\w.-]+/g, "_");
//     let ext = (safeName.match(/\.(jpg|jpeg|png|webp|gif)$/i)?.[0] || "").toLowerCase();
//     if (!ext) {
//       const mime = (typeof dataUrl === "string" && dataUrl.split(";")[0].split(":")[1]) || "";
//       if (/png/i.test(mime)) ext = ".png";
//       else if (/webp/i.test(mime)) ext = ".webp";
//       else if (/gif/i.test(mime)) ext = ".gif";
//       else ext = ".jpg";
//     }
//     const baseName = safeName.replace(/\.(jpg|jpeg|png|webp|gif)$/i, "");
//     const key = `sections/appointment/${Date.now()}-${baseName}${ext}`;

//     const b64 =
//       (typeof dataUrl === "string" && dataUrl.includes(",")) ? dataUrl.split(",")[1] :
//       (typeof base64 === "string" ? base64 : "");
//     if (!b64) return res.status(400).json({ error: "Missing base64 image data" });

//     const buf = Buffer.from(b64, "base64");

//     await s3.send(new PutObjectCommand({
//       Bucket: process.env.S3_BUCKET!,
//       Key: key,
//       Body: buf,
//       ContentType:
//         ext === ".png" ? "image/png" :
//         ext === ".webp" ? "image/webp" :
//         ext === ".gif" ? "image/gif" : "image/jpeg",
//       ACL: "private",
//     }));

//     const doc = await Appointment.findOneAndUpdate(
//       { userId, templateId },
//       { $set: { backgroundImage: key } },
//       { upsert: true, new: true }
//     );

//     return res.status(200).json({
//       message: "✅ Appointment background uploaded (base64)",
//       key,
//       imageKey: doc.backgroundImage || "",
//     });
//   } catch (error) {
//     console.error("Upload Appointment BG (base64) error:", error);
//     return res.status(500).json({ error: "Failed to upload Appointment background" });
//   }
// };

// /** POST /api/appointment/:userId/:templateId/clear-image  (clears DB key; doesn't delete S3) */
// export const clearAppointmentBg = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const result = await Appointment.findOneAndUpdate(
//       { userId, templateId },
//       { $set: { backgroundImage: "" } },
//       { new: true }
//     );
//     return res.status(200).json({
//       message: "Appointment background cleared",
//       imageKey: result?.backgroundImage || "",
//     });
//   } catch (error) {
//     console.error("Clear Appointment BG error:", error);
//     return res.status(500).json({ error: "Failed to clear Appointment background" });
//   }
// };



















// backend/controllers/appointment.controller.ts
import { Request, Response } from "express";
import dotenv from "dotenv";
import Appointment, { IAppointment } from "../models/Appointment";
import { TemplateModel } from "../models/TemplateV";
import { s3 } from "../lib/s3";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

dotenv.config();

/* --------------------------- helpers --------------------------- */

const ABS = /^https?:\/\//i;

const ids = (req: Request) => ({
  userId: (req.params as any).userId || "demo-user",
  templateId: (req.params as any).templateId || "gym-template-1",
});

async function presignOrEmpty(key?: string) {
  if (!key) return "";
  try {
    return await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key }),
      { expiresIn: 300 }
    );
  } catch {
    return "";
  }
}

// Strip accidental absolute/local paths. We only store S3 keys.
function cleanKey(candidate?: string) {
  let k = String(candidate ?? "");
  if (!k) return "";
  k = k.replace(/^\/home\/[^/]+\/apps\/backend\/uploads\//, "");
  if (ABS.test(k)) return "";
  return k.replace(/^\/+/, "");
}

function normalizeServices(svcs: any): string[] | undefined {
  if (!svcs) return undefined;
  if (Array.isArray(svcs)) return svcs.map(String).filter(Boolean);
  if (typeof svcs === "string") {
    try {
      const arr = JSON.parse(svcs);
      if (Array.isArray(arr)) return arr.map(String).filter(Boolean);
    } catch {}
    return [svcs].filter(Boolean);
  }
  return undefined;
}

/* ----- Template CDN absolutizer (assets/... -> CDN URL) ----- */
const TPL_BUCKET = process.env.TEMPLATES_BUCKET || "ion7-templates";
const TPL_REGION = process.env.TEMPLATES_REGION || "ap-south-1";
const templateCdnBase = (templateId: string, tag = "v1") =>
  `https://${TPL_BUCKET}.s3.${TPL_REGION}.amazonaws.com/${templateId}/${tag}/`;

const absolutizeTemplateAsset = (templateId: string, p?: string, tag = "v1") => {
  const path = (p || "").trim();
  if (!path) return "";
  if (ABS.test(path)) return path;
  if (path.startsWith("assets/")) return templateCdnBase(templateId, tag) + path.replace(/^\/+/, "");
  // allow your seed to use relative S3 folder like img/xxx.jpg
  if (/^(img|images|media)\//i.test(path)) return templateCdnBase(templateId, tag) + path;
  return path;
};

/* Pick defaults from TemplateV (versions[] or legacy field) */
function pickVersionDefaults(tpl: any, verTag?: string) {
  let tagUsed = "legacy";
  let defaults: any[] = [];
  if (Array.isArray(tpl?.versions) && tpl.versions.length) {
    const chosen =
      (verTag && tpl.versions.find((v: any) => v.tag === verTag)) ||
      (tpl.currentTag && tpl.versions.find((v: any) => v.tag === tpl.currentTag)) ||
      tpl.versions[0];
    tagUsed = chosen?.tag || "v1";
    defaults = Array.isArray(chosen?.defaultSections) ? chosen.defaultSections : [];
  } else if (Array.isArray(tpl?.defaultSections)) {
    defaults = tpl.defaultSections;
  }
  return { tagUsed, defaults };
}

/* --------------------------- GET --------------------------- */
/**
 * GET /api/appointment/:userId/:templateId
 * Returns: user override + merged template defaults (so editor always sees defaults)
 */
export const getAppointmentSection = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const verTag = String((req.query?.ver ?? "") as string).trim() || undefined;

    // 1) Load user override (may be empty/partial)
    const doc: IAppointment | null = await Appointment.findOne({ userId, templateId });

    // 2) Load template defaults (versioned)
    const tpl = await TemplateModel.findOne({ templateId }).lean<any>();
    const { tagUsed, defaults } = pickVersionDefaults(tpl, verTag);
    const def =
      defaults
        .filter((s: any) => String(s?.type || "").toLowerCase() === "appointment")
        .sort((a: any, b: any) => (a?.order ?? 0) - (b?.order ?? 0))[0]?.content || {};

    // background image (absolute if template provides, or presign the user key)
    let templateBgUrl = "";
    if (def.backgroundImage) {
      templateBgUrl = absolutizeTemplateAsset(templateId, def.backgroundImage, tagUsed);
    }

    let bgUrl = "";
    let bgKey = doc?.backgroundImage || "";
    if (bgKey) {
      // user uploaded => presign
      bgUrl = await presignOrEmpty(bgKey);
    } else if (templateBgUrl) {
      // no user key => use template absolute url
      bgUrl = templateBgUrl;
    }

    // Merge fields (user values win; fall back to template defaults)
    const payload = {
      _source: doc ? "user+template" : "template",
      version: tagUsed,
      userId,
      templateId,

      // text on the left column (your HTML)
      title: (doc?.title ?? "") || String(def.headingLeft ?? ""),
      subtitle: (doc?.subtitle ?? "") || String(def.descriptionLeft ?? ""),
      officeAddress: (doc?.officeAddress ?? "") || String(def.officeAddress ?? ""),
      officeTime: (doc?.officeTime ?? "") || String(def.officeTime ?? ""),

      // services (simple list you show under the preview)
      services:
        (Array.isArray(doc?.services) && doc!.services.length
          ? doc!.services
          : Array.isArray(def.services) ? def.services.map(String)
          : []),

      // keep both: DB key and a ready-to-use URL for preview
      backgroundImage: bgKey,            // S3 key if user uploaded (else "")
      backgroundImageUrl: bgUrl,         // presigned or absolute template url

      // full form block so you can render everything if needed
      form: {
        title: def?.form?.title ?? "Online Appointment",
        fields: Array.isArray(def?.form?.fields) ? def.form.fields : [],
        submitText: def?.form?.submitText ?? "Submit Now",
      },
    };

    return res.status(200).json(payload);
  } catch (error) {
    console.error("Error fetching appointment section:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* --------------------------- PUT --------------------------- */
/** PUT /api/appointment/:userId/:templateId */
export const updateAppointmentSection = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const payload = { ...(req.body || {}) };

    // accept imageKey OR imageUrl (both treated as S3 key)
    const incomingKey = cleanKey(payload.imageKey ?? payload.imageUrl ?? payload.backgroundImage);
    if (incomingKey) payload.backgroundImage = incomingKey;
    delete (payload as any).imageKey;
    delete (payload as any).imageUrl;

    const services = normalizeServices(payload.services);
    if (services !== undefined) payload.services = services;

    const updated = await Appointment.findOneAndUpdate(
      { userId, templateId },
      { $set: {
          title: payload.title ?? "",
          subtitle: payload.subtitle ?? "",
          officeAddress: payload.officeAddress ?? "",
          officeTime: payload.officeTime ?? "",
          services: payload.services ?? [],
          backgroundImage: payload.backgroundImage ?? "",
        } },
      { upsert: true, new: true }
    );

    return res.status(200).json({ message: "✅ Updated", data: updated });
  } catch (error) {
    console.error("Error updating appointment section:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ------------------ uploads (file + base64) ------------------ */

/** POST /api/appointment/:userId/:templateId/image (multipart form-data, field: image) */
export const uploadAppointmentBg = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const file = (req as any).file;
    if (!file) return res.status(400).json({ error: "No image uploaded" });

    const key: string = file.key;
    const updated = await Appointment.findOneAndUpdate(
      { userId, templateId },
      { $set: { backgroundImage: key } },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      message: "✅ Appointment background uploaded",
      key,
      imageKey: updated.backgroundImage || "",
    });
  } catch (error) {
    console.error("Upload Appointment BG error:", error);
    return res.status(500).json({ error: "Failed to upload Appointment background" });
  }
};

/** POST /api/appointment/:userId/:templateId/image-base64 (JSON: {dataUrl|base64, filename}) */
export const uploadAppointmentBgBase64 = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const { dataUrl, base64, filename } = (req.body || {}) as any;

    const safeName = String(filename || "upload").replace(/[^\w.-]+/g, "_");
    let ext = (safeName.match(/\.(jpg|jpeg|png|webp|gif)$/i)?.[0] || "").toLowerCase();
    if (!ext) {
      const mime = (typeof dataUrl === "string" && dataUrl.split(";")[0].split(":")[1]) || "";
      if (/png/i.test(mime)) ext = ".png";
      else if (/webp/i.test(mime)) ext = ".webp";
      else if (/gif/i.test(mime)) ext = ".gif";
      else ext = ".jpg";
    }
    const baseName = safeName.replace(/\.(jpg|jpeg|png|webp|gif)$/i, "");
    const key = `sections/appointment/${Date.now()}-${baseName}${ext}`;

    const b64 =
      (typeof dataUrl === "string" && dataUrl.includes(",")) ? dataUrl.split(",")[1] :
      (typeof base64 === "string" ? base64 : "");
    if (!b64) return res.status(400).json({ error: "Missing base64 image data" });

    const buf = Buffer.from(b64, "base64");

    await s3.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      Key: key,
      Body: buf,
      ContentType:
        ext === ".png" ? "image/png" :
        ext === ".webp" ? "image/webp" :
        ext === ".gif" ? "image/gif" : "image/jpeg",
      ACL: "private",
    }));

    const updated = await Appointment.findOneAndUpdate(
      { userId, templateId },
      { $set: { backgroundImage: key } },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      message: "✅ Appointment background uploaded (base64)",
      key,
      imageKey: updated.backgroundImage || "",
    });
  } catch (error) {
    console.error("Upload Appointment BG (base64) error:", error);
    return res.status(500).json({ error: "Failed to upload Appointment background" });
  }
};

/** POST /api/appointment/:userId/:templateId/clear-image */
export const clearAppointmentBg = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const result = await Appointment.findOneAndUpdate(
      { userId, templateId },
      { $set: { backgroundImage: "" } },
      { new: true }
    );
    return res.status(200).json({
      message: "Appointment background cleared",
      imageKey: result?.backgroundImage || "",
    });
  } catch (error) {
    console.error("Clear Appointment BG error:", error);
    return res.status(500).json({ error: "Failed to clear Appointment background" });
  }
};
