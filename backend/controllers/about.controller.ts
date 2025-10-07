
// // og
// // backend/controllers/about.controller.ts
// import { Request, Response } from "express";
// import About from "../models/About";

// import { s3 } from "../lib/s3";
// import { GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// export const getAbout = async (req: Request, res: Response) => {
//   const { userId, templateId } = req.params;

//   const doc = await About.findOne({ userId, templateId });
//   if (!doc) return res.json({});

//   let signedUrl = "";
//   if (doc.imageUrl) {
//     signedUrl = await getSignedUrl(
//       s3,
//       new GetObjectCommand({
//         Bucket: process.env.S3_BUCKET!,
//         Key: doc.imageUrl as string, // S3 object key stored in DB
//       }),
//       { expiresIn: 60 }
//     );
//   }

//   // Return raw key + a viewable URL
//   const obj = doc.toObject();
//   return res.json({
//     ...obj,
//     imageKey: obj.imageUrl || "",
//     imageUrl: signedUrl,
//   });
// };

// export const upsertAbout = async (req: Request, res: Response) => {
//   const { userId, templateId } = req.params;
//   const { imageKey, imageUrl, ...rest } = req.body as any;

//   const update: any = { ...rest };
//   const key = imageKey || imageUrl;
//   if (key) update.imageUrl = key; // store S3 key

//   const doc = await About.findOneAndUpdate(
//     { userId, templateId },
//     { $set: update },
//     { upsert: true, new: true }
//   );

//   res.json({ message: "✅ About saved", result: doc });
// };

// // -------- image upload helpers (multer-s3 sets req.file.key) --------
// export const uploadAboutImage = async (req: Request, res: Response) => {
//   const { userId, templateId } = req.params;
//   const file = (req as any).file;
//   if (!file) return res.status(400).json({ error: "No file uploaded" });

//   const key: string = file.key;       // e.g. sections/about/....
//   const bucket: string = file.bucket; // project1-uploads-12345

//   const doc = await About.findOneAndUpdate(
//     { userId, templateId },
//     { $set: { imageUrl: key } },      // store S3 key
//     { upsert: true, new: true }
//   );

//   res.json({ message: "✅ Image uploaded", key, bucket, result: doc });
// };

// export const deleteAboutImage = async (req: Request, res: Response) => {
//   const { userId, templateId } = req.params;

//   const doc = await About.findOne({ userId, templateId });
//   if (!doc || !doc.imageUrl) {
//     return res.status(404).json({ error: "No image set" });
//   }

//   // try to delete the object in S3 (optional but cleaner)
//   try {
//     await s3.send(
//       new DeleteObjectCommand({
//         Bucket: process.env.S3_BUCKET!,
//         Key: doc.imageUrl as string,
//       })
//     );
//   } catch {
//     // ignore delete failures; we still clear the DB
//   }

//   doc.imageUrl = "";
//   await doc.save();

//   res.json({ message: "✅ Image removed", result: doc });
// };












// import { Request, Response } from "express";
// import dotenv from "dotenv";
// import About from "../models/About";
// import { TemplateModel } from "../models/Template"; // or: import { TemplateModel } from "../models/template.model";
// import { s3 } from "../lib/s3";
// import {
//   GetObjectCommand,
//   PutObjectCommand,
//   DeleteObjectCommand,
// } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// dotenv.config();

// /** ---------- helpers ---------- */
// const ids = (req: Request) => ({
//   userId: (req.params as any).userId || "demo-user",
//   templateId: (req.params as any).templateId || "gym-template-1",
// });

// async function presignOrEmpty(key?: string) {
//   if (!key) return { imageUrl: "", imageKey: "" };
//   try {
//     const url = await getSignedUrl(
//       s3,
//       new GetObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key }),
//       { expiresIn: 300 }
//     );
//     return { imageUrl: url, imageKey: key };
//   } catch (e) {
//     console.warn("Presign failed for key:", key, e);
//     return { imageUrl: "", imageKey: key || "" };
//   }
// }

// function normalizeBullets(input: any): { text: string }[] | undefined {
//   if (!Array.isArray(input)) return undefined;
//   const out: { text: string }[] = [];
//   for (const b of input) {
//     if (!b) continue;
//     if (typeof b === "string") out.push({ text: b });
//     else if (typeof b === "object" && typeof b.text === "string") out.push({ text: b.text });
//   }
//   return out;
// }

