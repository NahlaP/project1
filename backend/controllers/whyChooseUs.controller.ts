

// import { Request, Response } from "express";
// import WhyChooseUs from "../models/WhyChooseUs";
// import { s3 } from "../lib/s3";
// import {
//   GetObjectCommand,
//   DeleteObjectCommand,
//   PutObjectCommand,
// } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// /* ---------------- helpers ---------------- */
// const ids = (req: Request) => ({
//   userId: (req.params as any).userId,
//   templateId: (req.params as any).templateId,
// });

// async function presignOrEmpty(key?: string) {
//   if (!key) return "";
//   try {
//     return await getSignedUrl(
//       s3,
//       new GetObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: String(key) }),
//       { expiresIn: 300 }
//     );
//   } catch (e) {
//     console.warn("Presign failed:", key, e);
//     return "";
//   }
// }

// function cleanKeyCandidate(candidate?: string) {
//   let key = String(candidate ?? "");
//   if (!key) return "";
//   // strip any accidental local upload folder
//   key = key.replace(/^\/home\/[^/]+\/apps\/backend\/uploads\//, "");
//   // if a full URL was sent, ignore (we store keys only)
//   if (/^https?:\/\//i.test(key)) return "";
//   return key;
// }

// /* ---------------- handlers ---------------- */

// // GET: fetch doc + return presigned bg image URL
// export const getWhyChooseUs = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const data = await WhyChooseUs.findOne({ userId, templateId });

//     if (!data) {
//       return res.json({
//         userId,
//         templateId,
//         description: "",
//         stats: [],
//         progressBars: [],
//         bgImageKey: "",
//         bgImageUrl: "",
//         bgImageAlt: "",
//       });
//     }

//     const obj = data.toObject();
//     const bgImageKey = obj.bgImageUrl || "";
//     const bgImageUrl = await presignOrEmpty(bgImageKey);

//     return res.json({
//       ...obj,
//       bgImageKey,
//       bgImageUrl,
//     });
//   } catch (e) {
//     console.error("getWhyChooseUs error:", e);
//     return res.status(500).json({ error: "Failed to fetch WhyChooseUs" });
//   }
// };

// // PUT: upsert fields; accept bgImageKey or bgImageUrl as the S3 key
// export const updateWhyChooseUs = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const { bgImageKey, bgImageUrl, ...rest } = (req.body || {}) as any;

//     const update: any = { ...rest };
//     const key = cleanKeyCandidate(bgImageKey ?? bgImageUrl);
//     if (key) update.bgImageUrl = key; // store the S3 key in bgImageUrl

//     const updated = await WhyChooseUs.findOneAndUpdate(
//       { userId, templateId },
//       { $set: update },
//       { new: true, upsert: true }
//     );

//     return res.json({ message: "✅ Updated successfully", result: updated });
//   } catch (e) {
//     console.error("updateWhyChooseUs error:", e);
//     return res.status(500).json({ error: "Failed to update WhyChooseUs" });
//   }
// };

// // POST (multipart): upload bg image (multer-s3), store S3 key, return presigned
// export const uploadWhyChooseBg = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const file = (req as any).file;
//     if (!file) return res.status(400).json({ error: "No file uploaded" });

//     const key: string = file.key;       // e.g., sections/whychoose/bg/...
//     const bucket: string = file.bucket;

//     const doc = await WhyChooseUs.findOneAndUpdate(
//       { userId, templateId },
//       { $set: { bgImageUrl: key } },    // store the S3 key
//       { upsert: true, new: true }
//     );

//     const url = await presignOrEmpty(key);

//     return res.json({
//       message: "✅ Background uploaded",
//       key,
//       bucket,
//       result: { ...doc.toObject(), bgImageKey: key, bgImageUrl: url },
//     });
//   } catch (e) {
//     console.error("uploadWhyChooseBg error:", e);
//     return res.status(500).json({ error: "Failed to upload background" });
//   }
// };

// // POST (JSON): base64 upload (no multipart), infer extension safely
// export const uploadWhyChooseBgBase64 = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const { dataUrl, base64, filename } = (req.body || {}) as any;

//     const safeName = String(filename || "upload").replace(/[^\w.-]+/g, "_");
//     let ext = (safeName.match(/\.(jpg|jpeg|png|webp|gif)$/i)?.[0] || "").toLowerCase();
//     if (!ext) {
//       const mime =
//         (typeof dataUrl === "string" && dataUrl.split(";")[0].split(":")[1]) || "";
//       if (/png/i.test(mime)) ext = ".png";
//       else if (/webp/i.test(mime)) ext = ".webp";
//       else if (/gif/i.test(mime)) ext = ".gif";
//       else ext = ".jpg";
//     }
//     const base = safeName.replace(/\.(jpg|jpeg|png|webp|gif)$/i, "");