// function cleanKeyCandidate(candidate?: string) {
//   let imageKey = String(candidate ?? "");
//   if (!imageKey) return "";
//   imageKey = imageKey.replace(/^\/home\/[^/]+\/apps\/backend\/uploads\//, "");
//   // if someone sends full http(s) URL, do NOT store as key
//   if (/^https?:\/\//i.test(imageKey)) return "";
//   return imageKey;
// }

// /** ---------- handlers ---------- */

// /** GET: user override OR fallback to template default (type='about') */
// export const getAbout = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);

//     // 1) user override
//     const about = await About.findOne({ userId, templateId });
//     if (about && (about.title || about.subtitle || about.description || about.highlight || about.imageUrl || (about.bullets?.length || 0) > 0)) {
//       const signed = await presignOrEmpty(about.imageUrl);
//       return res.json({
//         _source: "user",
//         title: about.title || "",
//         subtitle: about.subtitle || "",
//         description: about.description || "",
//         highlight: about.highlight || "",
//         imageUrl: signed.imageUrl,
//         imageKey: signed.imageKey,
//         imageAlt: about.imageAlt || "About Image",
//         bullets: (about.bullets || []).map(b => ({ _id: (b as any)._id, text: b.text })),
//       });
//     }

//     // 2) template fallback
//     const tpl = await TemplateModel.findOne({ templateId }).lean<any>();
//     const defaults = Array.isArray(tpl?.defaultSections) ? tpl.defaultSections : [];
//     const fallback = defaults
//       .filter((s: any) => s?.type === "about")
//       .sort((a: any, b: any) => (a?.order ?? 0) - (b?.order ?? 0))[0];

//     if (!fallback) {
//       return res.json({
//         _source: "template-none",
//         title: "",
//         subtitle: "",
//         description: "",
//         highlight: "",
//         imageUrl: "",
//         imageKey: "",
//         imageAlt: "About Image",
//         bullets: [],
//       });
//     }

//     const c = fallback.content || {};
//     const fTitle       = String(c.title ?? "");
//     const fSubtitle    = String(c.subtitle ?? "");
//     const fDescription = String(c.description ?? c.body ?? c.text ?? "");
//     const fHighlight   = String(c.highlight ?? "");
//     let   fImageUrl    = "";
//     let   fImageKey    = "";

//     if (c.imageKey) {
//       const signed = await presignOrEmpty(String(c.imageKey));
//       fImageUrl = signed.imageUrl;
//       fImageKey = signed.imageKey;
//     } else if (c.imageUrl && /^https?:\/\//i.test(c.imageUrl)) {
//       fImageUrl = String(c.imageUrl);
//     }

//     const fBullets: { text: string }[] = normalizeBullets(c.bullets) || [];

//     return res.json({
//       _source: "template",
//       title: fTitle,
//       subtitle: fSubtitle,
//       description: fDescription,
//       highlight: fHighlight,
//       imageUrl: fImageUrl,
//       imageKey: fImageKey,
//       imageAlt: String(c.imageAlt ?? "About Image"),
//       bullets: fBullets,
//     });
//   } catch (e) {
//     console.error("getAbout error:", e);
//     return res.status(500).json({ error: "Failed to fetch About" });
//   }
// };

// /** PUT/POST: upsert About (text + optional image key) */
// export const upsertAbout = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const b = (req.body || {}) as any;

//     // accept either `description` or `body`
//     const title       = typeof b.title === "string" ? b.title : undefined;
//     const subtitle    = typeof b.subtitle === "string" ? b.subtitle : undefined;
//     const description = typeof b.description === "string" ? b.description
//                         : typeof b.body === "string" ? b.body : undefined;
//     const highlight   = typeof b.highlight === "string" ? b.highlight : undefined;
//     const imageKey    = cleanKeyCandidate(b.imageKey ?? b.imageUrl);
//     const imageAlt    = typeof b.imageAlt === "string" ? b.imageAlt : undefined;
//     const bullets     = normalizeBullets(b.bullets);

//     const update: Record<string, any> = {};
//     if (title !== undefined) update.title = title;
//     if (subtitle !== undefined) update.subtitle = subtitle;
//     if (description !== undefined) update.description = description;
//     if (highlight !== undefined) update.highlight = highlight;
//     if (imageKey) update.imageUrl = imageKey;
//     if (imageAlt !== undefined) update.imageAlt = imageAlt;
//     if (bullets !== undefined) update.bullets = bullets;

//     if (!Object.keys(update).length) {
//       return res.status(400).json({ error: "Nothing to update" });
//     }

//     const doc = await About.findOneAndUpdate(
//       { userId, templateId },
//       { $set: update },
//       { new: true, upsert: true, runValidators: true }
//     );

//     return res.json({
//       message: "✅ About saved",
//       data: {
//         title: doc.title,
//         subtitle: doc.subtitle,
//         description: doc.description,
//         highlight: doc.highlight,
//         imageKey: doc.imageUrl || "",
//         imageAlt: doc.imageAlt,
//         bullets: doc.bullets || [],
//       },
//     });
//   } catch (e) {
//     console.error("upsertAbout error:", e);
//     return res.status(500).json({ error: "Failed to save About" });
//   }
// };

// /** POST: reset About (delete user override → fallback to template on next GET) */
// export const resetAbout = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const r = await About.deleteMany({ userId, templateId });
//     return res.json({ ok: true, deleted: r.deletedCount ?? 0 });
//   } catch (e) {
//     console.error("resetAbout error:", e);
//     return res.status(500).json({ error: "Failed to reset About" });
//   }
// };

// /** POST /image (multipart via multer-s3) */
// export const uploadAboutImage = async (req: Request, res: Response) => {
//   const { userId, templateId } = ids(req);
//   const file = (req as any).file;
//   if (!file) return res.status(400).json({ error: "No file uploaded" });

//   const key: string = file.key; // e.g. "sections/about/<timestamp>-name.jpg"
//   try {
//     const doc = await About.findOneAndUpdate(
//       { userId, templateId },
//       { $set: { imageUrl: key } },
//       { new: true, upsert: true }
//     );

//     const signed = await presignOrEmpty(key);
//     return res.json({
//       message: "✅ About image uploaded",
//       key,
//       imageUrl: signed.imageUrl,
//       imageKey: doc.imageUrl || "",
//     });
//   } catch (e) {
//     console.error("uploadAboutImage error:", e);
//     return res.status(500).json({ error: "Failed to upload About image" });
//   }
// };

// /** POST /image-base64 (JSON upload) */
// export const uploadAboutImageBase64 = async (req: Request, res: Response) => {
//   try {
//     const { userId, templateId } = ids(req);
//     const { dataUrl, base64, filename } = (req.body || {}) as any;

//     // smart filename + extension (prevents .jpg.jpg)
//     const safeName = String(filename || "upload").replace(/[^\w.-]+/g, "_");
//     let ext = (safeName.match(/\.(jpg|jpeg|png|webp|gif)$/i)?.[0] || "").toLowerCase();
//     if (!ext) {
//       const mime = (typeof dataUrl === "string" && dataUrl.split(";")[0].split(":")[1]) || "";
//       if (/png/i.test(mime)) ext = ".png";
//       else if (/webp/i.test(mime)) ext = ".webp";
//       else if (/gif/i.test(mime)) ext = ".gif";
//       else ext = ".jpg";
//     }
//     const base = safeName.replace(/\.(jpg|jpeg|png|webp|gif)$/i, "");
//     const key  = `sections/about/${Date.now()}-${base}${ext}`;

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

//     const doc = await About.findOneAndUpdate(
//       { userId, templateId },
//       { $set: { imageUrl: key } },
//       { new: true, upsert: true }
//     );

//     const signed = await presignOrEmpty(key);
//     return res.json({
//       message: "✅ About image uploaded (base64)",
//       key,
//       imageUrl: signed.imageUrl,
//       imageKey: doc.imageUrl || "",
//     });
//   } catch (e) {
//     console.error("uploadAboutImageBase64 error:", e);
//     return res.status(500).json({ error: "Failed to upload base64 image" });
//   }
// };

// /** DELETE: remove the object from S3 (optional) and clear DB key */
// export const deleteAboutImage = async (req: Request, res: Response) => {
//   const { userId, templateId } = ids(req);
//   try {
//     const doc = await About.findOne({ userId, templateId });
//     if (!doc || !doc.imageUrl) {
//       return res.status(404).json({ error: "No image set" });
//     }

//     try {
//       await s3.send(new DeleteObjectCommand({
//         Bucket: process.env.S3_BUCKET!,
//         Key: doc.imageUrl as string,
//       }));
//     } catch {
//       // ignore S3 delete failures
//     }

//     doc.imageUrl = "";
//     await doc.save();

//     return res.json({ message: "✅ Image removed", imageKey: "" });
//   } catch (e) {
//     console.error("deleteAboutImage error:", e);
//     return res.status(500).json({ error: "Failed to remove image" });
//   }
// };