//     const b64 =
//       (typeof dataUrl === "string" && dataUrl.includes(",")) ? dataUrl.split(",")[1] :
//       (typeof base64 === "string" ? base64 : "");
//     if (!b64) return res.status(400).json({ error: "Missing base64 image data" });

//     const key = `sections/whychoose/bg/${userId}-${templateId}-${Date.now()}-${base}${ext}`;
//     await s3.send(
//       new PutObjectCommand({
//         Bucket: process.env.S3_BUCKET!,
//         Key: key,
//         Body: Buffer.from(b64, "base64"),
//         ContentType:
//           ext === ".png" ? "image/png" :
//           ext === ".webp" ? "image/webp" :
//           ext === ".gif" ? "image/gif" : "image/jpeg",
//         ACL: "private",
//       })
//     );

//     const doc = await WhyChooseUs.findOneAndUpdate(
//       { userId, templateId },
//       { $set: { bgImageUrl: key } },
//       { upsert: true, new: true }
//     );

//     const url = await presignOrEmpty(key);

//     return res.json({
//       message: "✅ Background uploaded (base64)",
//       key,
//       result: { ...doc.toObject(), bgImageKey: key, bgImageUrl: url },
//     });
//   } catch (e) {
//     console.error("uploadWhyChooseBgBase64 error:", e);
//     return res.status(500).json({ error: "Failed to upload background (base64)" });
//   }
// };

// // DELETE: best-effort S3 delete + clear field
// export const deleteWhyChooseBg = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const doc = await WhyChooseUs.findOne({ userId, templateId });
//     if (!doc || !doc.bgImageUrl) {
//       return res.status(404).json({ error: "No bg image to delete" });
//     }

//     try {
//       await s3.send(
//         new DeleteObjectCommand({
//           Bucket: process.env.S3_BUCKET!,
//           Key: doc.bgImageUrl as string,
//         })
//       );
//     } catch {
//       // ignore delete failures; still clear DB
//     }

//     doc.bgImageUrl = "";
//     await doc.save();

//     return res.json({ message: "✅ Background deleted", result: doc });
//   } catch (e) {
//     console.error("deleteWhyChooseBg error:", e);
//     return res.status(500).json({ error: "Failed to delete background" });
//   }
// };















// backend/controllers/whyChooseUs.controller.ts
import { Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();

import WhyChooseUs from "../models/WhyChooseUs";
import { s3 } from "../lib/s3";
import {
  GetObjectCommand,
  DeleteObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
// IMPORTANT: versioned template model
import { TemplateModel } from "../models/TemplateV";

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

const ABS = /^https?:\/\//i;

const ids = (req: Request) => ({
  userId: (req.params as any).userId,
  templateId: (req.params as any).templateId,
});

async function presignOrEmpty(key?: string) {
  if (!key) return "";
  try {
    return await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: String(key) }),
      { expiresIn: 300 }
    );
  } catch (e) {
    console.warn("WhyChooseUs presign failed:", key, e);
    return "";
  }
}