// /** POST: clear only the image key (no S3 delete) */
// export const clearAboutImage = async (req: Request, res: Response) => {
//   const { userId, templateId } = ids(req);
//   try {
//     const doc = await About.findOneAndUpdate(
//       { userId, templateId },
//       { $set: { imageUrl: "" } },
//       { new: true }
//     );
//     return res.json({ message: "Image cleared", imageKey: doc?.imageUrl || "" });
//   } catch (e) {
//     console.error("clearAboutImage error:", e);
//     return res.status(500).json({ error: "Failed to clear image" });
//   }
// };








































// controllers/about.controller.ts
import { Request, Response } from "express";
import dotenv from "dotenv";
import About from "../models/About";
import { TemplateModel } from "../models/Template";
import { s3 } from "../lib/s3";
import {
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

dotenv.config();

/* ------------------------------ helpers ------------------------------ */

const ids = (req: Request) => ({
  userId: (req.params as any).userId || "demo-user",
  templateId: (req.params as any).templateId || "gym-template-1",
});

async function presignOrEmpty(key?: string) {
  if (!key) return { imageUrl: "", imageKey: "" };
  try {
    const url = await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: key,
      }),
      { expiresIn: 300 }
    );
    return { imageUrl: url, imageKey: key };
  } catch (e) {
    console.warn("Presign failed for key:", key, e);
    return { imageUrl: "", imageKey: key || "" };
  }
}

function normalizeBullets(input: any): { text: string }[] | undefined {
  if (!Array.isArray(input)) return undefined;
  const out: { text: string }[] = [];
  for (const b of input) {
    if (!b) continue;
    if (typeof b === "string") out.push({ text: b });
    else if (typeof b === "object" && typeof b.text === "string")
      out.push({ text: b.text });
  }
  return out;
}

function normalizeLines(input: any): string[] | undefined {
  if (!Array.isArray(input)) return undefined;
  return input
    .map((x) => (x == null ? "" : String(x)))
    .slice(0, 3);
}

function normalizeServices(input: any):
  | { tag?: string; title?: string; heading?: string; href?: string }[]
  | undefined {
  if (!Array.isArray(input)) return undefined;
  return input.slice(0, 3).map((s: any) => ({
    tag: String(s?.tag ?? s?.category ?? ""),
    // consolidate to "title" for FE; still accept "heading"
    title: String(s?.title ?? s?.heading ?? ""),
    heading: "", // unused by FE; kept for compatibility
    href: String(s?.href ?? ""),
  }));
}