/** Accept keys only; reject full URLs so we never persist presigned/absolute URLs */
function cleanKey(candidate?: string) {
  let k = String(candidate ?? "");
  if (!k) return "";
  // strip legacy local absolute path if any
  k = k.replace(/^\/home\/[^/]+\/apps\/backend\/uploads\//, "");
  if (ABS.test(k)) return ""; // never store http(s)
  return k.replace(/^\/+/, "");
}

const TPL_BUCKET = process.env.TEMPLATES_BUCKET || "ion7-templates";
const TPL_REGION = process.env.TEMPLATES_REGION || "ap-south-1";
const templateCdnBase = (templateId: string, tag = "v1") =>
  `https://${TPL_BUCKET}.s3.${TPL_REGION}.amazonaws.com/${templateId}/${tag}/`;

function absolutizeTemplateAsset(templateId: string, p?: string, tag = "v1") {
  const path = (p || "").trim();
  if (!path) return "";
  if (ABS.test(path)) return path;
  if (path.startsWith("assets/")) {
    return templateCdnBase(templateId, tag) + path.replace(/^\/+/, "");
  }
  return path;
}

/* ----- Pick defaults from versions[] or legacy field and return tag used ----- */
function pickVersionDefaults(tpl: any, verTag?: string): { tagUsed: string; defaults: any[] } {
  let tagUsed = "legacy";
  if (Array.isArray(tpl?.versions) && tpl.versions.length) {
    const chosen =
      (verTag && tpl.versions.find((v: any) => v.tag === verTag)) ||
      (tpl.currentTag && tpl.versions.find((v: any) => v.tag === tpl.currentTag)) ||
      tpl.versions[0];
    tagUsed = chosen?.tag || "v1";
    return {
      tagUsed,
      defaults: Array.isArray(chosen?.defaultSections) ? chosen.defaultSections : [],
    };
  }
  return { tagUsed, defaults: Array.isArray(tpl?.defaultSections) ? tpl.defaultSections : [] };
}

/* Normalizers for content arrays coming from templates */
const normalizeStats = (arr: any): { label: string; value: number }[] =>
  Array.isArray(arr)
    ? arr.map((x: any) => ({
        label: String(x?.label ?? x?.title ?? ""),
        value: Number(x?.value ?? x?.count ?? 0),
      }))
    : [];

const normalizeProgress = (arr: any): { label: string; value: number }[] =>
  Array.isArray(arr)
    ? arr.map((x: any) => ({
        label: String(x?.label ?? x?.title ?? ""),
        value: Number(x?.value ?? x?.percent ?? 0),
      }))
    : [];

/* ------------------------------------------------------------------ */
/* GET — user override → template version defaults → empty            */
/* ------------------------------------------------------------------ */
export const getWhyChooseUs = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const verTag = (req.query?.ver as string | undefined)?.trim();

    // 1) user override
    const doc = await WhyChooseUs.findOne({ userId, templateId }).lean<any>();
    if (doc) {
      const url = await presignOrEmpty(doc.bgImageUrl || "");
      return res.json({
        _source: "user",
        userId, templateId,
        title: doc.title || "",
        description: doc.description || "",
        stats: Array.isArray(doc.stats) ? doc.stats : [],
        progressBars: Array.isArray(doc.progressBars) ? doc.progressBars : [],
        bgImageKey: doc.bgImageUrl || "",
        bgImageUrl: url,
        bgImageAlt: doc.bgImageAlt || "",
      });
    }

    // 2) template version defaults
    const tpl = await TemplateModel.findOne({ templateId }).lean<any>();
    const { tagUsed, defaults } = pickVersionDefaults(tpl, verTag);

    const sec =
      defaults
        .filter((s: any) => String(s?.type || "").toLowerCase() === "whychooseus")
        .sort((a: any, b: any) => (a?.order ?? 0) - (b?.order ?? 0))[0] || null;

    if (sec && sec.content) {
      const c = sec.content || {};

      // Optional background image can be under backgroundImage / image / bg / bgImageUrl etc.
      const rawImg = String(c.backgroundImage ?? c.image ?? c.bg ?? c.bgImageUrl ?? "");
      let bgImageUrl = "";
      let bgImageKey = "";

      if (ABS.test(rawImg)) {
        // absolute from template (e.g., CDN)
        bgImageUrl = rawImg;
      } else if (rawImg.startsWith("assets/")) {
        // versioned asset path
        bgImageUrl = absolutizeTemplateAsset(templateId, rawImg, tagUsed);
      } else if (rawImg) {
        // S3 key provided by template (rare) → return presigned and key
        bgImageKey = rawImg;
        bgImageUrl = await presignOrEmpty(rawImg);
      }

      return res.json({
        _source: "template",
        version: tagUsed,
        userId, templateId,
        title: String(c.title ?? ""),
        description: String(c.description ?? ""),
        stats: normalizeStats(c.stats),
        progressBars: normalizeProgress(c.progress ?? c.progressBars),
        bgImageKey,
        bgImageUrl,
        bgImageAlt: String(c.bgImageAlt ?? c.imageAlt ?? ""),
      });
    }

    // 3) empty defaults
    return res.json({
      _source: "template-none",
      userId, templateId,
      title: "",
      description: "",
      stats: [],
      progressBars: [],
      bgImageKey: "",
      bgImageUrl: "",
      bgImageAlt: "",
    });
  } catch (e) {
    console.error("getWhyChooseUs error:", e);
    return res.status(500).json({ error: "Failed to fetch WhyChooseUs" });
  }
};

/* ------------------------------------------------------------------ */
/* PUT — Upsert (text + optional bg image key)                        */
/* ------------------------------------------------------------------ */
export const updateWhyChooseUs = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const b = (req.body || {}) as any;

    const update: Record<string, any> = {};
    if (typeof b.title === "string") update.title = b.title;
    if (typeof b.description === "string") update.description = b.description;
    if (Array.isArray(b.stats)) update.stats = b.stats;
    if (Array.isArray(b.progressBars)) update.progressBars = b.progressBars;
    if (typeof b.bgImageAlt === "string") update.bgImageAlt = b.bgImageAlt;

    // accept bgImageKey/bgImageUrl but store ONLY S3 key
    const k = cleanKey(b.bgImageKey ?? b.bgImageUrl);
    if (k) update.bgImageUrl = k;

    if (!Object.keys(update).length) {
      return res.status(400).json({ error: "Nothing to update" });
    }

    const doc = await WhyChooseUs.findOneAndUpdate(
      { userId, templateId },
      { $set: update },
      { new: true, upsert: true, runValidators: true }
    );

    return res.json({
      message: "✅ Updated successfully",
      result: {
        ...doc.toObject(),
        bgImageKey: doc.bgImageUrl || "",
        // Note: do not presign here; editor can call GET again or use /file-url
      },
    });
  } catch (e) {
    console.error("updateWhyChooseUs error:", e);
    return res.status(500).json({ error: "Failed to update WhyChooseUs" });
  }
};

/* ------------------------------------------------------------------ */
/* Uploads (multipart & base64), delete & clear                        */
/* ------------------------------------------------------------------ */

// POST (multipart): upload bg image (multer-s3), store S3 key, return presigned
export const uploadWhyChooseBg = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const file = (req as any).file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const key: string = file.key; // e.g., sections/whychoose/bg/...
    const bucket: string = file.bucket;

    const doc = await WhyChooseUs.findOneAndUpdate(
      { userId, templateId },
      { $set: { bgImageUrl: key } }, // store the S3 key
      { upsert: true, new: true }
    );

    const url = await presignOrEmpty(key);

    return res.json({
      message: "✅ Background uploaded",
      key, bucket,
      result: { ...doc.toObject(), bgImageKey: key, bgImageUrl: url },
    });
  } catch (e) {
    console.error("uploadWhyChooseBg error:", e);
    return res.status(500).json({ error: "Failed to upload background" });
  }
};

// POST (JSON): base64 upload (no multipart), infer extension safely
export const uploadWhyChooseBgBase64 = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const { dataUrl, base64, filename } = (req.body || {}) as any;

    const safeName = String(filename || "upload").replace(/[^\w.-]+/g, "_");
    let ext = (safeName.match(/\.(jpg|jpeg|png|webp|gif)$/i)?.[0] || "").toLowerCase();
    if (!ext) {
      const mime =
        (typeof dataUrl === "string" && dataUrl.split(";")[0].split(":")[1]) || "";
      if (/png/i.test(mime)) ext = ".png";
      else if (/webp/i.test(mime)) ext = ".webp";
      else if (/gif/i.test(mime)) ext = ".gif";
      else ext = ".jpg";
    }
    const baseNm = safeName.replace(/\.(jpg|jpeg|png|webp|gif)$/i, "");
    const key = `sections/whychoose/bg/${userId}-${templateId}-${Date.now()}-${baseNm}${ext}`;

    const b64 =
      (typeof dataUrl === "string" && dataUrl.includes(","))
        ? dataUrl.split(",")[1]
        : (typeof base64 === "string" ? base64 : "");
    if (!b64) return res.status(400).json({ error: "Missing base64 image data" });

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: key,
        Body: Buffer.from(b64, "base64"),
        ContentType:
          ext === ".png" ? "image/png" :
          ext === ".webp" ? "image/webp" :
          ext === ".gif" ? "image/gif" : "image/jpeg",
        ACL: "private",
      })
    );

    const doc = await WhyChooseUs.findOneAndUpdate(
      { userId, templateId },
      { $set: { bgImageUrl: key } },
      { upsert: true, new: true }
    );

    const url = await presignOrEmpty(key);

    return res.json({
      message: "✅ Background uploaded (base64)",
      key,
      result: { ...doc.toObject(), bgImageKey: key, bgImageUrl: url },
    });
  } catch (e) {
    console.error("uploadWhyChooseBgBase64 error:", e);
    return res.status(500).json({ error: "Failed to upload background (base64)" });
  }
};

// DELETE: best-effort S3 delete + clear field
export const deleteWhyChooseBg = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const doc = await WhyChooseUs.findOne({ userId, templateId });
    if (!doc || !doc.bgImageUrl) {
      return res.status(404).json({ error: "No bg image to delete" });
    }

    try {
      await s3.send(
        new DeleteObjectCommand({
          Bucket: process.env.S3_BUCKET!,
          Key: doc.bgImageUrl as string,
        })
      );
    } catch {
      // ignore delete failures; still clear DB
    }

    doc.bgImageUrl = "";
    await doc.save();

    return res.json({ message: "✅ Background deleted", result: doc });
  } catch (e) {
    console.error("deleteWhyChooseBg error:", e);
    return res.status(500).json({ error: "Failed to delete background" });
  }
};