/** Accept keys only; reject full URLs so we never persist presigned URLs */
function cleanKeyCandidate(candidate?: string) {
  let imageKey = String(candidate ?? "");
  if (!imageKey) return "";
  // strip accidental absolute paths (like a local multer folder)
  imageKey = imageKey.replace(/^\/home\/[^/]+\/apps\/backend\/uploads\//, "");
  // if someone sends full http(s) URL, do NOT store as key
  if (/^https?:\/\//i.test(imageKey)) return "";
  return imageKey;
}

/* ------------------------------ handlers ------------------------------ */

/** GET: user override OR fallback to template default (type='about') */
export const getAbout = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);

    // 1) user override
    const about = await About.findOne({ userId, templateId });
    if (
      about &&
      (about.title ||
        about.subtitle ||
        about.description ||
        about.highlight ||
        about.imageUrl ||
        (about.lines?.length || 0) > 0 ||
        (about.services?.length || 0) > 0 ||
        (about.bullets?.length || 0) > 0)
    ) {
      const signed = await presignOrEmpty(about.imageUrl);
      return res.json({
        _source: "user",
        title: about.title || "",
        subtitle: about.subtitle || "",
        description: about.description || "",
        highlight: about.highlight || "",
        imageUrl: signed.imageUrl,
        imageKey: signed.imageKey,
        imageAlt: about.imageAlt || "About Image",
        lines: about.lines || [],
        services: (about.services || []).map((s) => ({
          tag: s.tag || "",
          title: s.title || s.heading || "",
          href: s.href || "",
        })),
        bullets: (about.bullets || []).map((b: any) => ({
          _id: b?._id,
          text: b?.text || "",
        })),
      });
    }

    // 2) template fallback (if your template json has defaults)
    const tpl = await TemplateModel.findOne({ templateId }).lean<any>();
    const defaults = Array.isArray(tpl?.defaultSections)
      ? tpl.defaultSections
      : [];
    const fallback = defaults
      .filter((s: any) => s?.type === "about")
      .sort((a: any, b: any) => (a?.order ?? 0) - (b?.order ?? 0))[0];

    if (!fallback) {
      return res.json({
        _source: "template-none",
        title: "",
        subtitle: "",
        description: "",
        highlight: "",
        imageUrl: "",
        imageKey: "",
        imageAlt: "About Image",
        lines: [],
        services: [],
        bullets: [],
      });
    }

    const c = fallback.content || {};
    const fTitle = String(c.title ?? "");
    const fSubtitle = String(c.subtitle ?? "");
    const fDescription = String(c.description ?? c.body ?? c.text ?? "");
    const fHighlight = String(c.highlight ?? "");
    const fLines = Array.isArray(c.lines) ? c.lines.map(String).slice(0, 3) : [];
    const fServices = Array.isArray(c.services)
      ? c.services.slice(0, 3).map((s: any) => ({
          tag: String(s?.tag ?? s?.category ?? ""),
          title: String(s?.title ?? s?.heading ?? ""),
          href: String(s?.href ?? ""),
        }))
      : [];

    let fImageUrl = "";
    let fImageKey = "";
    if (c.imageKey) {
      const signed = await presignOrEmpty(String(c.imageKey));
      fImageUrl = signed.imageUrl;
      fImageKey = signed.imageKey;
    } else if (c.imageUrl && /^https?:\/\//i.test(c.imageUrl)) {
      fImageUrl = String(c.imageUrl);
    }

    const fBullets: { text: string }[] = normalizeBullets(c.bullets) || [];

    return res.json({
      _source: "template",
      title: fTitle,
      subtitle: fSubtitle,
      description: fDescription,
      highlight: fHighlight,
      imageUrl: fImageUrl,
      imageKey: fImageKey,
      imageAlt: String(c.imageAlt ?? "About Image"),
      lines: fLines,
      services: fServices,
      bullets: fBullets,
    });
  } catch (e) {
    console.error("getAbout error:", e);
    return res.status(500).json({ error: "Failed to fetch About" });
  }
};

/** PUT/POST: upsert About (text + optional image key) */
export const upsertAbout = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const b = (req.body || {}) as any;

    const title = typeof b.title === "string" ? b.title : undefined;
    const subtitle = typeof b.subtitle === "string" ? b.subtitle : undefined;
    const description =
      typeof b.description === "string"
        ? b.description
        : typeof b.body === "string"
        ? b.body
        : undefined;
    const highlight = typeof b.highlight === "string" ? b.highlight : undefined;
    const imageKey = cleanKeyCandidate(b.imageKey ?? b.imageUrl);
    const imageAlt =
      typeof b.imageAlt === "string" ? b.imageAlt : undefined;

    const bullets = normalizeBullets(b.bullets);
    const lines = normalizeLines(b.lines);
    const services = normalizeServices(b.services);

    const update: Record<string, any> = {};
    if (title !== undefined) update.title = title;
    if (subtitle !== undefined) update.subtitle = subtitle;
    if (description !== undefined) update.description = description;
    if (highlight !== undefined) update.highlight = highlight;
    if (imageKey) update.imageUrl = imageKey;
    if (imageAlt !== undefined) update.imageAlt = imageAlt;
    if (bullets !== undefined) update.bullets = bullets;
    if (lines !== undefined) update.lines = lines;
    if (services !== undefined) update.services = services;

    if (!Object.keys(update).length) {
      return res.status(400).json({ error: "Nothing to update" });
    }

    const doc = await About.findOneAndUpdate(
      { userId, templateId },
      { $set: update },
      { new: true, upsert: true, runValidators: true }
    );

    return res.json({
      message: "✅ About saved",
      data: {
        title: doc.title,
        subtitle: doc.subtitle,
        description: doc.description,
        highlight: doc.highlight,
        imageKey: doc.imageUrl || "",
        imageAlt: doc.imageAlt,
        lines: doc.lines || [],
        services: doc.services || [],
        bullets: doc.bullets || [],
      },
    });
  } catch (e) {
    console.error("upsertAbout error:", e);
    return res.status(500).json({ error: "Failed to save About" });
  }
};

/** POST: reset About (delete user override → fallback to template on next GET) */
export const resetAbout = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const r = await About.deleteMany({ userId, templateId });
    return res.json({ ok: true, deleted: r.deletedCount ?? 0 });
  } catch (e) {
    console.error("resetAbout error:", e);
    return res.status(500).json({ error: "Failed to reset About" });
  }
};

/** POST /image (multipart via multer-s3) */
export const uploadAboutImage = async (req: Request, res: Response) => {
  const { userId, templateId } = ids(req);
  const file = (req as any).file;
  if (!file) return res.status(400).json({ error: "No file uploaded" });

  const key: string = file.key; // e.g. "sections/about/<timestamp>-name.jpg"
  try {
    const doc = await About.findOneAndUpdate(
      { userId, templateId },
      { $set: { imageUrl: key } },
      { new: true, upsert: true }
    );

    const signed = await presignOrEmpty(key);
    return res.json({
      message: "✅ About image uploaded",
      key,
      imageUrl: signed.imageUrl,
      imageKey: doc.imageUrl || "",
    });
  } catch (e) {
    console.error("uploadAboutImage error:", e);
    return res.status(500).json({ error: "Failed to upload About image" });
  }
};

/** POST /image-base64 (JSON upload) */
export const uploadAboutImageBase64 = async (req: Request, res: Response) => {
  try {
    const { userId, templateId } = ids(req);
    const { dataUrl, base64, filename } = (req.body || {}) as any;

    // smart filename + extension (prevents .jpg.jpg)
    const safeName = String(filename || "upload").replace(/[^\w.-]+/g, "_");
    let ext =
      (safeName.match(/\.(jpg|jpeg|png|webp|gif)$/i)?.[0] || "").toLowerCase();
    if (!ext) {
      const mime =
        (typeof dataUrl === "string" &&
          dataUrl.split(";")[0].split(":")[1]) ||
        "";
      if (/png/i.test(mime)) ext = ".png";
      else if (/webp/i.test(mime)) ext = ".webp";
      else if (/gif/i.test(mime)) ext = ".gif";
      else ext = ".jpg";
    }
    const base = safeName.replace(/\.(jpg|jpeg|png|webp|gif)$/i, "");
    const key = `sections/about/${Date.now()}-${base}${ext}`;

    const b64 =
      typeof dataUrl === "string" && dataUrl.includes(",")
        ? dataUrl.split(",")[1]
        : typeof base64 === "string"
        ? base64
        : "";
    if (!b64) return res.status(400).json({ error: "Missing base64 image data" });

    const buf = Buffer.from(b64, "base64");

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: key,
        Body: buf,
        ContentType:
          ext === ".png"
            ? "image/png"
            : ext === ".webp"
            ? "image/webp"
            : ext === ".gif"
            ? "image/gif"
            : "image/jpeg",
        ACL: "private",
      })
    );

    const doc = await About.findOneAndUpdate(
      { userId, templateId },
      { $set: { imageUrl: key } },
      { new: true, upsert: true }
    );

    const signed = await presignOrEmpty(key);
    return res.json({
      message: "✅ About image uploaded (base64)",
      key,
      imageUrl: signed.imageUrl,
      imageKey: doc.imageUrl || "",
    });
  } catch (e) {
    console.error("uploadAboutImageBase64 error:", e);
    return res.status(500).json({ error: "Failed to upload base64 image" });
  }
};

/** DELETE: remove the object from S3 (optional) and clear DB key */
export const deleteAboutImage = async (req: Request, res: Response) => {
  const { userId, templateId } = ids(req);
  try {
    const doc = await About.findOne({ userId, templateId });
    if (!doc || !doc.imageUrl) {
      return res.status(404).json({ error: "No image set" });
    }

    try {
      await s3.send(
        new DeleteObjectCommand({
          Bucket: process.env.S3_BUCKET!,
          Key: doc.imageUrl as string,
        })
      );
    } catch {
      // ignore S3 delete failures
    }

    doc.imageUrl = "";
    await doc.save();

    return res.json({ message: "✅ Image removed", imageKey: "" });
  } catch (e) {
    console.error("deleteAboutImage error:", e);
    return res.status(500).json({ error: "Failed to remove image" });
  }
};

/** POST: clear only the image key (no S3 delete) */
export const clearAboutImage = async (req: Request, res: Response) => {
  const { userId, templateId } = ids(req);
  try {
    const doc = await About.findOneAndUpdate(
      { userId, templateId },
      { $set: { imageUrl: "" } },
      { new: true }
    );
    return res.json({
      message: "Image cleared",
      imageKey: doc?.imageUrl || "",
    });
  } catch (e) {
    console.error("clearAboutImage error:", e);
    return res.status(500).json({ error: "Failed to clear image" });
  }
};
